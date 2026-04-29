import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { AppEnv } from "../types";

const projects = new Hono<AppEnv>();

projects.get("/", async (c) => {
  const userId = c.get("userId");
  const rows = await c.env.DB.prepare(
    `SELECT p.id, p.name, p.owner_id, p.created_at, p.updated_at, pm.role
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id
     WHERE pm.user_id = ?
     ORDER BY p.updated_at DESC`,
  )
    .bind(userId)
    .all();
  return c.json(rows.results);
});

projects.post("/", async (c) => {
  const userId = c.get("userId");
  const { name } = await c.req.json<{ name: string }>();
  const id = nanoid();

  await c.env.DB.batch([
    c.env.DB.prepare("INSERT INTO projects (id, name, owner_id) VALUES (?, ?, ?)").bind(
      id,
      name,
      userId,
    ),
    c.env.DB.prepare(
      "INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, 'owner')",
    ).bind(id, userId),
  ]);

  return c.json({ id, name }, 201);
});

projects.get("/:id", async (c) => {
  const projectId = c.req.param("id");
  const userId = c.get("userId");

  const member = await c.env.DB.prepare(
    "SELECT role FROM project_members WHERE project_id = ? AND user_id = ?",
  )
    .bind(projectId, userId)
    .first();

  if (!member) {
    return c.json({ error: "Not found" }, 404);
  }

  const project = await c.env.DB.prepare("SELECT * FROM projects WHERE id = ?")
    .bind(projectId)
    .first();

  return c.json({ ...project, role: member.role });
});

projects.put("/:id", async (c) => {
  const projectId = c.req.param("id");
  const userId = c.get("userId");
  const { name } = await c.req.json<{ name: string }>();

  const member = await c.env.DB.prepare(
    "SELECT role FROM project_members WHERE project_id = ? AND user_id = ?",
  )
    .bind(projectId, userId)
    .first<{ role: string }>();

  if (!member || member.role === "viewer") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await c.env.DB.prepare("UPDATE projects SET name = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(name, projectId)
    .run();

  return c.json({ id: projectId, name });
});

projects.delete("/:id", async (c) => {
  const projectId = c.req.param("id");
  const userId = c.get("userId");

  const member = await c.env.DB.prepare(
    "SELECT role FROM project_members WHERE project_id = ? AND user_id = ?",
  )
    .bind(projectId, userId)
    .first<{ role: string }>();

  if (!member || member.role !== "owner") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await c.env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(projectId).run();

  return c.json({ ok: true });
});

projects.post("/:id/members", async (c) => {
  const projectId = c.req.param("id");
  const userId = c.get("userId");
  const { email, role } = await c.req.json<{
    email: string;
    role: "editor" | "viewer";
  }>();

  const member = await c.env.DB.prepare(
    "SELECT role FROM project_members WHERE project_id = ? AND user_id = ?",
  )
    .bind(projectId, userId)
    .first<{ role: string }>();

  if (!member || member.role !== "owner") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const targetUser = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string }>();

  if (!targetUser) {
    return c.json({ error: "User not found" }, 404);
  }

  await c.env.DB.prepare(
    "INSERT OR REPLACE INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)",
  )
    .bind(projectId, targetUser.id, role)
    .run();

  return c.json({ ok: true });
});

export default projects;
