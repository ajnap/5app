/**
 * Web Vitals Tracking Utilities
 * Custom reporting for Core Web Vitals metrics
 */

import { Metric } from 'web-vitals'
import { captureMessage } from './sentry'

/**
 * Reports Core Web Vitals metrics to Sentry and console (in development)
 * Tracks: LCP (Largest Contentful Paint), FID (First Input Delay),
 * CLS (Cumulative Layout Shift), FCP (First Contentful Paint), TTFB (Time to First Byte)
 */
export function reportWebVitals(metric: Metric) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value, 'ms')
  }

  // Report to Sentry for production monitoring
  captureMessage(`Web Vital: ${metric.name}`, 'info', {
    tags: {
      metric_name: metric.name,
      metric_rating: metric.rating,
    },
    extra: {
      value: metric.value,
      id: metric.id,
      navigationType: metric.navigationType,
      delta: metric.delta,
    },
  })
}

/**
 * Thresholds for Core Web Vitals (Google recommendations)
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // ms
  FID: { good: 100, needsImprovement: 300 },   // ms
  CLS: { good: 0.1, needsImprovement: 0.25 },  // score
  FCP: { good: 1800, needsImprovement: 3000 }, // ms
  TTFB: { good: 800, needsImprovement: 1800 }, // ms
}

/**
 * Determines if a metric value is good, needs improvement, or poor
 */
export function getMetricRating(
  metricName: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = WEB_VITALS_THRESHOLDS[metricName as keyof typeof WEB_VITALS_THRESHOLDS]

  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needs-improvement'
  return 'poor'
}
