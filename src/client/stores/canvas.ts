import { create } from "zustand";
import type { CanvasData, CanvasEdge, CanvasGroup, CanvasNode } from "../types";

interface CanvasState {
  data: CanvasData;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  setData: (data: CanvasData) => void;
  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: CanvasEdge) => void;
  updateEdge: (id: string, updates: Partial<CanvasEdge>) => void;
  removeEdge: (id: string) => void;
  addGroup: (group: CanvasGroup) => void;
  removeGroup: (id: string) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  data: { nodes: [], edges: [], groups: [] },
  selectedNodeId: null,
  selectedEdgeId: null,

  setData: (data) => set({ data }),

  addNode: (node) => set((s) => ({ data: { ...s.data, nodes: [...s.data.nodes, node] } })),

  updateNode: (id, updates) =>
    set((s) => ({
      data: {
        ...s.data,
        nodes: s.data.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
      },
    })),

  removeNode: (id) =>
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
    })),

  addEdge: (edge) => set((s) => ({ data: { ...s.data, edges: [...s.data.edges, edge] } })),

  updateEdge: (id, updates) =>
    set((s) => ({
      data: {
        ...s.data,
        edges: s.data.edges.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      },
    })),

  removeEdge: (id) =>
    set((s) => ({
      data: {
        ...s.data,
        edges: s.data.edges.filter((e) => e.id !== id),
      },
      selectedEdgeId: s.selectedEdgeId === id ? null : s.selectedEdgeId,
    })),

  addGroup: (group) => set((s) => ({ data: { ...s.data, groups: [...s.data.groups, group] } })),

  removeGroup: (id) =>
    set((s) => ({
      data: {
        ...s.data,
        groups: s.data.groups.filter((g) => g.id !== id),
      },
    })),

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
}));
