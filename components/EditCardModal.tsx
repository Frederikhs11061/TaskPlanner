'use client'
import { Priority } from '@/lib/types'
import { CARD_COLORS, PRIORITY_CONFIG } from '@/lib/constants'

export interface EditData {
  title: string
  desc: string
  due: string
  color: string
  priority: Priority
  owner: string
}

interface Props {
  data: EditData
  onChange: (d: EditData) => void
  onSave: () => void
  onClose: () => void
}

export default function EditCardModal({ data, onChange, onSave, onClose }: Props) {
  function set(patch: Partial<EditData>) { onChange({ ...data, ...patch }) }

  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.72)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'#1e1e2a', borderRadius:18, padding:28, width:490, border:'1px solid #2a2a38', boxShadow:'0 28px 70px rgba(0,0,0,.65)' }}
      >
        <h3 style={{ marginBottom:22, fontFamily:"'Space Grotesk'", fontSize:18, fontWeight:700 }}>Rediger opgave</h3>

        <Label>TITEL</Label>
        <input value={data.title} onChange={e => set({ title: e.target.value })}
          style={inputStyle} />

        <Label>ANSVARLIG / INITIALER</Label>
        <input value={data.owner} onChange={e => set({ owner: e.target.value })}
          style={inputStyle} />

        <Label>BESKRIVELSE</Label>
        <textarea value={data.desc} onChange={e => set({ desc: e.target.value })} rows={3}
          placeholder="Tekst eller indsæt et link…"
          style={{ ...inputStyle, resize:'vertical', lineHeight:1.5 }} />

        <div style={{ display:'flex', gap:16, marginBottom:16 }}>
          <div style={{ flex:1 }}>
            <Label>PRIORITET</Label>
            <div style={{ display:'flex', gap:6 }}>
              {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, p]) => (
                <button key={key} onClick={() => set({ priority: key })}
                  style={{
                    flex:1, padding:'8px 0', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:700, border:'none',
                    background: data.priority === key ? p.bg : '#2a2a38',
                    color:      data.priority === key ? p.color : '#666',
                    outline:    data.priority === key ? `1px solid ${p.color}` : '1px solid transparent',
                    transition: 'all .15s',
                  }}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>FORFALD</Label>
            <input type="date" value={data.due} onChange={e => set({ due: e.target.value })}
              style={{ background:'#2a2a38', border:'1px solid #3a3a50', borderRadius:8, padding:'8px 12px', color:'#f0f0f5', fontSize:13, colorScheme:'dark' }} />
          </div>
        </div>

        <Label>FARVE</Label>
        <div style={{ display:'flex', gap:7, marginBottom:24 }}>
          {CARD_COLORS.map(c => (
            <div key={c} onClick={() => set({ color: c })}
              style={{ width:24, height:24, borderRadius:6, background:c, cursor:'pointer',
                border: data.color === c ? '2.5px solid #fff' : '2px solid transparent',
                transform: data.color === c ? 'scale(1.2)' : 'scale(1)', transition:'transform .1s' }} />
          ))}
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose}
            style={{ background:'transparent', border:'1px solid #3a3a50', borderRadius:9, color:'#888', padding:'9px 18px', cursor:'pointer', fontSize:14 }}>
            Annuller
          </button>
          <button onClick={onSave}
            style={{ background:'#6C63FF', border:'none', borderRadius:9, color:'#fff', padding:'9px 24px', cursor:'pointer', fontWeight:700, fontSize:14 }}>
            Gem
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width:'100%', background:'#2a2a38', border:'1px solid #3a3a50', borderRadius:8,
  padding:'9px 12px', color:'#f0f0f5', fontSize:14, marginBottom:16, display:'block',
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px', fontWeight:700 }}>{children}</div>
}
