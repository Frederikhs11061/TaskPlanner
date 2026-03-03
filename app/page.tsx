'use client'
import { useState, useEffect, useRef } from 'react'
import { Board, CalendarEvents } from '@/lib/types'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { DEFAULT_BOARDS, DEFAULT_EVENTS, CARD_COLORS, uid } from '@/lib/constants'
import { supabase } from '@/lib/supabaseClient'
import BoardView from '@/components/BoardView'
import PlannerView from '@/components/PlannerView'

export default function Home() {
  const [boards, setBoards, boardsLoaded]           = useLocalStorage<Board[]>('taskflow-boards', DEFAULT_BOARDS)
  const [eventsState, setEventsState, eventsLoaded] = useLocalStorage<CalendarEvents>('taskflow-events', DEFAULT_EVENTS)

  const [activeId, setActiveId]       = useState<string>('board-1')
  const [activeTab, setActiveTab]     = useState<'board' | 'planner'>('board')
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [addingBoard, setAddingBoard] = useState(false)
  const [newName, setNewName]         = useState('')
  const [newEmoji, setNewEmoji]       = useState('📋')

  const activeBoard = boards.find(b => b.id === activeId)

  // Flag til at undgå at første sync overskriver Supabase-data
  const initialRemoteSynced = useRef(false)

  // Hent data fra Supabase én gang når localStorage er klar
  useEffect(() => {
    if (!boardsLoaded || !eventsLoaded) return
    if (!supabase) return
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('taskflow_state')
          .select('boards, events')
          .eq('id', 'singleton')
          .maybeSingle()

        if (error) {
          console.error('Error loading state from Supabase', error)
          return
        }

        if (!data) {
          // Ingen række endnu – opret én med nuværende state
          await supabase.from('taskflow_state').upsert({
            id: 'singleton',
            boards: boards,
            events: eventsState,
          })
          return
        }

        if (data.boards) setBoards(data.boards as Board[])
        if (data.events) setEventsState(data.events as CalendarEvents)
      } catch (err) {
        console.error('Unexpected error loading state from Supabase', err)
      }
    })()
  }, [boardsLoaded, eventsLoaded, setBoards, setEventsState])

  // Sync ændringer til Supabase (efter første load)
  useEffect(() => {
    if (!boardsLoaded || !eventsLoaded) return
    if (!supabase) return
    if (!initialRemoteSynced.current) {
      initialRemoteSynced.current = true
      return
    }
    ;(async () => {
      try {
        const { error } = await supabase.from('taskflow_state').upsert({
          id: 'singleton',
          boards,
          events: eventsState,
        })
        if (error) {
          console.error('Error saving state to Supabase', error)
        }
      } catch (err) {
        console.error('Unexpected error saving state to Supabase', err)
      }
    })()
  }, [boards, eventsState, boardsLoaded, eventsLoaded])

  function updateBoard(updated: Board) {
    setBoards(boards.map(b => b.id === updated.id ? updated : b))
  }

  function addBoard() {
    if (!newName.trim()) return
    const b: Board = {
      id: uid(), name: newName.trim(), emoji: newEmoji,
      color: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)],
      lists: [
        { id: uid(), title: 'To Do',  cards: [] },
        { id: uid(), title: 'I gang', cards: [] },
        { id: uid(), title: 'Færdig', cards: [] },
      ],
    }
    setBoards([...boards, b])
    setActiveId(b.id)
    setAddingBoard(false)
    setNewName('')
  }

  function deleteBoard(id: string) {
    const nb = boards.filter(b => b.id !== id)
    setBoards(nb)
    if (activeId === id) setActiveId(nb[0]?.id ?? '')
  }

  const searchResults = searchQuery.trim().length > 1
    ? boards.flatMap(b => b.lists.flatMap(l => l.cards
        .filter(c =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.desc.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(c => ({ ...c, boardName: b.name, boardEmoji: b.emoji, listName: l.title }))
      ))
    : []

  if (!boardsLoaded) return null

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#0f0f13', color:'#f0f0f5' }}>
      <header className="top-bar" style={{ background:'#16161f', borderBottom:'1px solid #2a2a38', padding:'0 18px', display:'flex', alignItems:'center', gap:12, height:52, flexShrink:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginRight:6, flexShrink:0 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#6C63FF,#C77DFF)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>⚡</div>
          <span className="top-bar-title" style={{ fontFamily:"'Space Grotesk'", fontWeight:700, fontSize:15, letterSpacing:'-0.3px' }}>TaskFlow</span>
        </div>

        <nav className="top-bar-tabs" style={{ display:'flex', gap:3, flex:1, overflowX:'auto', alignItems:'center', minWidth:0 }}>
          {boards.map(b => (
            <div
              key={b.id}
              className="board-tab"
              onClick={() => { setActiveId(b.id); setActiveTab('board'); setSearchOpen(false) }}
              style={{
                display:'flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:8, fontSize:13, whiteSpace:'nowrap',
                background: activeId === b.id && activeTab === 'board' && !searchOpen ? 'rgba(108,99,255,.25)' : 'transparent',
                border:     activeId === b.id && activeTab === 'board' && !searchOpen ? '1px solid rgba(108,99,255,.5)' : '1px solid transparent',
              }}
            >
              <span>{b.emoji}</span>
              <span style={{ fontWeight:500 }}>{b.name}</span>
              <span
                onClick={e => { e.stopPropagation(); deleteBoard(b.id) }}
                style={{ marginLeft:2, opacity:.3, fontSize:10, cursor:'pointer' }}
              >✕</span>
            </div>
          ))}

          {addingBoard ? (
            <div style={{ display:'flex', gap:5, alignItems:'center' }}>
              <input value={newEmoji} onChange={e => setNewEmoji(e.target.value)}
                style={{ width:34, background:'#2a2a38', border:'none', borderRadius:6, padding:'4px 5px', color:'#f0f0f5', fontSize:15, textAlign:'center' }} />
              <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addBoard(); if (e.key === 'Escape') setAddingBoard(false) }}
                placeholder="Navn..."
                style={{ background:'#2a2a38', border:'1px solid #3a3a50', borderRadius:6, padding:'4px 10px', color:'#f0f0f5', fontSize:13, width:120 }} />
              <button onClick={addBoard} style={{ background:'#6C63FF', border:'none', borderRadius:6, color:'#fff', padding:'4px 10px', cursor:'pointer', fontSize:12 }}>Tilføj</button>
              <button onClick={() => setAddingBoard(false)} style={{ background:'transparent', border:'none', color:'#888', cursor:'pointer', fontSize:18 }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setAddingBoard(true)}
              style={{ background:'transparent', border:'1px dashed #3a3a50', borderRadius:8, color:'#777', padding:'4px 11px', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap', flexShrink:0 }}>
              + Ny tavle
            </button>
          )}
        </nav>

        <div className="top-bar-actions" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <button
            onClick={() => { setSearchOpen(s => !s); setSearchQuery('') }}
            style={{
              background: searchOpen ? 'rgba(108,99,255,.25)' : '#1e1e2a',
              border: searchOpen ? '1px solid rgba(108,99,255,.5)' : '1px solid #2a2a38',
              borderRadius:9, color: searchOpen ? '#b8b4ff' : '#888',
              padding:'6px 13px', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6, flexShrink:0,
            }}
          >
            🔍 <span style={{ fontSize:12, fontWeight:500 }}>Søg</span>
          </button>

          <div style={{ display:'flex', background:'#1e1e2a', borderRadius:10, padding:3, gap:2, flexShrink:0 }}>
            {(['board', 'planner'] as const).map(t => (
              <button key={t} onClick={() => { setActiveTab(t); setSearchOpen(false) }}
                style={{
                  background: activeTab === t && !searchOpen ? '#6C63FF' : 'transparent',
                  border:'none', borderRadius:7, padding:'5px 13px', cursor:'pointer', fontSize:12, fontWeight:600,
                  color: activeTab === t && !searchOpen ? '#fff' : '#888',
                }}>
                {t === 'board' ? '🗂 Tavle' : '📅 Planner'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {searchOpen && (
        <div style={{ background:'#13131a', borderBottom:'1px solid #2a2a38', padding:'14px 20px', flexShrink:0 }}>
          <input
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Søg på tværs af alle tavler, lister og opgaver..."
            style={{ width:'100%', maxWidth:620, background:'#1e1e2a', border:'1px solid #3a3a50', borderRadius:10, padding:'10px 16px', color:'#f0f0f5', fontSize:14 }}
          />
          {searchQuery.trim().length > 1 && (
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:5, maxHeight:320, overflowY:'auto' }}>
              {searchResults.length === 0
                ? <div style={{ color:'#555', fontSize:13, paddingTop:8 }}>Ingen resultater for &quot;{searchQuery}&quot;</div>
                : searchResults.map(c => {
                    const { PRIORITY_CONFIG } = require('@/lib/constants')
                    const p = PRIORITY_CONFIG[c.priority] ?? PRIORITY_CONFIG.medium
                    return (
                      <div key={c.id} className="search-result"
                        style={{ background:'#1e1e2a', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:12, border:'1px solid #2a2a38' }}>
                        <div style={{ width:3, height:34, borderRadius:2, background:c.color, flexShrink:0 }} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color: c.done?'#555':'#e8e8f0', textDecoration: c.done?'line-through':'none' }}>{c.title}</div>
                          {c.desc && <div style={{ fontSize:11, color:'#555', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.desc}</div>}
                        </div>
                        <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                          <span style={{ fontSize:10, background:p.bg, color:p.color, borderRadius:20, padding:'2px 8px', fontWeight:700 }}>{p.icon} {p.label}</span>
                          <span style={{ fontSize:11, color:'#555' }}>{c.boardEmoji} {c.boardName} · {c.listName}</span>
                          {c.done && <span style={{ fontSize:10, background:'rgba(107,203,119,.13)', color:'#6BCB77', borderRadius:20, padding:'2px 7px' }}>✓ Færdig</span>}
                        </div>
                      </div>
                    )
                  })
              }
            </div>
          )}
        </div>
      )}

      <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {activeTab === 'board' && !searchOpen && activeBoard && (
          <BoardView board={activeBoard} onUpdate={updateBoard} />
        )}
        {activeTab === 'planner' && !searchOpen && (
          <PlannerView events={eventsState} onUpdate={setEventsState} />
        )}
      </main>
    </div>
  )
}

