export type Priority = 'high' | 'medium' | 'low'

export interface Card {
  id: string
  title: string
  desc: string
  done: boolean
  color: string
  due: string
  priority: Priority
  owner?: string
}

export interface List {
  id: string
  title: string
  cards: Card[]
}

export interface Board {
  id: string
  name: string
  emoji: string
  color: string
  lists: List[]
}

export type CalendarEvents = Record<string, string[]>
