import { NextResponse } from 'next/server'
import { createCalendarEvent } from '@/lib/google-calendar'
import { captureError } from '@/lib/sentry'
import { z } from 'zod'
import { formatZodError } from '@/lib/validation'

const createEventSchema = z.object({
  childName: z.string().min(1),
  activityTitle: z.string().min(1),
  activityDescription: z.string().optional(),
  scheduledTime: z.string().datetime(),
  estimatedMinutes: z.number().min(1).max(120).default(5),
  recurrence: z
    .object({
      frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
      count: z.number().optional(),
      until: z.string().datetime().optional(),
    })
    .optional(),
})

export async function POST(request: Request) {
  try {
    // Parse and validate request
    const body = await request.json()
    const validation = createEventSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(formatZodError(validation.error), { status: 400 })
    }

    const { childName, activityTitle, activityDescription, scheduledTime, estimatedMinutes, recurrence } =
      validation.data

    // Create calendar event
    const event = await createCalendarEvent({
      childName,
      activityTitle,
      activityDescription,
      scheduledTime: new Date(scheduledTime),
      estimatedMinutes,
      recurrence: recurrence
        ? {
            frequency: recurrence.frequency,
            count: recurrence.count,
            until: recurrence.until ? new Date(recurrence.until) : undefined,
          }
        : undefined,
    })

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        htmlLink: event.htmlLink,
        summary: event.summary,
        start: event.start,
        end: event.end,
      },
    })
  } catch (error: any) {
    console.error('Create calendar event error:', error)
    captureError(error, {
      tags: { component: 'calendar-create-event-api' },
    })

    // Handle specific error cases
    if (error.message?.includes('not connected')) {
      return NextResponse.json(
        { error: 'Calendar not connected', message: error.message },
        { status: 403 }
      )
    }

    if (error.message?.includes('Not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to create calendar event', message: error.message },
      { status: 500 }
    )
  }
}
