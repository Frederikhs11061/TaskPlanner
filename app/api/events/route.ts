import { NextRequest, NextResponse } from 'next/server'
import Redis from 'ioredis'
import type { CalendarEvents } from '@/lib/types'
import { DEFAULT_EVENTS } from '@/lib/constants'

const EVENTS_KEY = 'taskflow:events'

let redis: Redis | null = null
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL)
}

function redisAvailable() {
  return !!redis
}

export async function GET() {
  try {
    if (!redisAvailable()) {
      // Ingen Redis konfigureret – klienten bruger localStorage
      return NextResponse.json({ events: null })
    }

    const data = await redis!.get(EVENTS_KEY)
    const events = data ? (JSON.parse(data) as CalendarEvents) : DEFAULT_EVENTS
    return NextResponse.json({ events })
  } catch (err) {
    console.error('Error fetching events from Redis', err)
    return NextResponse.json({ events: null }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!redisAvailable()) {
      return NextResponse.json({ ok: false, reason: 'redis-not-configured' })
    }

    const body = await req.json()
    const events = body?.events as CalendarEvents | undefined
    if (!events) {
      return NextResponse.json({ ok: false, reason: 'missing-events' }, { status: 400 })
    }

    await redis!.set(EVENTS_KEY, JSON.stringify(events))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error saving events to Redis', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

