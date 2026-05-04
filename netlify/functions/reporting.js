import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const STORE_NAME = "kersenboom-schoolplan";
const REPORTING_KEY = "reporting-state-v1";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init.headers || {}),
    },
  });
}

function cleanReporting(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function verifyToken(request) {
  const secret = process.env.KERSENBOOM_AUTH_SECRET;
  if (!secret) return null;

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!["internal", "external"].includes(parsed.role)) return null;
    if (Number(parsed.exp) < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default async (request) => {
  const session = verifyToken(request);
  if (!session) {
    return jsonResponse({ error: "Niet ingelogd." }, { status: 401 });
  }

  const store = getStore(STORE_NAME);

  if (request.method === "GET") {
    const data = await store.get(REPORTING_KEY, { type: "json" });
    return jsonResponse(data || { reporting: {}, updatedAt: null });
  }

  if (request.method === "POST") {
    if (session.role !== "internal") {
      return jsonResponse({ error: "Alleen intern mag rapportage opslaan." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const payload = {
      reporting: cleanReporting(body?.reporting),
      updatedAt: new Date().toISOString(),
    };

    await store.set(REPORTING_KEY, JSON.stringify(payload), {
      metadata: { updatedAt: payload.updatedAt },
    });

    return jsonResponse({ ok: true, updatedAt: payload.updatedAt });
  }

  return jsonResponse(
    { error: "Deze methode wordt niet ondersteund." },
    { status: 405, headers: { Allow: "GET, POST" } },
  );
};
