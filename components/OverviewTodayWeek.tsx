'use client'
import { Board, CalendarEvents, Card } from '@/lib/types'
import { calKey, MONTHS } from '@/lib/constants'

interface Props {
  boards: Board[]
  events: CalendarEvents
  ownerFilter: string | null
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

function isWithinWeek(target: Date, base: Date) {
  const start = new Date(base)
  start.setHours(0,0,0,0)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return target >= start && target < end
}

export default function OverviewTodayWeek({ boards, events, ownerFilter }: Props) {
  const today = new Date()
  today.setHours(0,0,0,0)

  const ownerMatches = (owner: string | undefined) => {
    if (!ownerFilter) return true
    return (owner || '').toLowerCase() === ownerFilter.toLowerCase()
  }

  const allCards: { card: Card; boardName: string; listName: string }[] = []
  boards.forEach(b => {
    b.lists.forEach(l => {
      l.cards.forEach(c => {
        if (!ownerMatches(c.owner)) return
        allCards.push({ card: c, boardName: b.name, listName: l.title })
      })
    })
  })

  const todayTasks = allCards.filter(({ card }) => card.due && sameDay(new Date(card.due), today))
  const weekTasks = allCards.filter(({ card }) => card.due && !sameDay(new Date(card.due), today) && isWithinWeek(new Date(card.due), today))

  const allEvents: EventItem[] = []
  Object.entries(events).forEach(([key, arr]) => {
    const [y, m, d] = key.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    date.setHours(0,0,0,0)
    arr.forEach(raw => {
      const { owner, text } = parseEvent(raw)
      if (!ownerMatches(owner)) return
      allEvents.push({
        date,
        label: `${d}. ${MONTHS[m - 1]}`,
        text,
        owner,
      })
    })
  })

  const todayEvents = allEvents.filter(e => sameDay(e.date, today))
  const weekEvents = allEvents.filter(e => !sameDay(e.date, today) && isWithinWeek(e.date, today))

  return (
    <div style={{ flex:1, padding:18, display:'flex', flexDirection:'column', gap:18, overflow:'auto' }}>
      <section style={{ background:'#16161f', borderRadius:16, border:'1px solid #2a2a38', padding:16 }}>
        <h3 style={{ fontFamily:"'Space Grotesk'", fontSize:18, marginBottom:10 }}>I dag</h3>

        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:14, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px' }}>OPGAVER</div>
            {todayTasks.length === 0
              ? <div style={{ fontSize:13, color:'#555' }}>Ingen opgaver i dag</div>
              : todayTasks.map(({ card, boardName, listName }) => (
                  <div key={card.id} style={{ fontSize:13, color:'#ddd', marginBottom:6 }}>
                    <span>{card.title}</span>
                    <span style={{ fontSize:11, color:'#777' }}> · {boardName} / {listName}</span>
                  </div>
                ))}
          </div>

          <div>
            <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px' }}>KALENDER</div>
            {todayEvents.length === 0
              ? <div style={{ fontSize:13, color:'#555' }}>Ingen begivenheder i dag</div>
              : todayEvents.map((ev, idx) => (
                  <div key={idx} style={{ fontSize:13, color:'#ddd', marginBottom:6 }}>
                    <span>{ev.text}</span>
                    {ev.owner && <span style={{ fontSize:11, color:'#777' }}> · {ev.owner}</span>}
                  </div>
                ))}
          </div>
        </div>
      </section>

      <section style={{ background:'#16161f', borderRadius:16, border:'1px solid #2a2a38', padding:16 }}>
        <h3 style={{ fontFamily:"'Space Grotesk'", fontSize:18, marginBottom:10 }}>Denne uge</h3>

        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:14, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px' }}>OPGAVER</div>
            {weekTasks.length === 0
              ? <div style={{ fontSize:13, color:'#555' }}>Ingen opgaver denne uge</div>
              : weekTasks.map(({ card, boardName, listName }) => (
                  <div key={card.id} style={{ fontSize:13, color:'#ddd', marginBottom:6 }}>
                    <span>{card.title}</span>
                    <span style={{ fontSize:11, color:'#777' }}> · {card.due} · {boardName} / {listName}</span>
                  </div>
                ))}
          </div>

          <div>
            <div style={{ fontSize:11, color:'#666', marginBottom:6, letterSpacing:'.5px' }}>KALENDER</div>
            {weekEvents.length === 0
              ? <div style={{ fontSize:13, color:'#555' }}>Ingen begivenheder denne uge</div>
              : weekEvents.map((ev, idx) => (
                  <div key={idx} style={{ fontSize:13, color:'#ddd', marginBottom:6 }}>
                    <span>{ev.label}: {ev.text}</span>
                    {ev.owner && <span style={{ fontSize:11, color:'#777' }}> · {ev.owner}</span>}
                  </div>
                ))}
          </div>
        </div>
      </section>
    </div>
  )
}
