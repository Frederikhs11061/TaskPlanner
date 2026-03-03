'use client'
import { Card } from '@/lib/types'
import { PRIORITY_CONFIG, ownerColor } from '@/lib/constants'

interface Props {
  card: Card
  listId: string
  onToggle: () => void
  onDelete: () => void
  onEdit: () => void
  onDragStart: (e: React.DragEvent) => void
}

function renderDesc(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="link-in-desc"
        onClick={e => e.stopPropagation()}
      >
        🔗 {part.replace(/^https?:\/\//, '').replace(/\/$/, '').slice(0, 42)}{part.length > 55 ? '…' : ''}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export default function CardItem({ card, onToggle, onDelete, onEdit, onDragStart }: Props) {
  const p = PRIORITY_CONFIG[card.priority] ?? PRIORITY_CONFIG.medium
  const ownerBg = ownerColor(card.owner)

  return (
    <div
      className="card-item"
      draggable
      onDragStart={onDragStart}
      style={{
        background: '#22222e',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,.04)',
        padding: '10px 11px',
        cursor: 'grab',
        opacity: card.done ? .55 : 1,
        position: 'relative',
      }}
    >
      <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
        {/* Checkbox */}
        <div
          onClick={onToggle}
          style={{
            width:17, height:17, borderRadius:5, flexShrink:0, marginTop:2, cursor:'pointer',
            border: card.done ? 'none' : '2px solid #3a3a50',
            background: card.done ? '#6BCB77' : 'transparent',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff',
          }}
        >
          {card.done && '✓'}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          {/* Color stripe */}
          <div style={{ height:3, width:28, borderRadius:2, background:card.color, marginBottom:6 }} />

          <div style={{
            fontSize:13, fontWeight:500, lineHeight:1.4,
            textDecoration: card.done ? 'line-through' : 'none',
            color: card.done ? '#555' : '#e8e8f0',
          }}>
            {card.title}
          </div>

          {card.desc && (
            <div style={{ fontSize:11, color:'#5a5a70', marginTop:3, lineHeight:1.6 }}>
              {renderDesc(card.desc)}
            </div>
          )}

          <div style={{ display:'flex', gap:6, marginTop:6, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontSize:10, background:p.bg, color:p.color, borderRadius:20, padding:'2px 7px', fontWeight:700 }}>
              {p.icon} {p.label}
            </span>
            {card.due && (
              <span style={{ fontSize:10, color:'#666' }}>📅 {card.due}</span>
            )}
            {card.owner && (
              <span style={{
                fontSize:10,
                background:ownerBg,
                color:'#0f0f13',
                borderRadius:20,
                padding:'2px 7px',
                fontWeight:700,
              }}>
                {card.owner}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons — visible on hover */}
        <div style={{ display:'flex', gap:3, flexShrink:0 }}>
          <button
            className="action-btn"
            onClick={onEdit}
            style={{ background:'#2a2a38', border:'none', borderRadius:6, color:'#aaa', cursor:'pointer', padding:'3px 6px', fontSize:11 }}
          >
            ✏
          </button>
          <button
            className="action-btn"
            onClick={onDelete}
            style={{ background:'#2a2a38', border:'none', borderRadius:6, color:'#FF6B6B', cursor:'pointer', padding:'3px 6px', fontSize:11 }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
