"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function canTrack(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

export function trackPageView() {
  if (!canTrack()) {
    return;
  }

  window.fbq?.("track", "PageView");
}

export function trackLead() {
  if (!canTrack()) {
    return;
  }

  window.fbq?.("track", "Lead");
}
