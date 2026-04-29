import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { AppEnv } from "../types";

const diagrams = new Hono<AppEnv>();

diagrams.get("/projects/:projectId/diagrams", async (c) => {
  const projectId = c.req.param("projectId");
  const userId = c.get("userId");

  const member = await c.env.DB.prepare(
    "SELECT role FROM project_members WHERE project_id = ? AND user_id = ?",
  )
    .bind(projectId, userId)
    .first();

  if (!member) {
    return c.json({ error: "Not found" }, 404);
  }

  const rows = await c.env.DB.prepare(
    `SELECT id, project_id, name, created_by, created_at, updated_at
     FROM diagrams WHERE project_id = ? ORDER BY updated_at DESC`,
  )
    .bind(projectId)
    .all();

  return c.json(rows.results);
});

diagrams.post("/projects/:projectId/diagrams", async (c) => {
  const projectId = c.req.param("projectId");
  const userId = c.get("userId");
  const { name, mermaid_code, canvas_data } = await c.req.json<{
    name: string;
    mermaid_code?: string;
    canvas_data?: string;
  }>();

  const member = await c.env.DB.prepare(
    "SELECT role FROM project_members WHERE project_id = ? AND user_id = ?",
  )
    .bind(projectId, userId)
    .first<{ role: string }>();

  if (!member || member.role === "viewer") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const id = nanoid();
  await c.env.DB.prepare(
    `INSERT INTO diagrams (id, project_id, name, mermaid_code, canvas_data, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, projectId, name, mermaid_code ?? null, canvas_data ?? null, userId)
    .run();

  return c.json({ id, name }, 201);
});

diagrams.get("/diagrams/:id", async (c) => {
  const diagramId = c.req.param("id");
  const userId = c.get("userId");

  const diagram = await c.env.DB.prepare("SELECT * FROM diagrams WHERE id = ?")
    .bind(diagramId)
    .first();

  if (!diagram) {
    return c.json({ error: "Not found" }, 404);
  }

  const member = await c.env.DB.prepare(
    "SELECT role FROM project_members WHERE project_id = ? AND user_id = ?",
  )
    .bind(diagram.project_id, userId)
    .first();

  if (!member) {
    return c.json({ error: "Not found" }, 404);
  }

  return c.json(diagram);
});

diagrams.put("/diagrams/:id", async (c) => {
  const diagramId = c.req.param("id");
  const userId = c.get("userId");
  const body = await c.req.json<{
    name?: string;
    mermaid_code?: string;
    canvas_data?: string;
  }>();

  const diagram = await c.env.DB.prepare("SELECT project_id FROM diagrams WHERE id = ?")
    .bind(diagramId)
    .first<{ project_id: string }>();

  if (!diagram) {
    return c.json({ error: "Not found" }, 404);
  }

  const member = await c.env.DB.prepare(
    "SELECT role FROM project_members WHERE project_id = ? AND user_id = ?",
  )
    .bind(diagram.project_id, userId)
    .first<{ role: string }>();

  if (!member || member.role === "viewer") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) {
    updates.push("name = ?");
    values.push(body.name);
  }
  if (body.mermaid_code !== undefined) {
    updates.push("mermaid_code = ?");
    values.push(body.mermaid_code);
  }
  if (body.canvas_data !== undefined) {
    updates.push("canvas_data = ?");
    values.push(body.canvas_data);
  }

  if (updates.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  updates.push("updated_at = datetime('now')");
  values.push(diagramId);

  await c.env.DB.prepare(`UPDATE diagrams SET ${updates.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  return c.json({ ok: true });
});

diagrams.delete("/diagrams/:id", async (c) => {
  const diagramId = c.req.param("id");
  const userId = c.get("userId");

  const diagram = await c.env.DB.prepare("SELECT project_id FROM diagrams WHERE id = ?")
    .bind(diagramId)
    .first<{ project_id: string }>();

  if (!diagram) {
    return c.json({ error: "Not found" }, 404);
  }

  const member = await c.env.DB.prepare(
    "SELECT role FROM project_members WHERE project_id = ? AND user_id = ?",
  )
    .bind(diagram.project_id, userId)
    .first<{ role: string }>();

  if (!member || member.role === "viewer") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await c.env.DB.prepare("DELETE FROM diagrams WHERE id = ?").bind(diagramId).run();

  return c.json({ ok: true });
});

export default diagrams;
