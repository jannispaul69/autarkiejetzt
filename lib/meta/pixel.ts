"use client";

// Client-side Meta Pixel helpers
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", eventName, params ?? {}, eventId ? { eventID: eventId } : {});
}

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}
