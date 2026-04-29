import type { Context, Next } from "hono";
import { nanoid } from "nanoid";
import type { AppEnv } from "../types";

interface JWK {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg: string;
}

interface JWKSet {
  keys: JWK[];
}

interface JWTHeader {
  kid: string;
  alg: string;
}

interface JWTPayload {
  email: string;
  aud: string[];
  iss: string;
  exp: number;
  iat: number;
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importPublicKey(jwk: JWK): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: jwk.alg },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

async function verifyJWT(token: string, certsUrl: string, aud: string): Promise<JWTPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const header: JWTHeader = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));

  const res = await fetch(certsUrl);
  if (!res.ok) return null;
  const jwks: JWKSet = await res.json();

  const jwk = jwks.keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;

  const key = await importPublicKey(jwk);
  const signatureBytes = base64UrlDecode(parts[2]);
  const dataBytes = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signatureBytes.buffer as ArrayBuffer,
    dataBytes.buffer as ArrayBuffer,
  );
  if (!valid) return null;

  const payload: JWTPayload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));

  if (!payload.aud?.includes(aud)) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const devMode = c.env.DEV_MODE === "true";

  let email: string | null = null;

  if (devMode) {
    email = c.req.header("X-Dev-User-Email") ?? "dev@localhost";
  } else {
    const jwt = c.req.header("CF-Access-JWT-Assertion");
    if (!jwt) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const payload = await verifyJWT(jwt, c.env.CF_ACCESS_CERTS_URL, c.env.CF_ACCESS_AUD);
    if (!payload?.email) {
      return c.json({ error: "Invalid token" }, 401);
    }
    email = payload.email;
  }

  if (!email) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;
  let user = await db
    .prepare("SELECT id, email FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string; email: string }>();

  if (!user) {
    const id = nanoid();
    await db
      .prepare("INSERT INTO users (id, email, name) VALUES (?, ?, ?)")
      .bind(id, email, email.split("@")[0])
      .run();
    user = { id, email };
  }

  c.set("userId", user.id);
  c.set("userEmail", user.email);
  await next();
}
