import { google } from 'googleapis'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Get authenticated Google Calendar client for the current user
 */
export async function getCalendarClient() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  // Get OAuth token from database
  const { data: tokenData, error: tokenError } = await supabase
    .from('google_oauth_tokens')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (tokenError || !tokenData) {
    throw new Error('Google Calendar not connected. Please connect your calendar first.')
  }

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000)
  const isExpired = tokenData.expires_at <= now

  let accessToken = tokenData.access_token
  let refreshToken = tokenData.refresh_token

  // Refresh token if expired
  if (isExpired && refreshToken) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
      )

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      })

      const { credentials } = await oauth2Client.refreshAccessToken()

      if (credentials.access_token) {
        accessToken = credentials.access_token

        // Update token in database
        await supabase
          .from('google_oauth_tokens')
          .update({
            access_token: credentials.access_token,
            expires_at: credentials.expiry_date
              ? Math.floor(credentials.expiry_date / 1000)
              : Math.floor(Date.now() / 1000) + 3600,
          })
          .eq('user_id', session.user.id)
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      throw new Error('Failed to refresh access token. Please reconnect your calendar.')
    }
  }

  // Create OAuth2 client with current token
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
  )

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  // Return Calendar API client
  return google.calendar({ version: 'v3', auth: oauth2Client })
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent({
  childName,
  activityTitle,
  activityDescription,
  scheduledTime,
  estimatedMinutes = 5,
  recurrence,
}: {
  childName: string
  activityTitle: string
  activityDescription?: string
  scheduledTime: Date
  estimatedMinutes?: number
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
    count?: number
    until?: Date
  }
}) {
  const calendar = await getCalendarClient()

  const endTime = new Date(scheduledTime.getTime() + estimatedMinutes * 60000)

  // If childName is empty, use activityTitle as-is (already formatted by AddEventModal)
  // Otherwise, use legacy format for backwards compatibility with TodaysPromptCard
  const eventTitle = childName
    ? `5-Min Connection: ${activityTitle} with ${childName}`
    : activityTitle

  const eventDescription = activityDescription
    ? `${activityDescription}\n\nThis moment will create a lasting memory! ❤️`
    : childName
    ? `Spend ${estimatedMinutes} quality minutes connecting with ${childName}.\n\nThis moment will create a lasting memory! ❤️`
    : `${estimatedMinutes}-minute family event.\n\nThis moment will create a lasting memory! ❤️`

  const event: any = {
    summary: eventTitle,
    description: eventDescription,
    start: {
      dateTime: scheduledTime.toISOString(),
      timeZone: 'America/Denver', // TODO: Make this dynamic based on user's timezone
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'America/Denver',
    },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 10 }],
    },
  }

  // Add recurrence if specified
  if (recurrence) {
    const rrule = [`FREQ=${recurrence.frequency}`]
    if (recurrence.count) {
      rrule.push(`COUNT=${recurrence.count}`)
    }
    if (recurrence.until) {
      const untilDate = recurrence.until.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      rrule.push(`UNTIL=${untilDate}`)
    }
    event.recurrence = [`RRULE:${rrule.join(';')}`]
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  })

  return response.data
}

/**
 * Get upcoming calendar events for connection activities
 */
export async function getUpcomingConnectionEvents(maxResults: number = 10) {
  const calendar = await getCalendarClient()

  const now = new Date()
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
    q: '5-Min Connection', // Filter for our connection events
  })

  return response.data.items || []
}

/**
 * Check if user has connected Google Calendar
 */
export async function isCalendarConnected() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return false

    const { data } = await supabase
      .from('google_oauth_tokens')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    return !!data
  } catch {
    return false
  }
}

/**
 * Disconnect Google Calendar (delete OAuth tokens)
 */
export async function disconnectCalendar() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('google_oauth_tokens')
    .delete()
    .eq('user_id', session.user.id)

  if (error) {
    throw new Error('Failed to disconnect calendar')
  }

  return { success: true }
}
