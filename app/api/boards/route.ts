import { NextRequest, NextResponse } from 'next/server'
import Redis from 'ioredis'
import type { Board } from '@/lib/types'
import { DEFAULT_BOARDS } from '@/lib/constants'

const BOARDS_KEY = 'taskflow:boards'

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
      // Ingen Redis konfigureret endnu – klienten falder tilbage til localStorage
      return NextResponse.json({ boards: null })
    }

    const data = await redis!.get(BOARDS_KEY)
    const boards = data ? (JSON.parse(data) as Board[]) : DEFAULT_BOARDS
    return NextResponse.json({ boards })
  } catch (err) {
    console.error('Error fetching boards from Redis', err)
    return NextResponse.json({ boards: null }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!redisAvailable()) {
      return NextResponse.json({ ok: false, reason: 'redis-not-configured' })
    }

    const body = await req.json()
    const boards = body?.boards as Board[] | undefined
    if (!boards) {
      return NextResponse.json({ ok: false, reason: 'missing-boards' }, { status: 400 })
    }

    await redis!.set(BOARDS_KEY, JSON.stringify(boards))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error saving boards to Redis', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

