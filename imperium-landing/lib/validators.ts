export const VALID_INTERESTS = [
  "Pilates",
  "Eletroestimulação",
  "Treinamento Funcional",
] as const;

export const VALID_UNITS = [
  "Colina de Laranjeiras",
  "Chácara Parreiral",
  "Jacaraípe",
] as const;

export type InterestType = (typeof VALID_INTERESTS)[number];
export type UnitType = (typeof VALID_UNITS)[number];

export type LeadPayload = {
  created_at: string;
  interesse: InterestType;
  nomeCompleto: string;
  whatsapp: string;
  unidade: UnitType;
  page_path: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  user_agent: string;
  ip: string;
};

export type LeadPayloadInput = Omit<LeadPayload, "created_at" | "ip">;

type ValidationResult =
  | { ok: true; data: LeadPayload }
  | { ok: false; errors: string[] };

type BuildInputContext = {
  ip: string;
  userAgent: string;
};

type LoosePayload = Record<string, unknown>;

function toSanitizedText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function toDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatWhatsApp(value: string): string {
  const digits = toDigits(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function buildLeadValidationInput(
  body: unknown,
  context: BuildInputContext,
): LeadPayload {
  const payload = (body ?? {}) as LoosePayload;
  const headerUserAgent = toSanitizedText(context.userAgent, 600);
  const payloadUserAgent = toSanitizedText(payload.user_agent, 600);

  return {
    created_at: new Date().toISOString(),
    interesse: toSanitizedText(payload.interesse, 80) as InterestType,
    nomeCompleto: toSanitizedText(payload.nomeCompleto, 120),
    whatsapp: toSanitizedText(payload.whatsapp, 30),
    unidade: toSanitizedText(payload.unidade, 60) as UnitType,
    page_path: toSanitizedText(payload.page_path, 120),
    utm_source: toSanitizedText(payload.utm_source, 120),
    utm_medium: toSanitizedText(payload.utm_medium, 120),
    utm_campaign: toSanitizedText(payload.utm_campaign, 120),
    utm_content: toSanitizedText(payload.utm_content, 120),
    utm_term: toSanitizedText(payload.utm_term, 120),
    user_agent: headerUserAgent || payloadUserAgent,
    ip: toSanitizedText(context.ip, 80),
  };
}

export function validateLeadPayload(input: LeadPayload): ValidationResult {
  const errors: string[] = [];

  if (!VALID_INTERESTS.includes(input.interesse)) {
    errors.push("Interesse inválido.");
  }

  if (input.nomeCompleto.length < 3) {
    errors.push("Informe um nome completo válido.");
  }

  const whatsappDigits = toDigits(input.whatsapp);
  if (whatsappDigits.length < 10 || whatsappDigits.length > 11) {
    errors.push("Informe um WhatsApp válido.");
  }

  if (!VALID_UNITS.includes(input.unidade)) {
    errors.push("Selecione uma unidade válida.");
  }

  if (!input.page_path.startsWith("/")) {
    errors.push("Origem da página inválida.");
  }

  if (!input.created_at) {
    errors.push("Data de criação inválida.");
  }

  if (!input.user_agent) {
    errors.push("Identificação do navegador inválida.");
  }

  if (!input.ip) {
    errors.push("Identificação de IP inválida.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      ...input,
      whatsapp: whatsappDigits,
    },
  };
}
