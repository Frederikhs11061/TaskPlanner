'use client'
import { useState } from 'react'
import { Priority } from '@/lib/types'
import { PRIORITY_CONFIG } from '@/lib/constants'

interface Props {
  onAdd: (title: string, desc: string, priority: Priority) => void
  onCancel: () => void
}

export default function AddCardForm({ onAdd, onCancel }: Props) {
  const [title, setTitle]       = useState('')
  const [desc, setDesc]         = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  function submit() {
    if (!title.trim()) return
    onAdd(title.trim(), desc.trim(), priority)
  }

  return (
    <div style={{ background:'#1e1e2a', borderRadius:10, padding:11, border:'1px solid #3a3a50', display:'flex', flexDirection:'column', gap:8 }}>
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
        placeholder="Opgave titel..."
        style={{ width:'100%', background:'#2a2a38', border:'1px solid #3a3a50', borderRadius:7, padding:'8px 11px', color:'#f0f0f5', fontSize:13 }}
      />
      <textarea
        value={desc}
        onChange={e => setDesc(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') onCancel(); }}
        placeholder="Beskrivelse eller indsæt et link…"
        rows={2}
        style={{ width:'100%', background:'#2a2a38', border:'1px solid #3a3a50', borderRadius:7, padding:'8px 11px', color:'#f0f0f5', fontSize:12, resize:'none', lineHeight:1.5 }}
      />

      {/* Priority picker */}
      <div>
        <div style={{ fontSize:10, color:'#555', fontWeight:700, letterSpacing:'.5px', marginBottom:5 }}>PRIORITET</div>
        <div style={{ display:'flex', gap:5 }}>
          {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, p]) => (
            <button
              key={key}
              onClick={() => setPriority(key)}
              style={{
                flex:1, padding:'6px 0', borderRadius:7, cursor:'pointer', fontSize:11, fontWeight:700, border:'none',
                background: priority === key ? p.bg : '#2a2a38',
                color:      priority === key ? p.color : '#555',
                outline:    priority === key ? `1px solid ${p.color}` : '1px solid transparent',
                transition: 'all .15s',
              }}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:6 }}>
        <button
          onClick={submit}
          style={{ background:'#6C63FF', border:'none', borderRadius:7, color:'#fff', padding:'7px 16px', cursor:'pointer', fontWeight:700, fontSize:12 }}
        >
          Tilføj kort
        </button>
        <button
          onClick={onCancel}
          style={{ background:'transparent', border:'none', color:'#666', cursor:'pointer', fontSize:20, lineHeight:1 }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
