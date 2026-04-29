import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { AppEnv } from "../types";

const templates = new Hono<AppEnv>();

templates.get("/", async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id, name, description, category, mermaid_code, canvas_data, is_builtin, created_at FROM templates ORDER BY is_builtin DESC, name ASC",
  ).all();
  return c.json(rows.results);
});

templates.post("/", async (c) => {
  const userId = c.get("userId");
  const { name, description, category, mermaid_code, canvas_data } = await c.req.json<{
    name: string;
    description?: string;
    category: string;
    mermaid_code: string;
    canvas_data?: string;
  }>();

  const id = nanoid();
  await c.env.DB.prepare(
    `INSERT INTO templates (id, name, description, category, mermaid_code, canvas_data, is_builtin, created_by)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
  )
    .bind(id, name, description ?? null, category, mermaid_code, canvas_data ?? null, userId)
    .run();

  return c.json({ id, name }, 201);
});

export default templates;
