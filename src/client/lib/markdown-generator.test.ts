import { describe, expect, it } from "vitest";
import type { CanvasData } from "../types";
import { canvasDataToMarkdown } from "./markdown-generator";

describe("canvasDataToMarkdown", () => {
  it("空のデータでメッセージ出力", () => {
    const data: CanvasData = { nodes: [], edges: [], groups: [] };
    const result = canvasDataToMarkdown(data);
    expect(result).toContain("リソースが配置されていません");
  });

  it("ノードをカテゴリ別に一覧出力", () => {
    const data: CanvasData = {
      nodes: [
        { id: "ec2-1", type: "ec2", label: "Web Server", x: 0, y: 0, width: 80, height: 80 },
        { id: "rds-1", type: "rds", label: "Main DB", x: 200, y: 0, width: 80, height: 80 },
      ],
      edges: [],
      groups: [],
    };
    const result = canvasDataToMarkdown(data);
    expect(result).toContain("### Compute");
    expect(result).toContain("| Web Server | EC2 | - |");
    expect(result).toContain("### Database");
    expect(result).toContain("| Main DB | RDS | - |");
  });

  it("グループ所属を表示", () => {
    const data: CanvasData = {
      nodes: [{ id: "ec2-1", type: "ec2", label: "App", x: 0, y: 0, width: 80, height: 80 }],
      edges: [],
      groups: [{ id: "vpc-1", type: "vpc", label: "Production VPC", children: ["ec2-1"] }],
    };
    const result = canvasDataToMarkdown(data);
    expect(result).toContain("| App | EC2 | Production VPC |");
  });

  it("グループ構成をツリー出力", () => {
    const data: CanvasData = {
      nodes: [{ id: "ec2-1", type: "ec2", label: "App", x: 0, y: 0, width: 80, height: 80 }],
      edges: [],
      groups: [
        { id: "vpc-1", type: "vpc", label: "VPC", children: ["subnet-1"] },
        { id: "subnet-1", type: "subnet", label: "Public Subnet", children: ["ec2-1"] },
      ],
    };
    const result = canvasDataToMarkdown(data);
    expect(result).toContain("### VPC (vpc)");
    expect(result).toContain("**Public Subnet** (subnet)");
    expect(result).toContain("- App (EC2)");
  });

  it("接続関係を表で出力", () => {
    const data: CanvasData = {
      nodes: [
        { id: "a", type: "ec2", label: "Web", x: 0, y: 0, width: 80, height: 80 },
        { id: "b", type: "rds", label: "DB", x: 200, y: 0, width: 80, height: 80 },
      ],
      edges: [{ id: "e1", source: "a", target: "b", label: "SQL", style: "dashed" }],
      groups: [],
    };
    const result = canvasDataToMarkdown(data);
    expect(result).toContain("## 接続関係");
    expect(result).toContain("| Web | DB | SQL | 破線 |");
  });

  it("エッジのラベルなし・スタイルなしのデフォルト", () => {
    const data: CanvasData = {
      nodes: [
        { id: "a", type: "ec2", label: "A", x: 0, y: 0, width: 80, height: 80 },
        { id: "b", type: "s3", label: "B", x: 200, y: 0, width: 80, height: 80 },
      ],
      edges: [{ id: "e1", source: "a", target: "b" }],
      groups: [],
    };
    const result = canvasDataToMarkdown(data);
    expect(result).toContain("| A | B | - | 実線 |");
  });

  it("暗黙的なグループ所属(node.group)も検出", () => {
    const data: CanvasData = {
      nodes: [
        {
          id: "ec2-1",
          type: "ec2",
          label: "App",
          x: 0,
          y: 0,
          width: 80,
          height: 80,
          group: "vpc-1",
        },
      ],
      edges: [],
      groups: [{ id: "vpc-1", type: "vpc", label: "VPC", children: [] }],
    };
    const result = canvasDataToMarkdown(data);
    expect(result).toContain("| App | EC2 | VPC |");
  });
});
