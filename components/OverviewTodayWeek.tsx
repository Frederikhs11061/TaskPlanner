'use client'
import { Board, CalendarEvents, Card } from '@/lib/types'
import { MONTHS, ownerColor } from '@/lib/constants'

interface Props {
  boards: Board[]
  events: CalendarEvents
}

interface EventItem {
  date: Date
  label: string
  text: string
  owner: string
}

function parseEvent(raw: string): { owner: string; text: string } {
  const sepIndex = raw.indexOf('::')
  if (sepIndex === -1) return { owner: '', text: raw }
  const owner = raw.slice(0, sepIndex).trim()
  const text = raw.slice(sepIndex + 2).trim() || raw
  return { owner, text }
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isWithinRange(target: Date, start: Date, end: Date) {
  return target >= start && target < end
}

function ownerChip(owner: string | undefined) {
  if (!owner) return null
  const bg = ownerColor(owner)
  const initials = owner.toUpperCase()
  return (
    <span style={{
      minWidth:24,
      padding:'2px 7px',
      borderRadius:999,
      background:bg,
      color:'#0f0f13',
      fontSize:11,
      fontWeight:700,
      textAlign:'center',
      display:'inline-block',
    }}>
      {initials}
    </span>
  )
}

export default function OverviewTodayWeek({ boards, events }: Props) {
  const today = new Date()
  today.setHours(0,0,0,0)

  const startThisWeek = new Date(today)
  startThisWeek.setHours(0,0,0,0)
  const endThisWeek = new Date(startThisWeek)
  endThisWeek.setDate(endThisWeek.getDate() + 7)

  const startNextWeek = new Date(endThisWeek)
  const endNextWeek = new Date(startNextWeek)
  endNextWeek.setDate(endNextWeek.getDate() + 7)

  const startNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const endNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1)

  const allCards: { card: Card; boardName: string; listName: string }[] = []
  boards.forEach(b => {
    b.lists.forEach(l => {
      l.cards.forEach(c => {
        allCards.push({ card: c, boardName: b.name, listName: l.title })
      })
    })
  })

  const todayTasks = allCards.filter(({ card }) => card.due && sameDay(new Date(card.due), today))
  const thisWeekTasks = allCards.filter(({ card }) => card.due && !sameDay(new Date(card.due), today) && isWithinRange(new Date(card.due), startThisWeek, endThisWeek))
  const nextWeekTasks = allCards.filter(({ card }) => card.due && isWithinRange(new Date(card.due), startNextWeek, endNextWeek))
  const nextMonthTasks = allCards.filter(({ card }) => card.due && isWithinRange(new Date(card.due), startNextMonth, endNextMonth))

  const allEvents: EventItem[] = []
  Object.entries(events).forEach(([key, arr]) => {
    const [y, m, d] = key.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    date.setHours(0,0,0,0)
    arr.forEach(raw => {
      const { owner, text } = parseEvent(raw)
      allEvents.push({
        date,
        label: `${d}. ${MONTHS[m - 1]}`,
        text,
        owner,
      })
    })
  })

  const todayEvents = allEvents.filter(e => sameDay(e.date, today))
  const thisWeekEvents = allEvents.filter(e => !sameDay(e.date, today) && isWithinRange(e.date, startThisWeek, endThisWeek))
  const nextWeekEvents = allEvents.filter(e => isWithinRange(e.date, startNextWeek, endNextWeek))
  const nextMonthEvents = allEvents.filter(e => isWithinRange(e.date, startNextMonth, endNextMonth))

  const sectionStyle = { background:'#16161f', borderRadius:16, border:'1px solid #2a2a38', padding:16 }
  const gridStyle = { display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:14, flexWrap:'wrap' as const }

  return (
    <div style={{ flex:1, padding:18, display:'flex', flexDirection:'column', gap:18, overflow:'auto' }}>
      <section style={sectionStyle}>
        <h3 style={{ fontFamily:"'Space Grotesk'", fontSize:18, marginBottom:10 }}>I dag</h3>

        <div style={gridStyle}>
          <div>
            <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px' }}>OPGAVER</div>
            {todayTasks.length === 0
              ? <div style={{ fontSize:13, color:'#555' }}>Ingen opgaver i dag</div>
              : todayTasks.map(({ card, boardName, listName }) => (
                  <div key={card.id} style={{ fontSize:13, color:'#ddd', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
                    {ownerChip(card.owner)}
                    <div style={{ display:'flex', flexDirection:'column' }}>
                      <span>{card.title}</span>
                      <span style={{ fontSize:11, color:'#777' }}>{boardName} / {listName}</span>
                    </div>
                  </div>
                ))}
          </div>

          <div>
            <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px' }}>KALENDER</div>
            {todayEvents.length === 0
              ? <div style={{ fontSize:13, color:'#555' }}>Ingen begivenheder i dag</div>
              : todayEvents.map((ev, idx) => (
                  <div key={idx} style={{ fontSize:13, color:'#ddd', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
                    {ownerChip(ev.owner)}
                    <span>{ev.text}</span>
                  </div>
                ))}
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={{ fontFamily:"'Space Grotesk'", fontSize:18, marginBottom:10 }}>Denne uge</h3>

        <div style={gridStyle}>
          <div>
            <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px' }}>OPGAVER</div>
            {thisWeekTasks.length === 0
              ? <div style={{ fontSize:13, color:'#555' }}>Ingen opgaver denne uge</div>
              : thisWeekTasks.map(({ card, boardName, listName }) => (
                  <div key={card.id} style={{ fontSize:13, color:'#ddd', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
                    {ownerChip(card.owner)}
                    <div style={{ display:'flex', flexDirection:'column' }}>
                      <span>{card.title}</span>
                      <span style={{ fontSize:11, color:'#777' }}>{card.due} · {boardName} / {listName}</span>
                    </div>
                  </div>
                ))}
          </div>

          <div>
            <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px' }}>KALENDER</div>
            {thisWeekEvents.length === 0
              ? <div style={{ fontSize:13, color:'#555' }}>Ingen begivenheder denne uge</div>
              : thisWeekEvents.map((ev, idx) => (
                  <div key={idx} style={{ fontSize:13, color:'#ddd', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
                    {ownerChip(ev.owner)}
                    <span>{ev.label}: {ev.text}</span>
                  </div>
                ))}
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={{ fontFamily:"'Space Grotesk'", fontSize:18, marginBottom:10 }}>Næste uge</h3>

        <div style={gridStyle}>
          <div>
            <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px' }}>OPGAVER</div>
            {nextWeekTasks.length === 0
              ? <div style={{ fontSize:13, color:'#555' }}>Ingen opgaver næste uge</div>
              : nextWeekTasks.map(({ card, boardName, listName }) => (
                  <div key={card.id} style={{ fontSize:13, color:'#ddd', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
                    {ownerChip(card.owner)}
                    <div style={{ display:'flex', flexDirection:'column' }}>
                      <span>{card.title}</span>
                      <span style={{ fontSize:11, color:'#777' }}>{card.due} · {boardName} / {listName}</span>
                    </div>
                  </div>
                ))}
          </div>

          <div>
            <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px' }}>KALENDER</div>
            {nextWeekEvents.length === 0
              ? <div style={{ fontSize:13, color:'#555' }}>Ingen begivenheder næste uge</div>
              : nextWeekEvents.map((ev, idx) => (
                  <div key={idx} style={{ fontSize:13, color:'#ddd', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
                    {ownerChip(ev.owner)}
                    <span>{ev.label}: {ev.text}</span>
                  </div>
                ))}
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={{ fontFamily:"'Space Grotesk'", fontSize:18, marginBottom:10 }}>Næste måned</h3>

        <div style={gridStyle}>
          <div>
            <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px' }}>OPGAVER</div>
            {nextMonthTasks.length === 0
              ? <div style={{ fontSize:13, color:'#555' }}>Ingen opgaver næste måned</div>
              : nextMonthTasks.map(({ card, boardName, listName }) => (
                  <div key={card.id} style={{ fontSize:13, color:'#ddd', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
                    {ownerChip(card.owner)}
                    <div style={{ display:'flex', flexDirection:'column' }}>
                      <span>{card.title}</span>
                      <span style={{ fontSize:11, color:'#777' }}>{card.due} · {boardName} / {listName}</span>
                    </div>
                  </div>
                ))}
          </div>

          <div>
            <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px' }}>KALENDER</div>
            {nextMonthEvents.length === 0
              ? <div style={{ fontSize:13, color:'#555' }}>Ingen begivenheder næste måned</div>
              : nextMonthEvents.map((ev, idx) => (
                  <div key={idx} style={{ fontSize:13, color:'#ddd', marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
                    {ownerChip(ev.owner)}
                    <span>{ev.label}: {ev.text}</span>
                  </div>
                ))}
          </div>
        </div>
      </section>
    </div>
  )
}
