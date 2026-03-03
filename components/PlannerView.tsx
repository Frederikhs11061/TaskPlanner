'use client'
import { useState } from 'react'
import { CalendarEvents } from '@/lib/types'
import { DAYS, MONTHS, getDaysInMonth, getFirstDay, calKey } from '@/lib/constants'

interface Props {
  events: CalendarEvents
  onUpdate: (events: CalendarEvents) => void
}

export default function PlannerView({ events, onUpdate }: Props) {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [newEvent, setNewEvent] = useState('')

  function prevMonth() { if (month === 0) { setYear(y => y-1); setMonth(11) } else setMonth(m => m-1) }
  function nextMonth() { if (month === 11) { setYear(y => y+1); setMonth(0) } else setMonth(m => m+1) }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay    = getFirstDay(year, month)
  const cells       = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const isToday     = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  function addEvent() {
    if (!newEvent.trim() || !selectedDay) return
    const k = calKey(year, month, selectedDay)
    onUpdate({ ...events, [k]: [...(events[k] || []), newEvent.trim()] })
    setNewEvent('')
  }

  function removeEvent(day: number, idx: number) {
    const k = calKey(year, month, day)
    const arr = [...(events[k] || [])]; arr.splice(idx, 1)
    onUpdate({ ...events, [k]: arr })
  }

  const monthEvents = Object.entries(events)
    .filter(([k]) => { const [y, m] = k.split('-').map(Number); return y === year && m === month + 1 })
    .sort((a, b) => parseInt(a[0].split('-')[2]) - parseInt(b[0].split('-')[2]))

  const selectedKey = selectedDay ? calKey(year, month, selectedDay) : null
  const selectedEvents = selectedKey ? (events[selectedKey] || []) : []

  return (
    <div className="planner-root" style={{ flex:1, overflow:'auto', padding:22, display:'flex', gap:18 }}>
      {/* Calendar grid */}
      <div className="planner-main" style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
          <button onClick={prevMonth} style={{ background:'#1e1e2a', border:'1px solid #2a2a38', borderRadius:8, color:'#ccc', padding:'6px 13px', cursor:'pointer', fontSize:17 }}>‹</button>
          <h2 style={{ fontFamily:"'Space Grotesk'", fontSize:22, fontWeight:700, flex:1 }}>{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} style={{ background:'#1e1e2a', border:'1px solid #2a2a38', borderRadius:8, color:'#ccc', padding:'6px 13px', cursor:'pointer', fontSize:17 }}>›</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4 }}>
          {DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'#444', padding:'5px 0', letterSpacing:'.5px' }}>{d.toUpperCase()}</div>)}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={`e-${i}`} />
            const k    = calKey(year, month, d)
            const evts = events[k] || []
            const isSel = selectedDay === d
            const itd   = isToday(d)
            return (
              <div key={d} className="cal-day"
                onClick={() => setSelectedDay(isSel ? null : d)}
                style={{
                  background: isSel ? 'rgba(108,99,255,.28)' : itd ? 'rgba(108,99,255,.1)' : '#1a1a24',
                  border: isSel ? '1px solid #6C63FF' : itd ? '1px solid rgba(108,99,255,.4)' : '1px solid #22222e',
                  borderRadius:10, padding:'7px 6px', minHeight:76, display:'flex', flexDirection:'column',
                }}
              >
                <span style={{ fontSize:13, fontWeight:itd?700:400, color:itd?'#8b85ff':'#bbb', marginBottom:3 }}>{d}</span>
                <div style={{ display:'flex', flexDirection:'column', gap:2, flex:1 }}>
                  {evts.slice(0, 3).map((ev, ei) => (
                    <div key={ei} style={{ fontSize:9, background:'rgba(108,99,255,.2)', borderRadius:3, padding:'2px 5px', color:'#b8b4ff', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ev}</div>
                  ))}
                  {evts.length > 3 && <div style={{ fontSize:9, color:'#555' }}>+{evts.length-3}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Side panel */}
      <div className="planner-side" style={{ width:296, maxWidth:'100%', flexShrink:0, display:'flex', flexDirection:'column', gap:14 }}>
        {selectedDay ? (
          <div style={{ background:'#1a1a24', borderRadius:14, border:'1px solid #2a2a38', overflow:'hidden' }}>
            <div style={{ background:'linear-gradient(135deg,rgba(108,99,255,.28),rgba(199,125,255,.15))', padding:'14px 16px', borderBottom:'1px solid #2a2a38' }}>
              <div style={{ fontSize:11, color:'#888', letterSpacing:'.5px', marginBottom:1 }}>{MONTHS[month]} {year}</div>
              <div style={{ fontFamily:"'Space Grotesk'", fontSize:30, fontWeight:700, lineHeight:1 }}>{selectedDay}</div>
            </div>
            <div style={{ padding:14 }}>
              {selectedEvents.length === 0
                ? <div style={{ color:'#444', fontSize:13, textAlign:'center', padding:'10px 0' }}>Ingen begivenheder</div>
                : selectedEvents.map((ev, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#22222e', borderRadius:8, padding:'8px 11px', marginBottom:6 }}>
                    <span style={{ fontSize:13 }}>{ev}</span>
                    <button onClick={() => removeEvent(selectedDay, i)} style={{ background:'transparent', border:'none', color:'#FF6B6B', cursor:'pointer', fontSize:14 }}>✕</button>
                  </div>
                ))
              }
              <div style={{ display:'flex', gap:7, marginTop:8 }}>
                <input value={newEvent} onChange={e => setNewEvent(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addEvent() }}
                  placeholder="Tilføj begivenhed..."
                  style={{ flex:1, background:'#22222e', border:'1px solid #3a3a50', borderRadius:8, padding:'8px 11px', color:'#f0f0f5', fontSize:13 }} />
                <button onClick={addEvent} style={{ background:'#6C63FF', border:'none', borderRadius:8, color:'#fff', padding:'0 13px', cursor:'pointer', fontWeight:700, fontSize:16 }}>+</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background:'#1a1a24', borderRadius:14, border:'1px dashed #2a2a38', padding:22, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>📅</div>
            <div style={{ color:'#555', fontSize:13 }}>Klik på en dag for at tilføje begivenheder</div>
          </div>
        )}

        <div style={{ background:'#1a1a24', borderRadius:14, border:'1px solid #2a2a38', padding:14, flex:1, overflow:'auto' }}>
          <div style={{ fontSize:11, color:'#555', letterSpacing:'.5px', marginBottom:12, fontWeight:700 }}>DENNE MÅNEDS BEGIVENHEDER</div>
          {monthEvents.length === 0
            ? <div style={{ color:'#444', fontSize:13 }}>Ingen begivenheder endnu</div>
            : monthEvents.flatMap(([k, evts]) => {
                const day = k.split('-')[2]
                return evts.map((ev, i) => (
                  <div key={`${k}-${i}`} style={{ display:'flex', gap:9, alignItems:'center', marginBottom:8 }}>
                    <div style={{ background:'rgba(108,99,255,.18)', borderRadius:6, padding:'3px 8px', fontSize:11, color:'#9d97ff', fontWeight:700, flexShrink:0, minWidth:28, textAlign:'center' }}>{day}</div>
                    <div style={{ fontSize:13, color:'#ccc', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ev}</div>
                  </div>
                ))
              })
          }
        </div>
      </div>
    </div>
  )
}
