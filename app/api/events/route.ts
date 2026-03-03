import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import type { CalendarEvents } from '@/lib/types'
import { DEFAULT_EVENTS } from '@/lib/constants'

const EVENTS_KEY = 'taskflow:events'

function kvAvailable() {
  return !!(process.env.KV_REST_API_URL || process.env.KV_URL)
}

export async function GET() {
  try {
    if (!kvAvailable()) {
      // Ingen KV konfigureret – klienten bruger localStorage
      return NextResponse.json({ events: null })
    }

    const events = await kv.get<CalendarEvents>(EVENTS_KEY)
    return NextResponse.json({ events: events ?? DEFAULT_EVENTS })
  } catch (err) {
    console.error('Error fetching events from KV', err)
    return NextResponse.json({ events: null }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!kvAvailable()) {
      return NextResponse.json({ ok: false, reason: 'kv-not-configured' })
    }

    const body = await req.json()
    const events = body?.events as CalendarEvents | undefined
    if (!events) {
      return NextResponse.json({ ok: false, reason: 'missing-events' }, { status: 400 })
    }

    await kv.set(EVENTS_KEY, events)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error saving events to KV', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

