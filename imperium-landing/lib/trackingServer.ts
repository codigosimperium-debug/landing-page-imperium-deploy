import crypto from "node:crypto";

type LeadTrackingInput = {
  sessionId?: string;
  pagePath: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  service_interest: string;
  name: string;
  whatsapp: string;
  email: string;
  unit: string;
  goal?: string;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getTrackingConfig() {
  const ingestUrl = process.env.NEXT_PUBLIC_TRACKING_INGEST_URL || "";
  const publicKey = process.env.NEXT_PUBLIC_TRACKING_PUBLIC_KEY || "";

  if (!ingestUrl || !publicKey) {
    return null;
  }

  return { ingestUrl, publicKey };
}

export async function sendLeadCreatedToTracking(input: LeadTrackingInput) {
  const config = getTrackingConfig();
  if (!config) {
    return;
  }

  const sessionId =
    input.sessionId && isUuid(input.sessionId)
      ? input.sessionId
      : crypto.randomUUID();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1800);

  try {
    await fetch(config.ingestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": config.publicKey,
      },
      body: JSON.stringify({
        session_id: sessionId,
        event_name: "lead_created",
        page_path: input.pagePath,
        referrer: "",
        props: {},
        utm_source: input.utm_source,
        utm_medium: input.utm_medium,
        utm_campaign: input.utm_campaign,
        utm_content: input.utm_content,
        utm_term: input.utm_term,
        lead: {
          service_interest: input.service_interest,
          name: input.name,
          whatsapp: input.whatsapp,
          email: input.email,
          unit: input.unit,
          goal: input.goal || "",
        },
      }),
      signal: controller.signal,
    });
  } catch {
    // Never break the lead pipeline due to tracking delivery errors.
  } finally {
    clearTimeout(timeout);
  }
}
