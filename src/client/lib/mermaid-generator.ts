import type { CanvasData, CanvasGroup } from "../types";

export function canvasDataToMermaid(data: CanvasData): string {
  const lines: string[] = ["flowchart TD"];

  const topLevelGroups = data.groups.filter(
    (g) => !data.groups.some((parent) => parent.children.includes(g.id)),
  );

  const nodesInGroups = new Set<string>();
  for (const g of data.groups) {
    for (const childId of g.children) {
      nodesInGroups.add(childId);
    }
  }

  function renderGroup(group: CanvasGroup, indent: string) {
    lines.push(`${indent}subgraph ${sanitizeId(group.id)}["${escapeLabel(group.label)}"]`);
    const childIndent = `${indent}  `;

    for (const childId of group.children) {
      const childGroup = data.groups.find((g) => g.id === childId);
      if (childGroup) {
        renderGroup(childGroup, childIndent);
        continue;
      }
      const node = data.nodes.find((n) => n.id === childId);
      if (node) {
        lines.push(`${childIndent}${sanitizeId(node.id)}["${escapeLabel(node.label)}"]`);
      }
    }

    const implicitChildren = data.nodes.filter(
      (n) => n.group === group.id && !group.children.includes(n.id),
    );
    for (const node of implicitChildren) {
      lines.push(`${childIndent}${sanitizeId(node.id)}["${escapeLabel(node.label)}"]`);
    }

    lines.push(`${indent}end`);
  }

  for (const group of topLevelGroups) {
    renderGroup(group, "  ");
  }

  for (const node of data.nodes) {
    if (!nodesInGroups.has(node.id) && !node.group) {
      lines.push(`  ${sanitizeId(node.id)}["${escapeLabel(node.label)}"]`);
    }
  }

  for (const edge of data.edges) {
    const arrow = getArrow(edge.style);
    const label = edge.label ? `|${escapeLabel(edge.label)}|` : "";
    lines.push(`  ${sanitizeId(edge.source)} ${arrow}${label} ${sanitizeId(edge.target)}`);
  }

  return lines.join("\n");
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function escapeLabel(label: string): string {
  return label.replace(/"/g, "'");
}

function getArrow(style?: string): string {
  switch (style) {
    case "dashed":
      return "-.->";
    case "dotted":
      return "-..->";
    default:
      return "-->";
  }
}
