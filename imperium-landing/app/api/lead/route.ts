import { NextRequest, NextResponse } from "next/server";
import { appendLeadRow } from "@/lib/sheets";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  type LeadPayload,
  buildLeadValidationInput,
  validateLeadPayload,
} from "@/lib/validators";

export const runtime = "nodejs";

function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ip = getClientIp(request);
    const headerUserAgent = request.headers.get("user-agent") || "";

    const limit = checkRateLimit(`${ip}:${headerUserAgent}`);
    if (!limit.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Muitas tentativas. Tente novamente em instantes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSeconds),
          },
        },
      );
    }

    const candidate = buildLeadValidationInput(body, {
      ip,
      userAgent: headerUserAgent,
    });

    const validation = validateLeadPayload(candidate);
    if (!validation.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: validation.errors[0] ?? "Dados inválidos.",
        },
        { status: 400 },
      );
    }

    const lead: LeadPayload = validation.data;

    await appendLeadRow([
      lead.created_at,
      lead.interesse,
      lead.nomeCompleto,
      lead.whatsapp,
      lead.email,
      lead.unidade,
      lead.page_path,
      lead.utm_source,
      lead.utm_medium,
      lead.utm_campaign,
      lead.utm_content,
      lead.utm_term,
      lead.user_agent,
      lead.ip,
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível enviar agora. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
