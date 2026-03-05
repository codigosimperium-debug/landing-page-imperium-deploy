import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const TRACKING_ORIGIN = process.env.TRACKING_PROXY_TARGET || "http://127.0.0.1:4000";

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

function buildProxyUrl(path: string[] | undefined, search: string): string {
  const safePath = (path ?? []).map((part) => encodeURIComponent(part)).join("/");
  const suffix = safePath ? `/${safePath}` : "";
  return `${TRACKING_ORIGIN}${suffix}${search}`;
}

async function proxyToTracking(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const url = buildProxyUrl(path, request.nextUrl.search);
  const trackingUrl = new URL(TRACKING_ORIGIN);

  const headers = new Headers(request.headers);
  headers.set("host", trackingUrl.host);
  headers.set("x-forwarded-prefix", "/tracking");
  headers.set("x-proxy-prefix", "/tracking");
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));
  headers.set("x-forwarded-host", request.headers.get("host") || "");
  headers.delete("connection");
  headers.delete("content-length");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(url, init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyToTracking(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyToTracking(request, context);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyToTracking(request, context);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  return proxyToTracking(request, context);
}
