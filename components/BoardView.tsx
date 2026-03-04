'use client'
import { useState } from 'react'
import { Board, Card, Priority } from '@/lib/types'
import ListColumn from './ListColumn'
import EditCardModal, { EditData } from './EditCardModal'
import { uid, CARD_COLORS } from '@/lib/constants'

interface Props {
  board: Board
  onUpdate: (board: Board) => void
}

export default function BoardView({ board, onUpdate }: Props) {
  const [editingCard, setEditingCard] = useState<{ card: Card; listId: string } | null>(null)
  const [editData, setEditData]       = useState<EditData | null>(null)
  const [dragState, setDragState]     = useState<{ cardId: string; fromListId: string } | null>(null)
  const [addingList, setAddingList]   = useState(false)
  const [listTitle, setListTitle]     = useState('')

  function updateLists(fn: (b: Board) => Board) { onUpdate(fn(board)) }

  function addCard(listId: string, title: string, desc: string, priority: Priority, image?: string | null) {
    const card: Card = {
      id: uid(),
      title,
      desc,
      done: false,
      color: CARD_COLORS[0],
      due: '',
      priority,
      image: image ?? undefined,
    }
    updateLists(b => ({ ...b, lists: b.lists.map(l => l.id !== listId ? l : { ...l, cards: [...l.cards, card] }) }))
  }

  function deleteCard(listId: string, cardId: string) {
    updateLists(b => ({ ...b, lists: b.lists.map(l => l.id !== listId ? l : { ...l, cards: l.cards.filter(c => c.id !== cardId) }) }))
  }

  function toggleCard(listId: string, cardId: string) {
    updateLists(b => ({ ...b, lists: b.lists.map(l => l.id !== listId ? l : { ...l, cards: l.cards.map(c => c.id !== cardId ? c : { ...c, done: !c.done }) }) }))
  }

  function deleteList(listId: string) {
    updateLists(b => ({ ...b, lists: b.lists.filter(l => l.id !== listId) }))
  }

  function renameList(listId: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    updateLists(b => ({ ...b, lists: b.lists.map(l => l.id !== listId ? l : { ...l, title: trimmed }) }))
  }

  function addList() {
    if (!listTitle.trim()) return
    updateLists(b => ({ ...b, lists: [...b.lists, { id: uid(), title: listTitle.trim(), cards: [] }] }))
    setListTitle(''); setAddingList(false)
  }

  function openEdit(card: Card, listId: string) {
    setEditingCard({ card, listId })
    setEditData({
      title: card.title,
      desc: card.desc,
      due: card.due,
      color: card.color,
      priority: card.priority,
      image: card.image,
    })
  }

  function saveEdit() {
    if (!editingCard || !editData) return
    updateLists(b => ({ ...b, lists: b.lists.map(l => ({
      ...l,
      cards: l.cards.map(c =>
        c.id !== editingCard.card.id ? c : { ...c, ...editData }
      ),
    }))}))
    setEditingCard(null); setEditData(null)
  }

  function onDrop(toListId: string) {
    if (!dragState || dragState.fromListId === toListId) return
    updateLists(b => {
      const fromList = b.lists.find(l => l.id === dragState.fromListId)
      const card = fromList?.cards.find(c => c.id === dragState.cardId)
      if (!card) return b
      return {
        ...b,
        lists: b.lists.map(l => {
          if (l.id === dragState.fromListId) {
            return { ...l, cards: l.cards.filter(c => c.id !== dragState.cardId) }
          }
          if (l.id === toListId) {
            return { ...l, cards: [...l.cards, card] }
          }
          return l
        }),
      }
    })
    setDragState(null)
  }

  return (
    <div style={{ flex:1, overflowX:'auto', overflowY:'hidden', padding:'18px 18px 0', display:'flex', gap:13, alignItems:'flex-start' }}>
      {board.lists.map(list => (
        <ListColumn
          key={list.id}
          list={list}
          onAddCard={addCard}
          onDeleteCard={deleteCard}
          onToggleCard={toggleCard}
          onDeleteList={deleteList}
          onEditCard={openEdit}
          onDragStart={(cardId, fromListId) => setDragState({ cardId, fromListId })}
          onDrop={onDrop}
          onRenameList={renameList}
        />
      ))}

      {/* Add list */}
      <div style={{ flexShrink:0, width:282 }}>
        {addingList ? (
          <div style={{ background:'#1e1e2a', borderRadius:12, padding:12, border:'1px solid #2a2a38' }}>
            <input autoFocus value={listTitle} onChange={e => setListTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addList(); if (e.key === 'Escape') setAddingList(false) }}
              placeholder="Liste titel..."
              style={{ width:'100%', background:'#2a2a38', border:'1px solid #3a3a50', borderRadius:8, padding:'8px 12px', color:'#f0f0f5', fontSize:14, marginBottom:8 }} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={addList} style={{ background:'#6C63FF', border:'none', borderRadius:8, color:'#fff', padding:'7px 16px', cursor:'pointer', fontWeight:700, fontSize:13 }}>Tilføj</button>
              <button onClick={() => setAddingList(false)} style={{ background:'transparent', border:'none', color:'#888', cursor:'pointer', fontSize:20 }}>✕</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingList(true)}
            style={{ width:'100%', background:'rgba(255,255,255,.04)', border:'1px dashed #3a3a50', borderRadius:12, color:'#777', padding:'14px', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <span style={{ fontSize:18 }}>+</span> Tilføj liste
          </button>
        )}
      </div>

      {/* Edit modal */}
      {editingCard && editData && (
        <EditCardModal data={editData} onChange={setEditData} onSave={saveEdit} onClose={() => setEditingCard(null)} />
      )}
    </div>
  )
}
