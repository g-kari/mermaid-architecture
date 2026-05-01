import { generateTerraform } from "@mermaid-architecture/terraform-generator";
import type { CanvasData } from "../types";
import { getServiceDef } from "./aws-services";

export function canvasDataToTerraform(data: CanvasData): string {
  return generateTerraform(
    {
      nodes: data.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.label,
        specs: n.specs,
      })),
      edges: data.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
      })),
      groups: data.groups.map((g) => ({
        id: g.id,
        type: g.type,
        label: g.label,
        children: g.children,
      })),
    },
    {
      serviceLabelResolver: (type) => getServiceDef(type)?.name,
    },
  );
}

export function downloadTerraform(code: string, filename = "main.tf"): void {
  const blob = new Blob([code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
