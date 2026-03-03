import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import type { Board } from '@/lib/types'
import { DEFAULT_BOARDS } from '@/lib/constants'

const BOARDS_KEY = 'taskflow:boards'

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
      // Ingen Redis konfigureret endnu – klienten falder tilbage til localStorage
      return NextResponse.json({ boards: null })
    }

    const boards = await redis!.get<Board[]>(BOARDS_KEY)
    return NextResponse.json({ boards: boards ?? DEFAULT_BOARDS })
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

    await redis!.set(BOARDS_KEY, boards)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error saving boards to Redis', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

