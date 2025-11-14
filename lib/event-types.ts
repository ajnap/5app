export const EVENT_TYPES = {
  CONNECTION: 'connection',
  PICKUP: 'pickup',
  DROPOFF: 'dropoff',
  ACTIVITY: 'activity',
  ONE_ON_ONE: 'one-on-one',
  FAMILY_NIGHT: 'family-night',
  DATE_NIGHT: 'date-night',
  CUSTOM: 'custom',
} as const

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES]

export interface EventTemplate {
  type: EventType
  icon: string
  label: string
  description: string
  defaultDuration: number // in minutes
  suggestedTitles: string[]
}

export const EVENT_TEMPLATES: Record<EventType, EventTemplate> = {
  connection: {
    type: 'connection',
    icon: '❤️',
    label: '5-Min Connection',
    description: 'Quick quality time with your child',
    defaultDuration: 5,
    suggestedTitles: [
      'Story Time',
      'Chat & Snack',
      'Bedtime Chat',
      'Morning Check-in',
      'After-School Chat',
    ],
  },
  pickup: {
    type: 'pickup',
    icon: '🚗',
    label: 'Pickup',
    description: 'Pick up child from activity or school',
    defaultDuration: 15,
    suggestedTitles: [
      'Pick up from school',
      'Pick up from practice',
      'Pick up from friend\'s house',
      'Pick up from grandparents',
    ],
  },
  dropoff: {
    type: 'dropoff',
    icon: '🚗',
    label: 'Drop-off',
    description: 'Drop off child at activity or school',
    defaultDuration: 15,
    suggestedTitles: [
      'Drop off at school',
      'Drop off at practice',
      'Drop off at friend\'s house',
      'Drop off at grandparents',
    ],
  },
  activity: {
    type: 'activity',
    icon: '⚽',
    label: 'Activity',
    description: 'Sports, lessons, or extracurriculars',
    defaultDuration: 60,
    suggestedTitles: [
      'Soccer practice',
      'Piano lesson',
      'Dance class',
      'Karate class',
      'Art class',
    ],
  },
  'one-on-one': {
    type: 'one-on-one',
    icon: '👨‍👧',
    label: 'One-on-One Time',
    description: 'Special individual time with child',
    defaultDuration: 30,
    suggestedTitles: [
      'Dad-son time',
      'Mom-daughter date',
      'Monthly interview',
      'Ice cream date',
      'Park time',
    ],
  },
  'family-night': {
    type: 'family-night',
    icon: '🏠',
    label: 'Family Night',
    description: 'Whole family activity',
    defaultDuration: 120,
    suggestedTitles: [
      'Game night',
      'Movie night',
      'Family dinner',
      'Family outing',
      'Sunday dinner',
    ],
  },
  'date-night': {
    type: 'date-night',
    icon: '💑',
    label: 'Date Night',
    description: 'Parents-only time',
    defaultDuration: 180,
    suggestedTitles: [
      'Dinner date',
      'Movie date',
      'Date night out',
      'At-home date',
    ],
  },
  custom: {
    type: 'custom',
    icon: '📅',
    label: 'Custom Event',
    description: 'Any other family event',
    defaultDuration: 30,
    suggestedTitles: [
      'Appointment',
      'Meeting',
      'Reminder',
    ],
  },
}

export function getEventIcon(eventType: string): string {
  const template = EVENT_TEMPLATES[eventType as EventType]
  return template?.icon || '📅'
}

export function getEventLabel(eventType: string): string {
  const template = EVENT_TEMPLATES[eventType as EventType]
  return template?.label || 'Event'
}
