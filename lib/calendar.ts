/**
 * Generates a Google Calendar URL for creating an event
 * @param title - Event title
 * @param description - Event description
 * @param startTime - Start time (Date object)
 * @param durationMinutes - Duration in minutes
 * @returns Google Calendar URL
 */
export function generateGoogleCalendarUrl({
  title,
  description,
  startTime,
  durationMinutes = 5,
}: {
  title: string
  description?: string
  startTime: Date
  durationMinutes?: number
}): string {
  // Calculate end time
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000)

  // Format dates as YYYYMMDDTHHMMSSZ (UTC)
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  // Build URL parameters
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDate(startTime)}/${formatDate(endTime)}`,
  })

  if (description) {
    params.append('details', description)
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generates a calendar event for a 5-minute parent-child connection
 */
export function generateConnectionEventUrl({
  childName,
  activityTitle,
  activityDescription,
  scheduledTime,
  estimatedMinutes = 5,
}: {
  childName: string
  activityTitle: string
  activityDescription?: string
  scheduledTime: Date
  estimatedMinutes?: number
}): string {
  const title = `5-Min Connection: ${activityTitle} with ${childName}`

  const description = activityDescription
    ? `${activityDescription}\n\nThis moment will create a lasting memory! ❤️`
    : `Spend ${estimatedMinutes} quality minutes connecting with ${childName}.\n\nThis moment will create a lasting memory! ❤️`

  return generateGoogleCalendarUrl({
    title,
    description,
    startTime: scheduledTime,
    durationMinutes: estimatedMinutes,
  })
}
