import { create } from "zustand";
import { YjsCanvasBinding } from "../lib/yjs-canvas-binding";
import { DiagramProvider } from "../lib/yjs-provider";
import { useAuthStore } from "./auth";

export interface RemoteCursor {
  clientId: number;
  name: string;
  color: string;
  x: number;
  y: number;
}

interface CollaborationState {
  provider: DiagramProvider | null;
  binding: YjsCanvasBinding | null;
  connected: boolean;
  onlineUsers: Array<{ clientId: number; name: string; color: string }>;
  remoteCursors: RemoteCursor[];
  connect: (diagramId: string) => void;
  disconnect: () => void;
  updateCursorPosition: (x: number, y: number) => void;
}

const USER_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  provider: null,
  binding: null,
  connected: false,
  onlineUsers: [],
  remoteCursors: [],

  connect: (diagramId: string) => {
    const existing = get().provider;
    if (existing) existing.destroy();
    const existingBinding = get().binding;
    if (existingBinding) existingBinding.destroy();

    const provider = new DiagramProvider(diagramId);
    const binding = new YjsCanvasBinding(provider.doc);

    provider.onStatusChange(() => {
      const connected = provider.isConnected();
      set({ connected });

      if (connected) {
        const user = useAuthStore.getState().user;
        const color = USER_COLORS[provider.doc.clientID % USER_COLORS.length];
        provider.awareness.setLocalState({
          user: {
            name: user?.name || user?.email || "Anonymous",
            color,
          },
          cursor: null,
        });
      }
    });

    provider.awareness.on("change", () => {
      const states = provider.awareness.getStates();
      const users: Array<{ clientId: number; name: string; color: string }> = [];
      const cursors: RemoteCursor[] = [];

      states.forEach((state, clientId) => {
        if (clientId === provider.doc.clientID) return;
        if (state.user) {
          const color = state.user.color || USER_COLORS[clientId % USER_COLORS.length];
          users.push({
            clientId,
            name: state.user.name || "Unknown",
            color,
          });
          if (state.cursor) {
            cursors.push({
              clientId,
              name: state.user.name || "Unknown",
              color,
              x: state.cursor.x,
              y: state.cursor.y,
            });
          }
        }
      });
      set({ onlineUsers: users, remoteCursors: cursors });
    });

    set({ provider, binding, connected: false });
  },

  disconnect: () => {
    const { provider, binding } = get();
    if (binding) binding.destroy();
    if (provider) provider.destroy();
    set({
      provider: null,
      binding: null,
      connected: false,
      onlineUsers: [],
      remoteCursors: [],
    });
  },

  updateCursorPosition: (x: number, y: number) => {
    const { provider } = get();
    if (!provider) return;
    provider.awareness.setLocalStateField("cursor", { x, y });
  },
}));
