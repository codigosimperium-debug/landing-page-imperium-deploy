import { NextRequest, NextResponse } from "next/server";
import { parseLeadRequest } from "@/lib/leadSchema";
import { checkRateLimit } from "@/lib/rateLimit";
import { appendLeadRow } from "@/lib/sheets";
import { sendLeadCreatedToTracking } from "@/lib/trackingServer";

export const runtime = "nodejs";

function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  const t0 = Date.now();

  try {
    const body = await request.json();
    const t1 = Date.now();

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

    const validation = parseLeadRequest(body, {
      ip,
      headerUserAgent,
    });

    if (!validation.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: validation.error,
        },
        { status: 400 },
      );
    }

    const lead = validation.data;
    const t2 = Date.now();

    const sheetResult = await appendLeadRow([
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

    const t3 = Date.now();
    console.info(
      `[lead-api] json=${t1 - t0}ms validate=${t2 - t1}ms sheets=${sheetResult.durationMs}ms attempts=${sheetResult.attempts} total=${t3 - t0}ms`,
    );

    void sendLeadCreatedToTracking({
      sessionId: lead.session_id,
      pagePath: lead.page_path,
      utm_source: lead.utm_source,
      utm_medium: lead.utm_medium,
      utm_campaign: lead.utm_campaign,
      utm_content: lead.utm_content,
      utm_term: lead.utm_term,
      service_interest: lead.interesse,
      name: lead.nomeCompleto,
      whatsapp: lead.whatsapp,
      email: lead.email,
      unit: lead.unidade,
      goal: "",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const tErr = Date.now();
    const message =
      error instanceof Error ? error.message : "unexpected_error";

    console.error(`[lead-api] failed after ${tErr - t0}ms: ${message}`);

    return NextResponse.json(
      {
        ok: false,
        error: "Não foi possível enviar agora. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
