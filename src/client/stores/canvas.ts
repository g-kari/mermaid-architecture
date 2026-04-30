import { nanoid } from "nanoid";
import { create } from "zustand";
import type { CanvasData, CanvasEdge, CanvasGroup, CanvasNode } from "../types";

const MAX_HISTORY = 50;

function cloneData(data: CanvasData): CanvasData {
  return JSON.parse(JSON.stringify(data));
}

interface CanvasState {
  data: CanvasData;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedGroupId: string | null;
  undoStack: CanvasData[];
  redoStack: CanvasData[];

  setData: (data: CanvasData) => void;
  pushUndo: () => void;
  undo: () => void;
  redo: () => void;
  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: CanvasEdge) => void;
  updateEdge: (id: string, updates: Partial<CanvasEdge>) => void;
  removeEdge: (id: string) => void;
  addGroup: (group: CanvasGroup) => void;
  updateGroup: (id: string, updates: Partial<CanvasGroup>) => void;
  removeGroup: (id: string) => void;
  moveGroupChildren: (groupId: string, dx: number, dy: number) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  selectGroup: (id: string | null) => void;
  deselectAll: () => void;
  duplicateNode: (id: string) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  data: { nodes: [], edges: [], groups: [] },
  selectedNodeId: null,
  selectedEdgeId: null,
  selectedGroupId: null,
  undoStack: [],
  redoStack: [],

  setData: (data) => set({ data, undoStack: [], redoStack: [] }),

  pushUndo: () =>
    set((s) => ({
      undoStack: [...s.undoStack.slice(-MAX_HISTORY + 1), cloneData(s.data)],
      redoStack: [],
    })),

  undo: () => {
    const { undoStack, data } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      data: prev,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, cloneData(data)],
      selectedNodeId: null,
      selectedEdgeId: null,
      selectedGroupId: null,
    });
  },

  redo: () => {
    const { redoStack, data } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      data: next,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, cloneData(data)],
      selectedNodeId: null,
      selectedEdgeId: null,
      selectedGroupId: null,
    });
  },

  addNode: (node) => {
    get().pushUndo();
    set((s) => ({ data: { ...s.data, nodes: [...s.data.nodes, node] } }));
  },

  updateNode: (id, updates) =>
    set((s) => ({
      data: {
        ...s.data,
        nodes: s.data.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
      },
    })),

  removeNode: (id) => {
    get().pushUndo();
    set((s) => ({
      data: {
        ...s.data,
        nodes: s.data.nodes.filter((n) => n.id !== id),
        edges: s.data.edges.filter((e) => e.source !== id && e.target !== id),
        groups: s.data.groups.map((g) => ({
          ...g,
          children: g.children.filter((c) => c !== id),
        })),
      },
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    }));
  },

  addEdge: (edge) => {
    get().pushUndo();
    set((s) => ({ data: { ...s.data, edges: [...s.data.edges, edge] } }));
  },

  updateEdge: (id, updates) => {
    get().pushUndo();
    set((s) => ({
      data: {
        ...s.data,
        edges: s.data.edges.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      },
    }));
  },

  removeEdge: (id) => {
    get().pushUndo();
    set((s) => ({
      data: {
        ...s.data,
        edges: s.data.edges.filter((e) => e.id !== id),
      },
      selectedEdgeId: s.selectedEdgeId === id ? null : s.selectedEdgeId,
    }));
  },

  addGroup: (group) => {
    get().pushUndo();
    set((s) => ({ data: { ...s.data, groups: [...s.data.groups, group] } }));
  },

  updateGroup: (id, updates) => {
    get().pushUndo();
    set((s) => ({
      data: {
        ...s.data,
        groups: s.data.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      },
    }));
  },

  removeGroup: (id) => {
    get().pushUndo();
    set((s) => ({
      data: {
        ...s.data,
        groups: s.data.groups.filter((g) => g.id !== id),
        nodes: s.data.nodes.map((n) => (n.group === id ? { ...n, group: undefined } : n)),
      },
      selectedGroupId: s.selectedGroupId === id ? null : s.selectedGroupId,
    }));
  },

  moveGroupChildren: (groupId, dx, dy) => {
    const group = get().data.groups.find((g) => g.id === groupId);
    if (!group) return;
    set((s) => ({
      data: {
        ...s.data,
        nodes: s.data.nodes.map((n) =>
          n.group === groupId || group.children.includes(n.id)
            ? { ...n, x: n.x + dx, y: n.y + dy }
            : n,
        ),
      },
    }));
  },

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null, selectedGroupId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null, selectedGroupId: null }),
  selectGroup: (id) => set({ selectedGroupId: id, selectedNodeId: null, selectedEdgeId: null }),

  deselectAll: () => set({ selectedNodeId: null, selectedEdgeId: null, selectedGroupId: null }),

  duplicateNode: (id) => {
    const node = get().data.nodes.find((n) => n.id === id);
    if (!node) return;
    get().pushUndo();
    const newNode: CanvasNode = {
      ...node,
      id: nanoid(8),
      x: node.x + 20,
      y: node.y + 20,
      label: `${node.label} (copy)`,
      specs: node.specs ? { ...node.specs } : undefined,
    };
    set((s) => ({
      data: { ...s.data, nodes: [...s.data.nodes, newNode] },
      selectedNodeId: newNode.id,
      selectedEdgeId: null,
    }));
  },
}));
