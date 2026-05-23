'use client'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

  useEffect(() => {
    if (token) {
      posthog.init(token, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: false, // Next.js App Router handles this manually
        capture_pageleave: true,
        capture_performance: true,
      })
    }
  }, [token])

  if (!token) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}
