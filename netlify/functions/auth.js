import crypto from "node:crypto";

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 8;

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

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function createToken(role, secret) {
  const payload = base64url(JSON.stringify({
    role,
    exp: Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE_SECONDS,
  }));
  return `${payload}.${sign(payload, secret)}`;
}

function configuredPasswords() {
  return {
    internal: process.env.KERSENBOOM_INTERNAL_PASSWORD,
    external: process.env.KERSENBOOM_EXTERNAL_PASSWORD,
  };
}

export default async (request) => {
  if (request.method !== "POST") {
    return jsonResponse(
      { error: "Deze methode wordt niet ondersteund." },
      { status: 405, headers: { Allow: "POST" } },
    );
  }

  const secret = process.env.KERSENBOOM_AUTH_SECRET;
  const passwords = configuredPasswords();
  if (!secret || !passwords.internal || !passwords.external) {
    return jsonResponse(
      { error: "De online login is nog niet geconfigureerd in Netlify." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const role = body?.role;
  const password = body?.password;

  if (!["internal", "external"].includes(role) || typeof password !== "string") {
    return jsonResponse({ error: "Ongeldige login." }, { status: 400 });
  }

  if (password !== passwords[role]) {
    return jsonResponse({ error: "Dat wachtwoord klopt niet." }, { status: 401 });
  }

  return jsonResponse({
    ok: true,
    role,
    token: createToken(role, secret),
  });
};
