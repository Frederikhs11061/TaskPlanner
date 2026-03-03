import { Board, CalendarEvents } from './types'

export const CARD_COLORS = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF9F45','#06D6A0','#EF476F']

export const PRIORITY_CONFIG = {
  high:   { label: 'Høj',    color: '#FF6B6B', bg: 'rgba(255,107,107,0.15)', icon: '▲' },
  medium: { label: 'Medium', color: '#FFD93D', bg: 'rgba(255,217,61,0.15)',  icon: '●' },
  low:    { label: 'Lav',    color: '#6BCB77', bg: 'rgba(107,203,119,0.15)', icon: '▼' },
} as const

export const DAYS   = ['Man','Tir','Ons','Tor','Fre','Lør','Søn']
export const MONTHS = ['Januar','Februar','Marts','April','Maj','Juni','Juli','August','September','Oktober','November','December']

export function uid() { return Math.random().toString(36).slice(2, 10) }
export function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
export function getFirstDay(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1 }
export function calKey(y: number, m: number, d: number) { return `${y}-${m+1}-${d}` }

export const DEFAULT_BOARDS: Board[] = [
  {
    id: 'board-1', name: 'Arbejde', emoji: '💼', color: '#6C63FF',
    lists: [
      { id: 'list-1', title: 'Backlog', cards: [] },
      { id: 'list-2', title: 'I gang',  cards: [] },
      { id: 'list-3', title: 'Færdig',  cards: [] },
    ],
  },
  {
    id: 'board-2', name: 'Privat', emoji: '🏠', color: '#FF6B9D',
    lists: [
      { id: 'list-4', title: 'Huskeliste', cards: [] },
      { id: 'list-5', title: 'I uge',      cards: [] },
      { id: 'list-6', title: 'Klaret',     cards: [] },
    ],
  },
]

export const DEFAULT_EVENTS: CalendarEvents = {}

const OWNER_COLOR_PALETTE = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF9F45']

export function ownerColor(owner: string | undefined) {
  if (!owner) return '#1e1e2a'
  const up = owner.trim().toUpperCase()

  // Faste farver til bestemte personer
  if (up === 'F') return '#4D96FF'      // blå til F
  if (up === 'CM & F') return '#6C63FF' // lilla til "CM & F"

  let hash = 0
  for (let i = 0; i < up.length; i++) {
    hash = (hash * 31 + up.charCodeAt(i)) >>> 0
  }
  return OWNER_COLOR_PALETTE[hash % OWNER_COLOR_PALETTE.length]
}
