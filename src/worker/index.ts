// @ts-expect-error Workers Sites manifest
import manifest from "__STATIC_CONTENT_MANIFEST";
import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import diagrams from "./routes/diagrams";
import projects from "./routes/projects";
import snapshots from "./routes/snapshots";
import templates from "./routes/templates";
import users from "./routes/users";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use("/api/*", cors());

app.get("/api/health", (c) => {
  return c.json({ ok: true });
});

app.use("/api/*", authMiddleware);

app.route("/api/users", users);
app.route("/api/projects", projects);
app.route("/api", diagrams);
app.route("/api/templates", templates);
app.route("/api", snapshots);

app.get("/api/ws/diagrams/:diagramId", (c) => {
  const diagramId = c.req.param("diagramId");
  const id = c.env.DIAGRAM_ROOM.idFromName(diagramId);
  const stub = c.env.DIAGRAM_ROOM.get(id);
  const url = new URL(c.req.url);
  url.searchParams.set("diagramId", diagramId);
  return stub.fetch(new Request(url.toString(), c.req.raw));
});

app.use("/assets/*", serveStatic({ manifest }));

app.get("*", serveStatic({ path: "./index.html", manifest }));

export { DiagramRoom } from "./durable-objects/diagram-room";
export default app;
