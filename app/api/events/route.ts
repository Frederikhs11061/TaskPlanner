import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import type { CalendarEvents } from '@/lib/types'
import { DEFAULT_EVENTS } from '@/lib/constants'

const EVENTS_KEY = 'taskflow:events'

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
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

    const events = await redis!.get<CalendarEvents>(EVENTS_KEY)
    return NextResponse.json({ events: events ?? DEFAULT_EVENTS })
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

    await redis!.set(EVENTS_KEY, events)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error saving events to Redis', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

