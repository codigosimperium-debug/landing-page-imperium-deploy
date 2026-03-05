import { z } from "zod";
import {
  type InterestType,
  type LeadPayload,
  type UnitType,
  VALID_INTERESTS,
  VALID_UNITS,
} from "@/lib/validators";

type ParseLeadContext = {
  ip: string;
  headerUserAgent: string;
};

type ParseLeadResult =
  | {
      ok: true;
      data: LeadPayload;
    }
  | {
      ok: false;
      error: string;
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

const leadSchema = z.object({
  interesse: z.enum(VALID_INTERESTS),
  nomeCompleto: z.string().min(3).max(120),
  whatsapp: z
    .string()
    .transform(toDigits)
    .refine((value) => value.length >= 10 && value.length <= 11, {
      message: "Informe um WhatsApp válido.",
    }),
  email: z.string().email().max(160),
  unidade: z.enum(VALID_UNITS),
  session_id: z.string().uuid().optional(),
  page_path: z.string().startsWith("/").max(140),
  utm_source: z.string().max(120),
  utm_medium: z.string().max(120),
  utm_campaign: z.string().max(120),
  utm_content: z.string().max(120),
  utm_term: z.string().max(120),
  user_agent: z.string().min(2).max(600),
});

function getValidationMessage(issuePath: string): string {
  switch (issuePath) {
    case "interesse":
      return "Interesse inválido.";
    case "nomeCompleto":
      return "Informe um nome completo válido.";
    case "whatsapp":
      return "Informe um WhatsApp válido.";
    case "email":
      return "Informe um e-mail válido.";
    case "unidade":
      return "Selecione uma unidade válida.";
    case "session_id":
      return "Sessão inválida.";
    case "page_path":
      return "Origem da página inválida.";
    default:
      return "Dados inválidos.";
  }
}

export function parseLeadRequest(body: unknown, context: ParseLeadContext): ParseLeadResult {
  const payload = (body ?? {}) as LoosePayload;
  const headerUserAgent = toSanitizedText(context.headerUserAgent, 600);
  const payloadUserAgent = toSanitizedText(payload.user_agent, 600);
  const sessionId = toSanitizedText(payload.session_id, 80);

  const candidate = {
    interesse: toSanitizedText(payload.interesse, 80) as InterestType,
    nomeCompleto: toSanitizedText(payload.nomeCompleto, 120),
    whatsapp: toSanitizedText(payload.whatsapp, 30),
    email: toSanitizedText(payload.email, 160).toLowerCase(),
    unidade: toSanitizedText(payload.unidade, 60) as UnitType,
    session_id: sessionId || undefined,
    page_path: toSanitizedText(payload.page_path, 140),
    utm_source: toSanitizedText(payload.utm_source, 120),
    utm_medium: toSanitizedText(payload.utm_medium, 120),
    utm_campaign: toSanitizedText(payload.utm_campaign, 120),
    utm_content: toSanitizedText(payload.utm_content, 120),
    utm_term: toSanitizedText(payload.utm_term, 120),
    user_agent: headerUserAgent || payloadUserAgent,
  };

  const parsed = leadSchema.safeParse(candidate);

  if (!parsed.success) {
    const issuePath = parsed.error.issues[0]?.path?.[0];
    return {
      ok: false,
      error: getValidationMessage(typeof issuePath === "string" ? issuePath : ""),
    };
  }

  const cleanIp = toSanitizedText(context.ip, 80);
  if (!cleanIp) {
    return {
      ok: false,
      error: "Identificação de IP inválida.",
    };
  }

  return {
    ok: true,
    data: {
      created_at: new Date().toISOString(),
      ...parsed.data,
      ip: cleanIp,
    },
  };
}
