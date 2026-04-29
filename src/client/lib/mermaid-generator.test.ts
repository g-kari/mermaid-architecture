import { describe, expect, it } from "vitest";
import type { CanvasData } from "../types";
import { canvasDataToMermaid } from "./mermaid-generator";

describe("canvasDataToMermaid", () => {
  it("空のデータでflowchart TDのみ出力", () => {
    const data: CanvasData = { nodes: [], edges: [], groups: [] };
    expect(canvasDataToMermaid(data)).toBe("flowchart TD");
  });

  it("ノードを出力", () => {
    const data: CanvasData = {
      nodes: [
        { id: "ec2-1", type: "ec2", label: "Web Server", x: 0, y: 0, width: 120, height: 80 },
      ],
      edges: [],
      groups: [],
    };
    const result = canvasDataToMermaid(data);
    expect(result).toContain('ec2-1["Web Server"]');
  });

  it("エッジのスタイルを反映", () => {
    const data: CanvasData = {
      nodes: [
        { id: "a", type: "ec2", label: "A", x: 0, y: 0, width: 120, height: 80 },
        { id: "b", type: "rds", label: "B", x: 200, y: 0, width: 120, height: 80 },
      ],
      edges: [{ id: "e1", source: "a", target: "b", style: "dashed", label: "query" }],
      groups: [],
    };
    const result = canvasDataToMermaid(data);
    expect(result).toContain("a -.->|query| b");
  });

  it("グループをsubgraphとして出力", () => {
    const data: CanvasData = {
      nodes: [{ id: "ec2-1", type: "ec2", label: "App", x: 0, y: 0, width: 120, height: 80 }],
      edges: [],
      groups: [{ id: "vpc-1", type: "vpc", label: "VPC", children: ["ec2-1"] }],
    };
    const result = canvasDataToMermaid(data);
    expect(result).toContain('subgraph vpc-1["VPC"]');
    expect(result).toContain('ec2-1["App"]');
    expect(result).toContain("end");
  });
});
