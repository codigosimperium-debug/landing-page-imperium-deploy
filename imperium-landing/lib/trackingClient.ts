"use client";

import { getStoredUtmParams } from "@/lib/utm";

type TrackingEventName =
  | "page_view"
  | "click"
  | "form_start"
  | "form_submit"
  | "form_success"
  | "thank_you_view"
  | "lead_created";

type TrackOptions = {
  pagePath?: string;
  referrer?: string;
  props?: Record<string, unknown>;
  lead?: {
    service_interest: string;
    name: string;
    whatsapp: string;
    email: string;
    unit: string;
    goal?: string;
  };
};

const SESSION_KEY = "imperium_tracking_session_id";

function validUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "00000000-0000-4000-8000-000000000000";
}

function readSessionFromStorage(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(SESSION_KEY) || "";
  if (validUuid(existing)) {
    return existing;
  }

  return "";
}

function persistSession(sessionId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, sessionId);
  document.cookie = `imperium_session_id=${sessionId}; path=/; max-age=2592000; samesite=lax`;
}

export function initSession(): string {
  const existing = readSessionFromStorage();
  if (existing) {
    return existing;
  }

  const created = generateSessionId();
  if (validUuid(created)) {
    persistSession(created);
    return created;
  }

  return "";
}

export function getSessionId(): string {
  return initSession();
}

export async function track(
  eventName: TrackingEventName,
  options: TrackOptions = {},
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const ingestUrl = process.env.NEXT_PUBLIC_TRACKING_INGEST_URL || "";
  const publicKey = process.env.NEXT_PUBLIC_TRACKING_PUBLIC_KEY || "";
  if (!ingestUrl || !publicKey) {
    return;
  }

  const sessionId = initSession();
  if (!sessionId) {
    return;
  }

  const utms = getStoredUtmParams();
  const payload = {
    session_id: sessionId,
    event_name: eventName,
    page_path: options.pagePath ?? window.location.pathname,
    referrer: options.referrer ?? document.referrer ?? "",
    props: options.props ?? {},
    ...utms,
    lead: options.lead,
  };

  try {
    await fetch(ingestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": publicKey,
      },
      keepalive: true,
      body: JSON.stringify(payload),
    });
  } catch {
    // Tracking failure must never break UX.
  }
}
