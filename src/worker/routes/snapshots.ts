import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { AppEnv } from "../types";

const snapshots = new Hono<AppEnv>();

snapshots.get("/diagrams/:diagramId/snapshots", async (c) => {
  const diagramId = c.req.param("diagramId");
  const rows = await c.env.DB.prepare(
    `SELECT s.id, s.diagram_id, s.mermaid_code, s.canvas_data, s.label, s.created_at, u.email as created_by_email
     FROM snapshots s
     LEFT JOIN users u ON u.id = s.created_by
     WHERE s.diagram_id = ?
     ORDER BY s.created_at DESC`
  )
    .bind(diagramId)
    .all();
  return c.json(rows.results);
});

snapshots.post("/diagrams/:diagramId/snapshots", async (c) => {
  const diagramId = c.req.param("diagramId");
  const userId = c.get("userId");
  const { label } = await c.req.json<{ label?: string }>();

  const diagram = await c.env.DB.prepare(
    "SELECT mermaid_code, canvas_data FROM diagrams WHERE id = ?"
  )
    .bind(diagramId)
    .first<{ mermaid_code: string; canvas_data: string }>();

  if (!diagram) {
    return c.json({ error: "Not found" }, 404);
  }

  const id = nanoid();
  await c.env.DB.prepare(
    `INSERT INTO snapshots (id, diagram_id, mermaid_code, canvas_data, created_by, label)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(id, diagramId, diagram.mermaid_code, diagram.canvas_data, userId, label ?? null)
    .run();

  return c.json({ id }, 201);
});

snapshots.post("/snapshots/:id/restore", async (c) => {
  const snapshotId = c.req.param("id");
  const userId = c.get("userId");

  const snapshot = await c.env.DB.prepare(
    "SELECT * FROM snapshots WHERE id = ?"
  )
    .bind(snapshotId)
    .first<{
      id: string;
      diagram_id: string;
      mermaid_code: string;
      canvas_data: string;
    }>();

  if (!snapshot) {
    return c.json({ error: "Not found" }, 404);
  }

  const restoreSnapshotId = nanoid();
  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE diagrams SET mermaid_code = ?, canvas_data = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(snapshot.mermaid_code, snapshot.canvas_data, snapshot.diagram_id),
    c.env.DB.prepare(
      `INSERT INTO snapshots (id, diagram_id, mermaid_code, canvas_data, created_by, label)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      restoreSnapshotId,
      snapshot.diagram_id,
      snapshot.mermaid_code,
      snapshot.canvas_data,
      userId,
      `Restored from ${snapshot.id}`
    ),
  ]);

  return c.json({ ok: true, diagram_id: snapshot.diagram_id });
});

export default snapshots;
