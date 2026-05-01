import { describe, expect, it } from "vitest";
import type { TerraformInput } from "../src";
import { generateTerraform } from "../src";

describe("generateTerraform", () => {
  it("空の入力でterraformブロックとproviderブロックが含まれる", () => {
    const input: TerraformInput = { nodes: [], edges: [], groups: [] };
    const result = generateTerraform(input);
    expect(result).toContain("terraform");
    expect(result).toContain("provider");
    expect(result).toContain("hashicorp/aws");
  });

  it("リージョンとバージョンのカスタマイズ", () => {
    const input: TerraformInput = { nodes: [], edges: [], groups: [] };
    const result = generateTerraform(input, {
      region: "us-east-1",
      providerVersion: "~> 4.0",
    });
    expect(result).toContain("us-east-1");
    expect(result).toContain("~> 4.0");
  });

  it("単一ノード（EC2）のリソースが出力される", () => {
    const input: TerraformInput = {
      nodes: [
        {
          id: "node-1",
          type: "ec2",
          label: "Web Server",
          specs: { instanceType: "t3.micro", ami: "ami-12345" },
        },
      ],
      edges: [],
      groups: [],
    };
    const result = generateTerraform(input);
    expect(result).toContain("aws_instance");
    expect(result).toContain('instance_type = "t3.micro"');
    expect(result).toContain('ami = "ami-12345"');
    expect(result).toContain('Name = "Web Server"');
  });

  it("複数ノード（S3 + Lambda）のリソースが出力される", () => {
    const input: TerraformInput = {
      nodes: [
        { id: "n1", type: "s3", label: "Assets Bucket" },
        {
          id: "n2",
          type: "lambda",
          label: "Processor",
          specs: { runtime: "nodejs20.x", memory: "256" },
        },
      ],
      edges: [],
      groups: [],
    };
    const result = generateTerraform(input);
    expect(result).toContain("aws_s3_bucket");
    expect(result).toContain("aws_lambda_function");
    expect(result).toContain("nodejs20.x");
    expect(result).toContain("memory_size");
  });

  it("VPCグループのリソースが出力される", () => {
    const input: TerraformInput = {
      nodes: [{ id: "n1", type: "ec2", label: "App" }],
      edges: [],
      groups: [{ id: "g1", type: "vpc", label: "Production VPC", children: ["n1"] }],
    };
    const result = generateTerraform(input);
    expect(result).toContain("aws_vpc");
    expect(result).toContain('Name = "Production VPC"');
  });

  it("エッジの接続関係がコメントに出力される", () => {
    const input: TerraformInput = {
      nodes: [
        { id: "n1", type: "alb", label: "ALB" },
        { id: "n2", type: "ec2", label: "Server" },
      ],
      edges: [{ id: "e1", source: "n1", target: "n2", label: "HTTPS" }],
      groups: [],
    };
    const result = generateTerraform(input);
    expect(result).toContain("alb --> server (HTTPS)");
  });

  it("未対応サービスにコメントが出力される", () => {
    const input: TerraformInput = {
      nodes: [{ id: "n1", type: "user", label: "Client" }],
      edges: [],
      groups: [],
    };
    const result = generateTerraform(input);
    expect(result).toContain("未対応");
  });

  it("serviceLabelResolverで未対応サービスの表示名を解決できる", () => {
    const input: TerraformInput = {
      nodes: [{ id: "n1", type: "user", label: "Client" }],
      edges: [],
      groups: [],
    };
    const result = generateTerraform(input, {
      serviceLabelResolver: (type) => (type === "user" ? "User/Client" : undefined),
    });
    expect(result).toContain("未対応: User/Client (user)");
  });

  it("同名ラベルのリソースに重複回避サフィックスがつく", () => {
    const input: TerraformInput = {
      nodes: [
        { id: "n1", type: "ec2", label: "Server" },
        { id: "n2", type: "ec2", label: "Server" },
      ],
      edges: [],
      groups: [],
    };
    const result = generateTerraform(input);
    expect(result).toContain("_2");
  });

  it("日本語ラベルがサニタイズされる", () => {
    const input: TerraformInput = {
      nodes: [{ id: "n1", type: "ec2", label: "ウェブサーバー" }],
      edges: [],
      groups: [],
    };
    const result = generateTerraform(input);
    expect(result).not.toMatch(/resource\s+"aws_instance"\s+"ウェブサーバー"/);
    expect(result).toMatch(/resource\s+"aws_instance"\s+"[a-z0-9_]+"/);
  });
});
