import type { CanvasData, CanvasEdge, CanvasGroup, CanvasNode } from "../types";
import { getServiceDef } from "./aws-services";

const GROUP_COLORS: Record<string, string> = {
  vpc: "#8C4FFF",
  subnet: "#3F8624",
  az: "#ED7100",
  region: "#2E27AD",
  generic: "#6b7280",
};

const GROUP_PADDING = 24;
const GROUP_HEADER_HEIGHT = 28;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function darkenColor(hex: string): string {
  const r = Math.max(0, Number.parseInt(hex.slice(1, 3), 16) - 40);
  const g = Math.max(0, Number.parseInt(hex.slice(3, 5), 16) - 40);
  const b = Math.max(0, Number.parseInt(hex.slice(5, 7), 16) - 40);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

interface GroupBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

function computeGroupBounds(
  group: CanvasGroup,
  nodes: CanvasNode[],
  groups: CanvasGroup[],
): GroupBounds | null {
  const childNodes = nodes.filter((n) => group.children.includes(n.id));
  const childGroups = groups.filter((g) => group.children.includes(g.id));

  const rects: { x: number; y: number; right: number; bottom: number }[] = [];

  for (const node of childNodes) {
    rects.push({
      x: node.x,
      y: node.y,
      right: node.x + node.width,
      bottom: node.y + node.height,
    });
  }

  for (const childGroup of childGroups) {
    const childBounds = computeGroupBounds(childGroup, nodes, groups);
    if (childBounds) {
      rects.push({
        x: childBounds.x,
        y: childBounds.y,
        right: childBounds.x + childBounds.width,
        bottom: childBounds.y + childBounds.height,
      });
    }
  }

  if (rects.length === 0) return null;

  const minX = Math.min(...rects.map((r) => r.x)) - GROUP_PADDING;
  const minY = Math.min(...rects.map((r) => r.y)) - GROUP_PADDING - GROUP_HEADER_HEIGHT;
  const maxX = Math.max(...rects.map((r) => r.right)) + GROUP_PADDING;
  const maxY = Math.max(...rects.map((r) => r.bottom)) + GROUP_PADDING;

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function buildGroupCell(group: CanvasGroup, bounds: GroupBounds): string {
  const color = GROUP_COLORS[group.type] ?? GROUP_COLORS.generic;
  const style = `rounded=1;whiteSpace=wrap;html=1;container=1;collapsible=0;fillColor=none;strokeColor=${color};dashed=1;dashPattern=8 4;strokeWidth=1.5;fontSize=11;fontStyle=1;verticalAlign=top;align=left;spacingLeft=8;`;
  return `        <mxCell id="${escapeXml(group.id)}" value="${escapeXml(group.label)}" style="${style}" vertex="1" parent="1">\n          <mxGeometry x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" as="geometry" />\n        </mxCell>`;
}

function findParentGroup(nodeId: string, groups: CanvasGroup[]): CanvasGroup | undefined {
  return groups.find((g) => g.children.includes(nodeId));
}

function buildNodeCell(
  node: CanvasNode,
  groups: CanvasGroup[],
  groupBoundsMap: Map<string, GroupBounds>,
): string {
  const service = getServiceDef(node.type);
  const fillColor = service?.color ?? "#6b7280";
  const strokeColor = darkenColor(fillColor);
  const parent = findParentGroup(node.id, groups);

  let x = node.x;
  let y = node.y;
  let parentId = "1";

  if (parent) {
    const parentBounds = groupBoundsMap.get(parent.id);
    if (parentBounds) {
      x = node.x - parentBounds.x;
      y = node.y - parentBounds.y;
    }
    parentId = parent.id;
  }

  const style = `rounded=1;whiteSpace=wrap;html=1;fillColor=${fillColor};fontColor=#FFFFFF;strokeColor=${strokeColor};fontSize=11;`;
  return `        <mxCell id="${escapeXml(node.id)}" value="${escapeXml(node.label)}" style="${style}" vertex="1" parent="${escapeXml(parentId)}">\n          <mxGeometry x="${x}" y="${y}" width="${node.width}" height="${node.height}" as="geometry" />\n        </mxCell>`;
}

function buildEdgeCell(edge: CanvasEdge): string {
  let dashStyle = "";
  if (edge.style === "dashed") {
    dashStyle = "dashed=1;dashPattern=8 4;";
  } else if (edge.style === "dotted") {
    dashStyle = "dashed=1;dashPattern=2 4;";
  }

  const style = `edgeStyle=orthogonalEdgeStyle;rounded=1;${dashStyle}`;
  const label = edge.label ? escapeXml(edge.label) : "";
  return `        <mxCell id="${escapeXml(edge.id)}" value="${label}" style="${style}" edge="1" source="${escapeXml(edge.source)}" target="${escapeXml(edge.target)}" parent="1">\n          <mxGeometry relative="1" as="geometry" />\n        </mxCell>`;
}

export function canvasDataToDrawio(data: CanvasData): string {
  const modified = new Date().toISOString();

  const groupBoundsMap = new Map<string, GroupBounds>();
  for (const group of data.groups) {
    const bounds = computeGroupBounds(group, data.nodes, data.groups);
    if (bounds) {
      groupBoundsMap.set(group.id, bounds);
    }
  }

  const cells: string[] = ['        <mxCell id="0" />', '        <mxCell id="1" parent="0" />'];

  for (const group of data.groups) {
    const bounds = groupBoundsMap.get(group.id);
    if (bounds) {
      cells.push(buildGroupCell(group, bounds));
    }
  }

  for (const node of data.nodes) {
    cells.push(buildNodeCell(node, data.groups, groupBoundsMap));
  }

  for (const edge of data.edges) {
    cells.push(buildEdgeCell(edge));
  }

  return `<mxfile host="app.diagrams.net" modified="${modified}" type="device">
  <diagram id="aws-architecture" name="AWS Architecture">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
${cells.join("\n")}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

export function downloadDrawio(xmlString: string, filename = "architecture.drawio"): void {
  const blob = new Blob([xmlString], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
