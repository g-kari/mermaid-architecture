import { AWS_SERVICES } from "./aws-services.js";
import type { CanvasData, CanvasGroup, CanvasNode } from "./types.js";

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function escapeLabel(label: string): string {
  return label.replace(/"/g, "'");
}

function formatSpecs(specs: Record<string, string>): string {
  return Object.entries(specs)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
}

export function canvasDataToMermaid(data: CanvasData): string {
  const lines: string[] = ["flowchart TD"];

  const groupMap = new Map<string, CanvasGroup>();
  for (const g of data.groups) {
    groupMap.set(g.id, g);
  }

  const allGroupChildren = new Set<string>();
  for (const g of data.groups) {
    for (const childId of g.children) {
      allGroupChildren.add(childId);
    }
  }

  const nodeMap = new Map<string, CanvasNode>();
  for (const n of data.nodes) {
    nodeMap.set(n.id, n);
  }

  const nodesInGroups = new Set<string>();
  for (const g of data.groups) {
    for (const childId of g.children) {
      if (nodeMap.has(childId)) {
        nodesInGroups.add(childId);
      }
    }
  }

  for (const n of data.nodes) {
    if (n.group && !nodesInGroups.has(n.id)) {
      const parentGroup = groupMap.get(n.group);
      if (parentGroup) {
        nodesInGroups.add(n.id);
        if (!parentGroup.children.includes(n.id)) {
          parentGroup.children.push(n.id);
        }
      }
    }
  }

  function renderGroup(group: CanvasGroup, indent: string): void {
    const sid = sanitizeId(group.id);
    const label = escapeLabel(group.label);
    lines.push(`${indent}subgraph ${sid}["${label}"]`);

    for (const childId of group.children) {
      const childGroup = groupMap.get(childId);
      if (childGroup) {
        renderGroup(childGroup, `${indent}  `);
      } else {
        const node = nodeMap.get(childId);
        if (node) {
          renderNode(node, `${indent}  `);
        }
      }
    }

    lines.push(`${indent}end`);
  }

  function renderNode(node: CanvasNode, indent: string): void {
    const sid = sanitizeId(node.id);
    const label = escapeLabel(node.label);
    lines.push(`${indent}${sid}["${label}"]`);
    if (node.specs && Object.keys(node.specs).length > 0) {
      lines.push(`${indent}%% specs: ${formatSpecs(node.specs)}`);
    }
  }

  const topLevelGroups = data.groups.filter((g) => !allGroupChildren.has(g.id));
  for (const group of topLevelGroups) {
    renderGroup(group, "  ");
  }

  for (const node of data.nodes) {
    if (!nodesInGroups.has(node.id)) {
      renderNode(node, "  ");
    }
  }

  for (const edge of data.edges) {
    const src = sanitizeId(edge.source);
    const tgt = sanitizeId(edge.target);
    const label = edge.label ? `|${escapeLabel(edge.label)}|` : "";

    switch (edge.style) {
      case "dashed":
        lines.push(`  ${src} -.${label}-> ${tgt}`);
        break;
      case "dotted":
        lines.push(`  ${src} -.${label}.- ${tgt}`);
        break;
      default:
        lines.push(`  ${src} -->${label} ${tgt}`);
        break;
    }
  }

  return lines.join("\n");
}

const CATEGORY_LABELS: Record<string, string> = {
  compute: "Compute",
  container: "Containers",
  storage: "Storage",
  database: "Database",
  network: "Networking",
  application: "Application Integration",
  security: "Security",
  management: "Management & Governance",
  analytics: "Analytics",
  devtools: "Developer Tools",
  "ai-ml": "AI / Machine Learning",
};

const STYLE_LABELS: Record<string, string> = {
  solid: "実線",
  dashed: "破線",
  dotted: "点線",
};

export function canvasDataToMarkdown(data: CanvasData): string {
  const lines: string[] = ["# インフラストラクチャ構成", ""];

  const serviceLookup = new Map<string, (typeof AWS_SERVICES)[number]>();
  for (const s of AWS_SERVICES) {
    serviceLookup.set(s.id, s);
  }

  const nodeMap = new Map<string, CanvasNode>();
  for (const n of data.nodes) {
    nodeMap.set(n.id, n);
  }

  const groupMap = new Map<string, CanvasGroup>();
  for (const g of data.groups) {
    groupMap.set(g.id, g);
  }

  if (data.groups.length > 0) {
    lines.push("## グループ構成", "");

    const allGroupChildren = new Set<string>();
    for (const g of data.groups) {
      for (const childId of g.children) {
        if (groupMap.has(childId)) {
          allGroupChildren.add(childId);
        }
      }
    }

    function renderGroupHierarchy(group: CanvasGroup, depth: number): void {
      const prefix = "  ".repeat(depth);
      lines.push(`${prefix}- **${group.label}** (${group.type})`);
      for (const childId of group.children) {
        const childGroup = groupMap.get(childId);
        if (childGroup) {
          renderGroupHierarchy(childGroup, depth + 1);
        } else {
          const node = nodeMap.get(childId);
          if (node) {
            lines.push(`${prefix}  - ${node.label}`);
          }
        }
      }
    }

    const topGroups = data.groups.filter((g) => !allGroupChildren.has(g.id));
    for (const group of topGroups) {
      renderGroupHierarchy(group, 0);
    }
    lines.push("");
  }

  lines.push("## リソース一覧", "");

  const categorized = new Map<string, CanvasNode[]>();
  const uncategorized: CanvasNode[] = [];

  for (const node of data.nodes) {
    const svc = serviceLookup.get(node.type);
    if (svc) {
      const list = categorized.get(svc.category);
      if (list) {
        list.push(node);
      } else {
        categorized.set(svc.category, [node]);
      }
    } else {
      uncategorized.push(node);
    }
  }

  for (const [category, nodes] of categorized) {
    const categoryLabel = CATEGORY_LABELS[category] ?? category;
    lines.push(`### ${categoryLabel}`, "");
    lines.push("| リソース名 | サービス | スペック |");
    lines.push("|-----------|---------|---------|");

    for (const node of nodes) {
      const svc = serviceLookup.get(node.type);
      const serviceName = svc?.name ?? node.type;
      const specStr =
        node.specs && Object.keys(node.specs).length > 0 ? formatSpecs(node.specs) : "-";
      lines.push(`| ${node.label} | ${serviceName} | ${specStr} |`);
    }
    lines.push("");
  }

  if (uncategorized.length > 0) {
    lines.push("### その他", "");
    lines.push("| リソース名 | タイプ | スペック |");
    lines.push("|-----------|-------|---------|");

    for (const node of uncategorized) {
      const specStr =
        node.specs && Object.keys(node.specs).length > 0 ? formatSpecs(node.specs) : "-";
      lines.push(`| ${node.label} | ${node.type} | ${specStr} |`);
    }
    lines.push("");
  }

  if (data.edges.length > 0) {
    lines.push("## 接続関係", "");
    lines.push("| 接続元 | 接続先 | ラベル | スタイル |");
    lines.push("|-------|-------|-------|---------|");

    for (const edge of data.edges) {
      const srcNode = nodeMap.get(edge.source);
      const tgtNode = nodeMap.get(edge.target);
      const srcLabel = srcNode?.label ?? edge.source;
      const tgtLabel = tgtNode?.label ?? edge.target;
      const edgeLabel = edge.label ?? "-";
      const styleLabel = STYLE_LABELS[edge.style ?? "solid"] ?? "実線";
      lines.push(`| ${srcLabel} | ${tgtLabel} | ${edgeLabel} | ${styleLabel} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
