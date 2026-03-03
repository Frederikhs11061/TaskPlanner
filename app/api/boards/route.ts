import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import type { Board } from '@/lib/types'
import { DEFAULT_BOARDS } from '@/lib/constants'

const BOARDS_KEY = 'taskflow:boards'

function kvAvailable() {
  return !!(process.env.KV_REST_API_URL || process.env.KV_URL)
}

export async function GET() {
  try {
    if (!kvAvailable()) {
      // Ingen KV konfigureret endnu – klienten falder tilbage til localStorage
      return NextResponse.json({ boards: null })
    }

    const boards = await kv.get<Board[]>(BOARDS_KEY)
    return NextResponse.json({ boards: boards ?? DEFAULT_BOARDS })
  } catch (err) {
    console.error('Error fetching boards from KV', err)
    return NextResponse.json({ boards: null }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!kvAvailable()) {
      return NextResponse.json({ ok: false, reason: 'kv-not-configured' })
    }

    const body = await req.json()
    const boards = body?.boards as Board[] | undefined
    if (!boards) {
      return NextResponse.json({ ok: false, reason: 'missing-boards' }, { status: 400 })
    }

    await kv.set(BOARDS_KEY, boards)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error saving boards to KV', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

