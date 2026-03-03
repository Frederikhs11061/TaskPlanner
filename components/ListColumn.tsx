'use client'
import { useState, useEffect } from 'react'
import { List, Card, Priority } from '@/lib/types'
import CardItem from './CardItem'
import AddCardForm from './AddCardForm'
import { EditData } from './EditCardModal'

interface Props {
  list: List
  onAddCard: (listId: string, title: string, desc: string, priority: Priority, owner: string) => void
  onDeleteCard: (listId: string, cardId: string) => void
  onToggleCard: (listId: string, cardId: string) => void
  onDeleteList: (listId: string) => void
  onEditCard: (card: Card, listId: string) => void
  onDragStart: (cardId: string, fromListId: string) => void
  onDrop: (toListId: string) => void
  onRenameList: (listId: string, title: string) => void
}

export default function ListColumn({ list, onAddCard, onDeleteCard, onToggleCard, onDeleteList, onEditCard, onDragStart, onDrop, onRenameList }: Props) {
  const [isAdding, setIsAdding]   = useState(false)
  const [isDragOver, setDragOver] = useState(false)
  const [renaming, setRenaming]   = useState(false)
  const [titleDraft, setTitleDraft] = useState(list.title)
  const doneCount = list.cards.filter(c => c.done).length

  useEffect(() => {
    setTitleDraft(list.title)
  }, [list.title])

  function saveRename() {
    const next = titleDraft.trim()
    if (!next) { setRenaming(false); setTitleDraft(list.title); return }
    onRenameList(list.id, next)
    setRenaming(false)
  }

  return (
    <div
      className={`list-col${isDragOver ? ' drag-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => { setDragOver(false); onDrop(list.id) }}
      style={{ flexShrink:0, width:282, background:'#1a1a24', borderRadius:14, border:'1px solid #2a2a38', display:'flex', flexDirection:'column', maxHeight:'calc(100vh - 108px)' }}
    >
      {/* Header */}
      <div style={{ padding:'12px 13px 10px', borderBottom:'1px solid #2a2a38', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          {renaming ? (
            <input
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={saveRename}
              onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') { setRenaming(false); setTitleDraft(list.title) } }}
              style={{ background:'#2a2a38', border:'1px solid #3a3a50', borderRadius:6, padding:'3px 6px', color:'#f0f0f5', fontSize:13, minWidth:80 }}
              autoFocus
            />
          ) : (
            <span
              style={{ fontWeight:700, fontSize:13, cursor:'text' }}
              onDoubleClick={() => setRenaming(true)}
            >
              {list.title}
            </span>
          )}
          <span style={{ background:'#2a2a38', borderRadius:20, padding:'1px 8px', fontSize:11, color:'#666' }}>{list.cards.length}</span>
          {doneCount > 0 && (
            <span style={{ background:'rgba(107,203,119,.12)', color:'#6BCB77', borderRadius:20, padding:'1px 8px', fontSize:11 }}>
              ✓ {doneCount}
            </span>
          )}
        </div>
        <button onClick={() => onDeleteList(list.id)}
          style={{ background:'transparent', border:'none', color:'#444', cursor:'pointer', fontSize:14, lineHeight:1 }}>
          ✕
        </button>
      </div>

      {/* Cards */}
      <div style={{ overflowY:'auto', padding:'9px 9px 4px', flex:1, display:'flex', flexDirection:'column', gap:7 }}>
        {list.cards.map(card => (
          <CardItem
            key={card.id}
            card={card}
            listId={list.id}
            onToggle={() => onToggleCard(list.id, card.id)}
            onDelete={() => onDeleteCard(list.id, card.id)}
            onEdit={() => onEditCard(card, list.id)}
            onDragStart={e => { e.stopPropagation(); onDragStart(card.id, list.id) }}
          />
        ))}
      </div>

      {/* Add card */}
      <div style={{ padding:'5px 9px 9px' }}>
        {isAdding ? (
          <AddCardForm
            onAdd={(title, desc, priority, owner) => {
              onAddCard(list.id, title, desc, priority, owner)
              setIsAdding(false)
            }}
            onCancel={() => setIsAdding(false)}
          />
        ) : (
          <button
            className="add-card-btn"
            onClick={() => setIsAdding(true)}
            style={{ width:'100%', background:'transparent', border:'none', color:'#555', padding:'7px', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:5, borderRadius:8 }}
          >
            <span style={{ fontSize:15 }}>+</span> Tilføj opgave
          </button>
        )}
      </div>
    </div>
  )
}
