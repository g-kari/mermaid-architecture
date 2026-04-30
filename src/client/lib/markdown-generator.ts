import type { CanvasData, CanvasEdge, CanvasGroup, CanvasNode } from "../types";
import { AWS_CATEGORIES, type AwsCategory, getServiceDef, type SpecFieldDef } from "./aws-services";

export function canvasDataToMarkdown(data: CanvasData): string {
  if (data.nodes.length === 0 && data.groups.length === 0) {
    return "# インフラストラクチャ構成\n\nリソースが配置されていません。";
  }

  const lines: string[] = ["# インフラストラクチャ構成", ""];

  appendResourceTable(lines, data);
  appendGroupStructure(lines, data);
  appendConnections(lines, data);

  return lines.join("\n");
}

function appendResourceTable(lines: string[], data: CanvasData) {
  const byCategory = new Map<AwsCategory, CanvasNode[]>();
  const ungrouped: CanvasNode[] = [];

  for (const node of data.nodes) {
    const def = getServiceDef(node.type);
    if (def) {
      const list = byCategory.get(def.category) || [];
      list.push(node);
      byCategory.set(def.category, list);
    } else {
      ungrouped.push(node);
    }
  }

  lines.push("## リソース一覧", "");

  const categoryOrder: AwsCategory[] = [
    "compute",
    "network",
    "database",
    "storage",
    "application",
    "security",
    "management",
    "analytics",
  ];

  for (const cat of categoryOrder) {
    const nodes = byCategory.get(cat);
    if (!nodes || nodes.length === 0) continue;

    const catLabel = AWS_CATEGORIES[cat].label;
    lines.push(`### ${catLabel}`, "");
    lines.push("| リソース名 | サービス | 所属グループ | スペック |");
    lines.push("|-----------|---------|------------|---------|");

    for (const node of nodes) {
      const def = getServiceDef(node.type);
      const serviceName = def?.name ?? node.type;
      const groupLabel = findParentGroupLabel(node, data);
      const specStr = formatSpecs(node.specs, def?.specFields);
      lines.push(`| ${node.label} | ${serviceName} | ${groupLabel} | ${specStr} |`);
    }
    lines.push("");
  }

  if (ungrouped.length > 0) {
    lines.push("### その他", "");
    lines.push("| リソース名 | タイプ | 所属グループ | スペック |");
    lines.push("|-----------|-------|------------|---------|");
    for (const node of ungrouped) {
      const groupLabel = findParentGroupLabel(node, data);
      const specStr = formatSpecs(node.specs);
      lines.push(`| ${node.label} | ${node.type} | ${groupLabel} | ${specStr} |`);
    }
    lines.push("");
  }
}

function appendGroupStructure(lines: string[], data: CanvasData) {
  if (data.groups.length === 0) return;

  lines.push("## グループ構成", "");

  const topLevelGroups = data.groups.filter(
    (g) => !data.groups.some((parent) => parent.children.includes(g.id)),
  );

  for (const group of topLevelGroups) {
    renderGroupTree(lines, group, data, 0);
  }
  lines.push("");
}

function renderGroupTree(lines: string[], group: CanvasGroup, data: CanvasData, depth: number) {
  const indent = "  ".repeat(depth);
  const prefix = depth === 0 ? "###" : "-";

  if (depth === 0) {
    lines.push(`${prefix} ${group.label} (${group.type})`, "");
  } else {
    lines.push(`${indent}${prefix} **${group.label}** (${group.type})`);
  }

  for (const childId of group.children) {
    const childGroup = data.groups.find((g) => g.id === childId);
    if (childGroup) {
      renderGroupTree(lines, childGroup, data, depth + 1);
      continue;
    }
    const node = data.nodes.find((n) => n.id === childId);
    if (node) {
      const def = getServiceDef(node.type);
      const service = def ? ` (${def.name})` : "";
      lines.push(`${indent}- ${node.label}${service}`);
    }
  }

  const implicitChildren = data.nodes.filter(
    (n) => n.group === group.id && !group.children.includes(n.id),
  );
  for (const node of implicitChildren) {
    const def = getServiceDef(node.type);
    const service = def ? ` (${def.name})` : "";
    lines.push(`${indent}- ${node.label}${service}`);
  }
}

function appendConnections(lines: string[], data: CanvasData) {
  if (data.edges.length === 0) return;

  lines.push("## 接続関係", "");
  lines.push("| 接続元 | 接続先 | ラベル | スタイル |");
  lines.push("|-------|-------|-------|---------|");

  for (const edge of data.edges) {
    const source = resolveNodeLabel(edge.source, data);
    const target = resolveNodeLabel(edge.target, data);
    const label = edge.label || "-";
    const style = formatStyle(edge.style);
    lines.push(`| ${source} | ${target} | ${label} | ${style} |`);
  }
  lines.push("");
}

function formatSpecs(specs?: Record<string, string>, specFields?: SpecFieldDef[]): string {
  if (!specs) return "-";
  const pairs = Object.entries(specs)
    .filter(([, v]) => v !== "")
    .map(([k, v]) => {
      const label = specFields?.find((f) => f.key === k)?.label ?? k;
      return `${label}: ${v}`;
    });
  return pairs.length > 0 ? pairs.join(", ") : "-";
}

function findParentGroupLabel(node: CanvasNode, data: CanvasData): string {
  if (node.group) {
    const g = data.groups.find((gr) => gr.id === node.group);
    if (g) return g.label;
  }
  const parent = data.groups.find((g) => g.children.includes(node.id));
  return parent ? parent.label : "-";
}

function resolveNodeLabel(nodeId: string, data: CanvasData): string {
  const node = data.nodes.find((n) => n.id === nodeId);
  return node ? node.label : nodeId;
}

function formatStyle(style?: CanvasEdge["style"]): string {
  switch (style) {
    case "dashed":
      return "破線";
    case "dotted":
      return "点線";
    default:
      return "実線";
  }
}

export function downloadMarkdown(markdown: string, filename = "architecture.md"): void {
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
