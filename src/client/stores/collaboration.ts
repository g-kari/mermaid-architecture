import { create } from "zustand";
import { DiagramProvider } from "../lib/yjs-provider";

interface CollaborationState {
  provider: DiagramProvider | null;
  connected: boolean;
  onlineUsers: Array<{ clientId: number; name: string; color: string }>;
  connect: (diagramId: string) => void;
  disconnect: () => void;
}

const USER_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
];

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  provider: null,
  connected: false,
  onlineUsers: [],

  connect: (diagramId: string) => {
    const existing = get().provider;
    if (existing) existing.destroy();

    const provider = new DiagramProvider(diagramId);

    provider.onStatusChange(() => {
      set({ connected: provider.isConnected() });
    });

    provider.awareness.on("change", () => {
      const states = provider.awareness.getStates();
      const users: Array<{ clientId: number; name: string; color: string }> = [];
      states.forEach((state, clientId) => {
        if (clientId !== provider.doc.clientID && state.user) {
          users.push({
            clientId,
            name: state.user.name || "Unknown",
            color: state.user.color || USER_COLORS[clientId % USER_COLORS.length],
          });
        }
      });
      set({ onlineUsers: users });
    });

    set({ provider, connected: false });
  },

  disconnect: () => {
    const { provider } = get();
    if (provider) {
      provider.destroy();
      set({ provider: null, connected: false, onlineUsers: [] });
    }
  },
}));
