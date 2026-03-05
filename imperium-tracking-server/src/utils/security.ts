import crypto from "node:crypto";
import type { FastifyRequest } from "fastify";
import { config } from "../config";

export function hashIp(ip: string): string {
  return crypto
    .createHash("sha256")
    .update(`${config.ipHashSalt}:${ip}`)
    .digest("hex");
}

function firstHeaderValue(value: string | string[] | undefined): string {
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value;
}

export function getClientIp(request: FastifyRequest): string {
  const xForwardedFor = firstHeaderValue(request.headers["x-forwarded-for"]);
  if (xForwardedFor) {
    const parts = xForwardedFor.split(",");
    return parts[0]?.trim() || request.ip;
  }

  const xRealIp = firstHeaderValue(request.headers["x-real-ip"]);
  if (xRealIp) {
    return xRealIp.trim();
  }

  return request.ip;
}

export function getUserAgent(request: FastifyRequest): string {
  const header = firstHeaderValue(request.headers["user-agent"]);
  return String(header || "").trim().slice(0, 600);
}

export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function sanitizePath(value: unknown): string {
  const path = sanitizeText(value, 180);
  if (!path) {
    return "/";
  }

  if (!path.startsWith("/")) {
    return "/";
  }

  return path;
}
