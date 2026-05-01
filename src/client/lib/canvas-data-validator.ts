import type { CanvasData, CanvasEdge, CanvasGroup, CanvasNode } from "../types";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((item) => typeof item === "string");
}

function validateNode(raw: unknown, index: number): CanvasNode {
  if (!isObject(raw)) {
    throw new Error(`nodes[${index}]はオブジェクトである必要があります`);
  }

  const id = raw.id;
  const type = raw.type;
  const label = raw.label;
  const x = raw.x;
  const y = raw.y;
  const width = raw.width;
  const height = raw.height;

  if (typeof id !== "string" || id === "") {
    throw new Error(`ノード(index=${index})にidが必要です`);
  }
  if (typeof type !== "string" || type === "") {
    throw new Error(`ノード '${id}' にtypeが必要です`);
  }
  if (typeof label !== "string") {
    throw new Error(`ノード '${id}' にlabelが必要です`);
  }
  if (typeof x !== "number" || !Number.isFinite(x)) {
    throw new Error(`ノード '${id}' にxが必要です(number)`);
  }
  if (typeof y !== "number" || !Number.isFinite(y)) {
    throw new Error(`ノード '${id}' にyが必要です(number)`);
  }
  if (typeof width !== "number" || !Number.isFinite(width) || width <= 0) {
    throw new Error(`ノード '${id}' にwidthが必要です(正の数)`);
  }
  if (typeof height !== "number" || !Number.isFinite(height) || height <= 0) {
    throw new Error(`ノード '${id}' にheightが必要です(正の数)`);
  }

  const node: CanvasNode = { id, type, label, x, y, width, height };

  if (raw.group !== undefined) {
    if (typeof raw.group !== "string") {
      throw new Error(`ノード '${id}' のgroupはstringである必要があります`);
    }
    node.group = raw.group;
  }

  if (raw.specs !== undefined) {
    if (!isObject(raw.specs)) {
      throw new Error(`ノード '${id}' のspecsはRecord<string, string>である必要があります`);
    }
    for (const [key, val] of Object.entries(raw.specs)) {
      if (typeof val !== "string") {
        throw new Error(`ノード '${id}' のspecs['${key}']はstringである必要があります`);
      }
    }
    node.specs = raw.specs as Record<string, string>;
  }

  if (raw.imageDataUrl !== undefined) {
    if (typeof raw.imageDataUrl !== "string") {
      throw new Error(`ノード '${id}' のimageDataUrlはstringである必要があります`);
    }
    node.imageDataUrl = raw.imageDataUrl;
  }

  return node;
}

const VALID_EDGE_STYLES = new Set(["solid", "dashed", "dotted"]);

function validateEdge(raw: unknown, index: number): CanvasEdge {
  if (!isObject(raw)) {
    throw new Error(`edges[${index}]はオブジェクトである必要があります`);
  }

  const id = raw.id;
  const source = raw.source;
  const target = raw.target;

  if (typeof id !== "string" || id === "") {
    throw new Error(`エッジ(index=${index})にidが必要です`);
  }
  if (typeof source !== "string" || source === "") {
    throw new Error(`エッジ '${id}' にsourceが必要です`);
  }
  if (typeof target !== "string" || target === "") {
    throw new Error(`エッジ '${id}' にtargetが必要です`);
  }

  const edge: CanvasEdge = { id, source, target };

  if (raw.label !== undefined) {
    if (typeof raw.label !== "string") {
      throw new Error(`エッジ '${id}' のlabelはstringである必要があります`);
    }
    edge.label = raw.label;
  }

  if (raw.style !== undefined) {
    if (typeof raw.style !== "string" || !VALID_EDGE_STYLES.has(raw.style)) {
      throw new Error(`エッジ '${id}' のstyleは"solid" | "dashed" | "dotted"である必要があります`);
    }
    edge.style = raw.style as CanvasEdge["style"];
  }

  return edge;
}

function validateGroup(raw: unknown, index: number): CanvasGroup {
  if (!isObject(raw)) {
    throw new Error(`groups[${index}]はオブジェクトである必要があります`);
  }

  const id = raw.id;
  const type = raw.type;
  const label = raw.label;
  const children = raw.children;

  if (typeof id !== "string" || id === "") {
    throw new Error(`グループ(index=${index})にidが必要です`);
  }
  if (typeof type !== "string" || type === "") {
    throw new Error(`グループ '${id}' にtypeが必要です`);
  }
  if (typeof label !== "string") {
    throw new Error(`グループ '${id}' にlabelが必要です`);
  }
  if (!isStringArray(children)) {
    throw new Error(`グループ '${id}' のchildrenはstring[]である必要があります`);
  }

  return { id, type, label, children };
}

export function validateCanvasData(
  data: unknown,
): { valid: true; data: CanvasData } | { valid: false; error: string } {
  try {
    if (!isObject(data)) {
      throw new Error("CanvasDataはオブジェクトである必要があります");
    }

    if (!Array.isArray(data.nodes)) {
      throw new Error("nodes配列が必要です");
    }
    if (!Array.isArray(data.edges)) {
      throw new Error("edges配列が必要です");
    }
    if (!Array.isArray(data.groups)) {
      throw new Error("groups配列が必要です");
    }

    const nodes = data.nodes.map((n, i) => validateNode(n, i));
    const edges = data.edges.map((e, i) => validateEdge(e, i));
    const groups = data.groups.map((g, i) => validateGroup(g, i));

    const nodeIds = new Set<string>();
    for (const node of nodes) {
      if (nodeIds.has(node.id)) {
        throw new Error(`ノードID '${node.id}' が重複しています`);
      }
      nodeIds.add(node.id);
    }

    const groupIds = new Set<string>();
    for (const group of groups) {
      if (groupIds.has(group.id)) {
        throw new Error(`グループID '${group.id}' が重複しています`);
      }
      groupIds.add(group.id);
    }

    const allIds = new Set([...nodeIds, ...groupIds]);

    for (const edge of edges) {
      if (!allIds.has(edge.source)) {
        throw new Error(`エッジのsource '${edge.source}' が存在しません`);
      }
      if (!allIds.has(edge.target)) {
        throw new Error(`エッジのtarget '${edge.target}' が存在しません`);
      }
    }

    for (const group of groups) {
      for (const childId of group.children) {
        if (!allIds.has(childId)) {
          throw new Error(`グループ '${group.id}' のchild '${childId}' が存在しません`);
        }
      }
    }

    return { valid: true, data: { nodes, edges, groups } };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}
