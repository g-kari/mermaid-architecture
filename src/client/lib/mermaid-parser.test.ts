import { describe, expect, it } from "vitest";
import { parseMermaid } from "./mermaid-parser";

describe("parseMermaid", () => {
  it("空文字列で空のCanvasDataを返す", () => {
    const result = parseMermaid("");
    expect(result).toEqual({ nodes: [], edges: [], groups: [] });
  });

  it("ノード宣言をパースする", () => {
    const code = `flowchart TD
  ec2-1["Web Server"]`;
    const result = parseMermaid(code);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe("ec2-1");
    expect(result.nodes[0].label).toBe("Web Server");
    expect(result.nodes[0].type).toBe("ec2");
    expect(result.nodes[0].width).toBe(80);
    expect(result.nodes[0].height).toBe(80);
  });

  it("solidエッジをパースする", () => {
    const code = `flowchart TD
  a["A"]
  b["B"]
  a --> b`;
    const result = parseMermaid(code);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].source).toBe("a");
    expect(result.edges[0].target).toBe("b");
    expect(result.edges[0].style).toBeUndefined();
  });

  it("dashedエッジをパースする", () => {
    const code = `flowchart TD
  a["A"]
  b["B"]
  a -.-> b`;
    const result = parseMermaid(code);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].style).toBe("dashed");
  });

  it("dottedエッジをパースする", () => {
    const code = `flowchart TD
  a["A"]
  b["B"]
  a -..-> b`;
    const result = parseMermaid(code);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].style).toBe("dotted");
  });

  it("ラベル付きエッジをパースする", () => {
    const code = `flowchart TD
  a["A"]
  b["B"]
  a -->|query| b`;
    const result = parseMermaid(code);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].label).toBe("query");
  });

  it("subgraphをグループとしてパースする", () => {
    const code = `flowchart TD
  subgraph vpc-1["VPC"]
    ec2-1["App"]
  end`;
    const result = parseMermaid(code);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].id).toBe("vpc-1");
    expect(result.groups[0].label).toBe("VPC");
    expect(result.groups[0].type).toBe("vpc");
    expect(result.groups[0].children).toContain("ec2-1");
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].group).toBe("vpc-1");
  });

  it("ネストしたsubgraphをパースする", () => {
    const code = `flowchart TD
  subgraph vpc["VPC"]
    subgraph subnet["Public Subnet"]
      alb["ALB"]
    end
  end`;
    const result = parseMermaid(code);
    expect(result.groups).toHaveLength(2);
    const vpcGroup = result.groups.find((g) => g.id === "vpc");
    const subnetGroup = result.groups.find((g) => g.id === "subnet");
    expect(vpcGroup?.children).toContain("subnet");
    expect(subnetGroup?.children).toContain("alb");
    expect(subnetGroup?.type).toBe("subnet");
  });

  it("specsコメントをパースする", () => {
    const code = `flowchart TD
  ec2-1["Web Server"]
  %% specs: instanceType=t3.micro, ami=Amazon Linux 2023`;
    const result = parseMermaid(code);
    expect(result.nodes[0].specs).toEqual({
      instanceType: "t3.micro",
      ami: "Amazon Linux 2023",
    });
  });

  it("エッジのみのノードを自動生成する", () => {
    const code = `flowchart TD
  a --> b`;
    const result = parseMermaid(code);
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes.find((n) => n.id === "a")).toBeDefined();
    expect(result.nodes.find((n) => n.id === "b")).toBeDefined();
  });

  it("サービスタイプを正しく検出する", () => {
    const code = `flowchart TD
  cloudfront["CDN"]
  rds-1["Database"]
  unknown-node["Something"]`;
    const result = parseMermaid(code);
    expect(result.nodes.find((n) => n.id === "cloudfront")?.type).toBe("cloudfront");
    expect(result.nodes.find((n) => n.id === "rds-1")?.type).toBe("rds");
    expect(result.nodes.find((n) => n.id === "unknown-node")?.type).toBe("ec2");
  });

  it("不正な行をスキップする", () => {
    const code = `flowchart TD
  ec2-1["Web Server"]
  this is not valid mermaid
  rds-1["DB"]`;
    const result = parseMermaid(code);
    expect(result.nodes).toHaveLength(2);
  });
});
