import { getStore } from "@netlify/blobs";

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

export default async (request) => {
  const store = getStore(STORE_NAME);

  if (request.method === "GET") {
    const data = await store.get(REPORTING_KEY, { type: "json" });
    return jsonResponse(data || { reporting: {}, updatedAt: null });
  }

  if (request.method === "POST") {
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
