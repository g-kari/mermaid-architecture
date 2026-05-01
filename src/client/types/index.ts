export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  owner_id: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface Diagram {
  id: string;
  project_id: string;
  name: string;
  mermaid_code: string | null;
  canvas_data: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Snapshot {
  id: string;
  diagram_id: string;
  mermaid_code: string;
  canvas_data: string | null;
  created_by_email: string;
  label: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  mermaid_code: string;
  canvas_data: string | null;
  is_builtin: boolean;
  created_at: string;
}

export interface CanvasNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  group?: string;
  specs?: Record<string, string>;
  imageDataUrl?: string;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: "solid" | "dashed" | "dotted";
}

export interface CanvasGroup {
  id: string;
  type: string;
  label: string;
  children: string[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  groups: CanvasGroup[];
}
