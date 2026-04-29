import type { Hono } from "hono";

export type Bindings = {
  DB: D1Database;
  DIAGRAM_ROOM: DurableObjectNamespace;
  DEV_MODE: string;
  __STATIC_CONTENT: KVNamespace;
};

export type Variables = {
  userId: string;
  userEmail: string;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

export type AppType = Hono<AppEnv>;
