import { Hono } from "hono";
import type { AppEnv } from "../types";

const users = new Hono<AppEnv>();

users.get("/me", async (c) => {
  const userId = c.get("userId");
  const user = await c.env.DB.prepare("SELECT id, email, name, created_at FROM users WHERE id = ?")
    .bind(userId)
    .first();
  return c.json(user);
});

export default users;
