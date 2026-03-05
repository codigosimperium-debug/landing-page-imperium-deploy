import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const DEFAULT_SHEETS_TIMEOUT_MS = Number(
  process.env.GOOGLE_SHEETS_TIMEOUT_MS || "5200",
);
const RETRY_DELAY_MS = 220;
const MAX_ATTEMPTS = 2;

let sheetsClient: ReturnType<typeof google.sheets> | null = null;

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function normalizePrivateKey(value: string): string {
  let normalized = stripWrappingQuotes(value).replace(/\r/g, "");

  // Supports values coming as "\\n" or "\\\\n" from env providers.
  while (normalized.includes("\\\\n")) {
    normalized = normalized.replace(/\\\\n/g, "\\n");
  }

  normalized = normalized.replace(/\\n/g, "\n");
  return normalized;
}

function createAuth() {
  const clientEmail = stripWrappingQuotes(getEnv("GOOGLE_CLIENT_EMAIL"));
  const privateKey = normalizePrivateKey(getEnv("GOOGLE_PRIVATE_KEY"));

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  });
}

function getSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  sheetsClient = google.sheets({ version: "v4", auth: createAuth() });
  return sheetsClient;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Sheets timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export type AppendLeadResult = {
  attempts: number;
  durationMs: number;
};

export async function appendLeadRow(rowValues: string[]): Promise<AppendLeadResult> {
  const spreadsheetId = getEnv("GOOGLE_SHEETS_ID");
  const range = process.env.GOOGLE_SHEETS_RANGE || "A:N";
  const startedAt = Date.now();
  const values = rowValues.map((value) => (value ?? "").toString());

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const sheets = getSheetsClient();
      await withTimeout(
        sheets.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          requestBody: {
            values: [values],
          },
        }),
        DEFAULT_SHEETS_TIMEOUT_MS,
      );

      return {
        attempts: attempt,
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      lastError = error;

      if (attempt < MAX_ATTEMPTS) {
        await wait(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Sheets append failed");
}
