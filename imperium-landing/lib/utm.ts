export type UTMState = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
};

const UTM_KEYS: Record<keyof UTMState, string> = {
  utm_source: "imperium_utm_source",
  utm_medium: "imperium_utm_medium",
  utm_campaign: "imperium_utm_campaign",
  utm_content: "imperium_utm_content",
  utm_term: "imperium_utm_term",
};

const EXPIRATION_KEY = "imperium_utm_expires_at";
const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

function emptyUtmState(): UTMState {
  return {
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
  };
}

function isExpired(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const expiresAtRaw = window.localStorage.getItem(EXPIRATION_KEY);
  if (!expiresAtRaw) {
    return true;
  }

  return Number(expiresAtRaw) < Date.now();
}

function clearStoredUtms() {
  if (typeof window === "undefined") {
    return;
  }

  (Object.keys(UTM_KEYS) as (keyof UTMState)[]).forEach((key) => {
    window.localStorage.removeItem(UTM_KEYS[key]);
  });
  window.localStorage.removeItem(EXPIRATION_KEY);
}

export function captureAndStoreUtmParams() {
  if (typeof window === "undefined") {
    return;
  }

  if (isExpired()) {
    clearStoredUtms();
  }

  const params = new URLSearchParams(window.location.search);
  let hasAnyUtm = false;

  (Object.keys(UTM_KEYS) as (keyof UTMState)[]).forEach((key) => {
    const value = params.get(key)?.trim() ?? "";
    if (value) {
      hasAnyUtm = true;
      window.localStorage.setItem(UTM_KEYS[key], value);
    }
  });

  if (hasAnyUtm) {
    window.localStorage.setItem(
      EXPIRATION_KEY,
      String(Date.now() + THIRTY_DAYS_MS),
    );
  }
}

export function getStoredUtmParams(): UTMState {
  if (typeof window === "undefined") {
    return emptyUtmState();
  }

  if (isExpired()) {
    clearStoredUtms();
    return emptyUtmState();
  }

  return {
    utm_source: window.localStorage.getItem(UTM_KEYS.utm_source) ?? "",
    utm_medium: window.localStorage.getItem(UTM_KEYS.utm_medium) ?? "",
    utm_campaign: window.localStorage.getItem(UTM_KEYS.utm_campaign) ?? "",
    utm_content: window.localStorage.getItem(UTM_KEYS.utm_content) ?? "",
    utm_term: window.localStorage.getItem(UTM_KEYS.utm_term) ?? "",
  };
}
