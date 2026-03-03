'use client'
import { useState, useEffect, useRef } from 'react'
import { Board, CalendarEvents } from '@/lib/types'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { DEFAULT_BOARDS, DEFAULT_EVENTS, CARD_COLORS, uid } from '@/lib/constants'
import { supabase } from '@/lib/supabaseClient'
import BoardView from '@/components/BoardView'
import PlannerView from '@/components/PlannerView'
import OverviewTodayWeek from '@/components/OverviewTodayWeek'

export default function Home() {
  const [boards, setBoards, boardsLoaded]           = useLocalStorage<Board[]>('taskflow-boards', DEFAULT_BOARDS)
  const [eventsState, setEventsState, eventsLoaded] = useLocalStorage<CalendarEvents>('taskflow-events', DEFAULT_EVENTS)

  const [activeId, setActiveId]       = useState<string>('board-1')
  const [activeTab, setActiveTab]     = useState<'board' | 'planner' | 'overview'>('board')
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
    const board = boards.find(b => b.id === id)
    if (board) {
      const ok = window.confirm(`Slet tavlen "${board.name}" og alle opgaver?`)
      if (!ok) return
    }
    const nb = boards.filter(b => b.id !== id)
    setBoards(nb)
    if (activeId === id) setActiveId(nb[0]?.id ?? '')
  }

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
              onClick={() => { setActiveId(b.id); setActiveTab('board') }}
              style={{
                display:'flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:8, fontSize:13, whiteSpace:'nowrap',
                background: activeId === b.id && activeTab === 'board' ? 'rgba(108,99,255,.25)' : 'transparent',
                border:     activeId === b.id && activeTab === 'board' ? '1px solid rgba(108,99,255,.5)' : '1px solid transparent',
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
          {/* Tab switcher */}
          <div style={{ display:'flex', background:'#1e1e2a', borderRadius:10, padding:3, gap:2, flexShrink:0 }}>
            {([
              { id: 'board' as const, label: '🗂 Tavle' },
              { id: 'planner' as const, label: '📅 Kalender' },
              { id: 'overview' as const, label: '⭐ I dag / uge' },
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: activeTab === t.id ? '#6C63FF' : 'transparent',
                  border:'none',
                  borderRadius:7,
                  padding:'5px 13px',
                  cursor:'pointer',
                  fontSize:12,
                  fontWeight:600,
                  color: activeTab === t.id ? '#fff' : '#888',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {activeTab === 'board' && activeBoard && (
          <BoardView board={activeBoard} onUpdate={updateBoard} />
        )}
        {activeTab === 'planner' && (
          <PlannerView events={eventsState} onUpdate={setEventsState} />
        )}
        {activeTab === 'overview' && (
          <OverviewTodayWeek boards={boards} events={eventsState} />
        )}
      </main>
    </div>
  )
}
