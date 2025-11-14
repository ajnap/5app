import { NextResponse } from 'next/server'
import { getUpcomingConnectionEvents } from '@/lib/google-calendar'
import { captureError } from '@/lib/sentry'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const maxResults = parseInt(searchParams.get('maxResults') || '5', 10)

    // Get upcoming events from Google Calendar
    const events = await getUpcomingConnectionEvents(maxResults)

    // Format events for frontend
    const formattedEvents = events.map((event: any) => ({
      id: event.id,
      summary: event.summary || 'Untitled Event',
      description: event.description,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      htmlLink: event.htmlLink,
      status: event.status,
    }))

    return NextResponse.json({ events: formattedEvents })
  } catch (error: any) {
    console.error('Fetch upcoming events error:', error)
    captureError(error, {
      tags: { component: 'calendar-upcoming-events-api' },
    })

    // Handle specific error cases
    if (error.message?.includes('not connected')) {
      return NextResponse.json({ error: 'Calendar not connected', events: [] }, { status: 200 })
    }

    if (error.message?.includes('Not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch events', message: error.message },
      { status: 500 }
    )
  }
}
