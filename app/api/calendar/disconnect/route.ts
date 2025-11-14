import { NextResponse } from 'next/server'
import { disconnectCalendar } from '@/lib/google-calendar'
import { captureError } from '@/lib/sentry'

export async function POST() {
  try {
    await disconnectCalendar()

    return NextResponse.json({ success: true, message: 'Calendar disconnected' })
  } catch (error: any) {
    console.error('Calendar disconnect error:', error)
    captureError(error, {
      tags: { component: 'calendar-disconnect-api' },
    })

    if (error.message?.includes('Not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to disconnect calendar', message: error.message },
      { status: 500 }
    )
  }
}
