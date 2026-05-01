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
}

export interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  groups: CanvasGroup[];
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

export interface AwsServiceDef {
  id: string;
  name: string;
  category: string;
  defaultWidth: number;
  defaultHeight: number;
  specFields?: { key: string; label: string; placeholder?: string }[];
}
