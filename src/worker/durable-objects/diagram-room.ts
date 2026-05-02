import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import * as awarenessProtocol from "y-protocols/awareness";
import * as syncProtocol from "y-protocols/sync";
import * as Y from "yjs";

const MSG_SYNC = 0;
const MSG_AWARENESS = 1;

interface Env {
  DB: D1Database;
}

export class DiagramRoom implements DurableObject {
  private state: DurableObjectState;
  private env: Env;
  private doc: Y.Doc;
  private awareness: awarenessProtocol.Awareness;
  private connections: Map<WebSocket, { clientId: number }>;
  private diagramId: string | null = null;
  private dirty = false;
  private initialized = false;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.doc = new Y.Doc();
    this.awareness = new awarenessProtocol.Awareness(this.doc);
    this.connections = new Map();

    this.doc.on("update", () => {
      this.dirty = true;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    this.diagramId = url.searchParams.get("diagramId");

    if (!this.initialized && this.diagramId) {
      await this.loadFromD1();
      this.initialized = true;
    }

    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];

    this.state.acceptWebSocket(server);
    this.connections.set(server, { clientId: 0 });

    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MSG_SYNC);
    syncProtocol.writeSyncStep1(encoder, this.doc);
    server.send(encoding.toUint8Array(encoder));

    this.scheduleFlush();

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    if (typeof message === "string") return;

    const data = new Uint8Array(message);
    const decoder = decoding.createDecoder(data);
    const msgType = decoding.readVarUint(decoder);

    switch (msgType) {
      case MSG_SYNC: {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MSG_SYNC);
        syncProtocol.readSyncMessage(decoder, encoder, this.doc, null);
        if (encoding.length(encoder) > 1) {
          ws.send(encoding.toUint8Array(encoder));
        }

        // Broadcast to other clients
        const updateEncoder = encoding.createEncoder();
        encoding.writeVarUint(updateEncoder, MSG_SYNC);
        syncProtocol.writeSyncStep2(updateEncoder, this.doc);
        const updateMsg = encoding.toUint8Array(updateEncoder);

        for (const [conn] of this.connections) {
          if (conn !== ws) {
            try {
              conn.send(updateMsg);
            } catch {
              this.connections.delete(conn);
            }
          }
        }
        break;
      }
      case MSG_AWARENESS: {
        const update = awarenessProtocol.applyAwarenessUpdate(
          this.awareness,
          decoding.readVarUint8Array(decoder),
          null,
        );
        void update;

        for (const [conn] of this.connections) {
          if (conn !== ws) {
            try {
              conn.send(data);
            } catch {
              this.connections.delete(conn);
            }
          }
        }
        break;
      }
    }
  }

  async webSocketClose(ws: WebSocket) {
    this.connections.delete(ws);
    if (this.connections.size === 0) {
      await this.flushToD1();
    }
  }

  async webSocketError(ws: WebSocket) {
    this.connections.delete(ws);
  }

  async alarm() {
    if (this.dirty) {
      await this.flushToD1();
    }
    if (this.connections.size > 0) {
      this.scheduleFlush();
    }
  }

  private scheduleFlush() {
    this.state.storage.setAlarm(Date.now() + 30_000);
  }

  private async loadFromD1() {
    if (!this.diagramId) return;
    const row = await this.env.DB.prepare("SELECT yjs_state FROM diagrams WHERE id = ?")
      .bind(this.diagramId)
      .first<{ yjs_state: ArrayBuffer | null }>();

    if (row?.yjs_state) {
      Y.applyUpdate(this.doc, new Uint8Array(row.yjs_state));
    }
  }

  private async flushToD1() {
    if (!this.diagramId || !this.dirty) return;

    const state = Y.encodeStateAsUpdate(this.doc);

    const canvasMap = this.doc.getMap("canvas");
    let canvasData: string | null = null;

    if (canvasMap.size > 0) {
      try {
        const raw = canvasMap.toJSON() as Record<string, Record<string, string>>;
        const nodes = raw.nodes ? Object.values(raw.nodes).map((v) => JSON.parse(v)) : [];
        const edges = raw.edges ? Object.values(raw.edges).map((v) => JSON.parse(v)) : [];
        const groups = raw.groups ? Object.values(raw.groups).map((v) => JSON.parse(v)) : [];
        canvasData = JSON.stringify({ nodes, edges, groups });
      } catch {
        // ignore serialization errors
      }
    }

    await this.env.DB.prepare(
      `UPDATE diagrams SET yjs_state = ?, canvas_data = ?, updated_at = datetime('now') WHERE id = ?`,
    )
      .bind(state, canvasData, this.diagramId)
      .run();

    this.dirty = false;
  }
}
