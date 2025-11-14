import { NextResponse } from 'next/server'
import { isCalendarConnected } from '@/lib/google-calendar'
import { captureError } from '@/lib/sentry'

export async function GET() {
  try {
    const connected = await isCalendarConnected()

    return NextResponse.json({ connected })
  } catch (error: any) {
    console.error('Calendar status error:', error)
    captureError(error, {
      tags: { component: 'calendar-status-api' },
    })

    return NextResponse.json({ error: 'Failed to check calendar status' }, { status: 500 })
  }
}
