import { describe, expect, it } from "vitest";
import type { CanvasData } from "../types";
import { canvasDataToTerraform } from "./terraform-generator";

describe("canvasDataToTerraform", () => {
  it("空のCanvasDataでterraformブロックとproviderブロックが含まれる", () => {
    const emptyData: CanvasData = { nodes: [], edges: [], groups: [] };
    const result = canvasDataToTerraform(emptyData);
    expect(result).toContain("terraform");
    expect(result).toContain("provider");
    expect(result).toContain("hashicorp/aws");
  });

  it("単一ノード（EC2）のリソースが出力される", () => {
    const data: CanvasData = {
      nodes: [
        {
          id: "node-1",
          type: "ec2",
          label: "Web Server",
          x: 0,
          y: 0,
          width: 80,
          height: 80,
          specs: { instanceType: "t3.micro", ami: "ami-12345" },
        },
      ],
      edges: [],
      groups: [],
    };
    const result = canvasDataToTerraform(data);
    expect(result).toContain("aws_instance");
    expect(result).toContain('instance_type = "t3.micro"');
    expect(result).toContain('ami = "ami-12345"');
    expect(result).toContain('Name = "Web Server"');
  });

  it("複数ノード（S3 + Lambda）のリソースが出力される", () => {
    const data: CanvasData = {
      nodes: [
        {
          id: "n1",
          type: "s3",
          label: "Assets Bucket",
          x: 0,
          y: 0,
          width: 80,
          height: 80,
        },
        {
          id: "n2",
          type: "lambda",
          label: "Processor",
          x: 100,
          y: 0,
          width: 80,
          height: 80,
          specs: { runtime: "nodejs20.x", memory: "256" },
        },
      ],
      edges: [],
      groups: [],
    };
    const result = canvasDataToTerraform(data);
    expect(result).toContain("aws_s3_bucket");
    expect(result).toContain("aws_lambda_function");
    expect(result).toContain("nodejs20.x");
    expect(result).toContain("memory_size");
  });

  it("VPCグループのリソースが出力される", () => {
    const data: CanvasData = {
      nodes: [
        {
          id: "n1",
          type: "ec2",
          label: "App",
          x: 0,
          y: 0,
          width: 80,
          height: 80,
        },
      ],
      edges: [],
      groups: [
        {
          id: "g1",
          type: "vpc",
          label: "Production VPC",
          children: ["n1"],
        },
      ],
    };
    const result = canvasDataToTerraform(data);
    expect(result).toContain("aws_vpc");
    expect(result).toContain('Name = "Production VPC"');
  });

  it("エッジの接続関係がコメントに出力される", () => {
    const data: CanvasData = {
      nodes: [
        {
          id: "n1",
          type: "alb",
          label: "ALB",
          x: 0,
          y: 0,
          width: 80,
          height: 80,
        },
        {
          id: "n2",
          type: "ec2",
          label: "Server",
          x: 100,
          y: 0,
          width: 80,
          height: 80,
        },
      ],
      edges: [{ id: "e1", source: "n1", target: "n2", label: "HTTPS" }],
      groups: [],
    };
    const result = canvasDataToTerraform(data);
    expect(result).toContain("ALB");
    expect(result).toContain("Server");
  });

  it("未対応サービスにコメントが出力される", () => {
    const data: CanvasData = {
      nodes: [
        {
          id: "n1",
          type: "user",
          label: "Client",
          x: 0,
          y: 0,
          width: 80,
          height: 80,
        },
      ],
      edges: [],
      groups: [],
    };
    const result = canvasDataToTerraform(data);
    expect(result).toContain("未対応");
  });

  it("日本語ラベルがサニタイズされる", () => {
    const data: CanvasData = {
      nodes: [
        {
          id: "n1",
          type: "ec2",
          label: "ウェブサーバー",
          x: 0,
          y: 0,
          width: 80,
          height: 80,
        },
      ],
      edges: [],
      groups: [],
    };
    const result = canvasDataToTerraform(data);
    expect(result).not.toMatch(/resource\s+"aws_instance"\s+"ウェブサーバー"/);
    expect(result).toMatch(/resource\s+"aws_instance"\s+"[a-z0-9_]+"/);
  });

  it("同名ラベルのリソースに重複回避サフィックスがつく", () => {
    const data: CanvasData = {
      nodes: [
        {
          id: "n1",
          type: "ec2",
          label: "Server",
          x: 0,
          y: 0,
          width: 80,
          height: 80,
        },
        {
          id: "n2",
          type: "ec2",
          label: "Server",
          x: 100,
          y: 0,
          width: 80,
          height: 80,
        },
      ],
      edges: [],
      groups: [],
    };
    const result = canvasDataToTerraform(data);
    expect(result).toContain("_2");
  });
});
