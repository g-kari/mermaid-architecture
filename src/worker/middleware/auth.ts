import type { Context, Next } from "hono";
import { nanoid } from "nanoid";
import type { AppEnv } from "../types";

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
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      email = payload.email;
    } catch {
      return c.json({ error: "Invalid token" }, 401);
    }
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
      .prepare(
        "INSERT INTO users (id, email, name) VALUES (?, ?, ?)"
      )
      .bind(id, email, email.split("@")[0])
      .run();
    user = { id, email };
  }

  c.set("userId", user.id);
  c.set("userEmail", user.email);
  await next();
}
