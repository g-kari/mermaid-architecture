import type { CanvasData, CanvasGroup, CanvasNode } from "../types";
import { getServiceDef } from "./aws-services";

interface TerraformMapping {
  resource: string;
  specMap: Record<string, string>;
  extraAttrs?: Record<string, string>;
}

const SERVICE_TO_TERRAFORM: Record<string, TerraformMapping> = {
  ec2: { resource: "aws_instance", specMap: { instanceType: "instance_type", ami: "ami" } },
  lambda: {
    resource: "aws_lambda_function",
    specMap: { runtime: "runtime", memory: "memory_size", timeout: "timeout" },
  },
  s3: { resource: "aws_s3_bucket", specMap: {} },
  rds: {
    resource: "aws_db_instance",
    specMap: { engine: "engine", instanceClass: "instance_class", multiAz: "multi_az" },
  },
  aurora: { resource: "aws_rds_cluster", specMap: { engine: "engine" } },
  dynamodb: { resource: "aws_dynamodb_table", specMap: { capacityMode: "billing_mode" } },
  ecs: { resource: "aws_ecs_cluster", specMap: {} },
  "ecs-fargate": { resource: "aws_ecs_cluster", specMap: {} },
  eks: { resource: "aws_eks_cluster", specMap: { version: "version" } },
  ecr: { resource: "aws_ecr_repository", specMap: {} },
  alb: {
    resource: "aws_lb",
    specMap: { scheme: "internal" },
    extraAttrs: { load_balancer_type: "application" },
  },
  nlb: {
    resource: "aws_lb",
    specMap: { scheme: "internal" },
    extraAttrs: { load_balancer_type: "network" },
  },
  cloudfront: { resource: "aws_cloudfront_distribution", specMap: {} },
  route53: { resource: "aws_route53_zone", specMap: { domain: "name" } },
  "api-gateway": { resource: "aws_api_gateway_rest_api", specMap: {} },
  "nat-gateway": { resource: "aws_nat_gateway", specMap: {} },
  sqs: { resource: "aws_sqs_queue", specMap: { type: "fifo_queue" } },
  sns: { resource: "aws_sns_topic", specMap: {} },
  eventbridge: { resource: "aws_cloudwatch_event_bus", specMap: {} },
  cognito: { resource: "aws_cognito_user_pool", specMap: {} },
  waf: { resource: "aws_wafv2_web_acl", specMap: {} },
  acm: { resource: "aws_acm_certificate", specMap: {} },
  kms: { resource: "aws_kms_key", specMap: {} },
  "secrets-manager": { resource: "aws_secretsmanager_secret", specMap: {} },
  cloudwatch: {
    resource: "aws_cloudwatch_log_group",
    specMap: { logRetention: "retention_in_days" },
  },
  cloudtrail: { resource: "aws_cloudtrail", specMap: {} },
  kinesis: { resource: "aws_kinesis_stream", specMap: {} },
  opensearch: { resource: "aws_opensearch_domain", specMap: {} },
  elasticache: {
    resource: "aws_elasticache_cluster",
    specMap: { engine: "engine", nodeType: "node_type", nodes: "num_cache_nodes" },
  },
  redshift: {
    resource: "aws_redshift_cluster",
    specMap: { nodeType: "node_type", nodes: "number_of_nodes" },
  },
  sagemaker: {
    resource: "aws_sagemaker_notebook_instance",
    specMap: { instanceType: "instance_type" },
  },
  amplify: { resource: "aws_amplify_app", specMap: {} },
  codepipeline: { resource: "aws_codepipeline", specMap: {} },
  codebuild: { resource: "aws_codebuild_project", specMap: {} },
  efs: {
    resource: "aws_efs_file_system",
    specMap: { performanceMode: "performance_mode", throughputMode: "throughput_mode" },
  },
  ebs: {
    resource: "aws_ebs_volume",
    specMap: { volumeType: "type", size: "size", iops: "iops" },
  },
};

function sanitizeResourceName(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function findParentGroup(nodeId: string, groups: CanvasGroup[]): CanvasGroup | undefined {
  return groups.find((g) => g.children.includes(nodeId));
}

function resolveNodeLabel(nodeId: string, data: CanvasData): string {
  const node = data.nodes.find((n) => n.id === nodeId);
  return node ? node.label : nodeId;
}

function buildResourceBlock(
  resourceType: string,
  resourceName: string,
  attrs: { key: string; value: string; isComment?: boolean }[],
  tagName: string,
  groupComment?: string,
): string {
  const lines: string[] = [];
  if (groupComment) {
    lines.push(groupComment);
  }
  lines.push(`resource "${resourceType}" "${resourceName}" {`);
  for (const attr of attrs) {
    if (attr.isComment) {
      lines.push(`  # ${attr.key} = ${attr.value}`);
    } else {
      lines.push(`  ${attr.key} = "${attr.value}"`);
    }
  }
  lines.push("  tags = {");
  lines.push(`    Name = "${tagName}"`);
  lines.push("  }");
  lines.push("}");
  return lines.join("\n");
}

function deduplicateResourceNames(
  entries: { resourceType: string; resourceName: string }[],
): Map<number, string> {
  const nameCount = new Map<string, number>();
  const result = new Map<number, string>();

  for (let i = 0; i < entries.length; i++) {
    const key = `${entries[i].resourceType}:${entries[i].resourceName}`;
    const count = nameCount.get(key) ?? 0;
    nameCount.set(key, count + 1);
  }

  const nameUsed = new Map<string, number>();
  for (let i = 0; i < entries.length; i++) {
    const key = `${entries[i].resourceType}:${entries[i].resourceName}`;
    const total = nameCount.get(key)!;
    if (total === 1) {
      result.set(i, entries[i].resourceName);
    } else {
      const used = nameUsed.get(key) ?? 0;
      nameUsed.set(key, used + 1);
      result.set(
        i,
        used === 0 ? entries[i].resourceName : `${entries[i].resourceName}_${used + 1}`,
      );
    }
  }

  return result;
}

export function canvasDataToTerraform(data: CanvasData): string {
  const lines: string[] = [];

  lines.push("# ============================================================");
  lines.push("# Terraform / OpenTofu 構成ファイル");
  lines.push("# Generated by Mermaid Architecture");
  lines.push("# ============================================================");
  lines.push("");
  lines.push("terraform {");
  lines.push("  required_providers {");
  lines.push("    aws = {");
  lines.push('      source  = "hashicorp/aws"');
  lines.push('      version = "~> 5.0"');
  lines.push("    }");
  lines.push("  }");
  lines.push("}");
  lines.push("");
  lines.push('provider "aws" {');
  lines.push('  region = "ap-northeast-1"');
  lines.push("}");

  const vpcGroups = data.groups.filter((g) => g.type === "vpc");
  const subnetGroups = data.groups.filter((g) => g.type === "subnet");
  const otherGroups = data.groups.filter((g) => g.type !== "vpc" && g.type !== "subnet");

  if (vpcGroups.length > 0 || subnetGroups.length > 0) {
    lines.push("");
    lines.push("# ------------------------------------------------------------");
    lines.push("# VPC / ネットワーク");
    lines.push("# ------------------------------------------------------------");

    for (const vpc of vpcGroups) {
      const name = sanitizeResourceName(vpc.label) || "main_vpc";
      lines.push(`resource "aws_vpc" "${name}" {`);
      lines.push('  cidr_block = "10.0.0.0/16"');
      lines.push("  tags = {");
      lines.push(`    Name = "${vpc.label}"`);
      lines.push("  }");
      lines.push("}");
    }

    for (const subnet of subnetGroups) {
      const name = sanitizeResourceName(subnet.label) || "main_subnet";
      const parentVpc = data.groups.find((g) => g.type === "vpc" && g.children.includes(subnet.id));
      lines.push("");
      lines.push(`resource "aws_subnet" "${name}" {`);
      if (parentVpc) {
        const vpcName = sanitizeResourceName(parentVpc.label) || "main_vpc";
        lines.push(`  vpc_id     = aws_vpc.${vpcName}.id`);
      } else {
        lines.push("  # vpc_id = <VPC IDを指定してください>");
      }
      lines.push('  cidr_block = "10.0.1.0/24"');
      lines.push("  tags = {");
      lines.push(`    Name = "${subnet.label}"`);
      lines.push("  }");
      lines.push("}");
    }
  }

  for (const group of otherGroups) {
    lines.push("");
    lines.push(`# --- ${group.label} (${group.type}) ---`);
  }

  const supportedNodes: {
    node: CanvasNode;
    mapping: TerraformMapping;
    resourceType: string;
    resourceName: string;
  }[] = [];
  const unsupportedNodes: CanvasNode[] = [];

  for (const node of data.nodes) {
    const mapping = SERVICE_TO_TERRAFORM[node.type];
    if (mapping) {
      const resourceName = sanitizeResourceName(node.label) || node.type;
      supportedNodes.push({
        node,
        mapping,
        resourceType: mapping.resource,
        resourceName,
      });
    } else {
      unsupportedNodes.push(node);
    }
  }

  const deduped = deduplicateResourceNames(
    supportedNodes.map((e) => ({
      resourceType: e.resourceType,
      resourceName: e.resourceName,
    })),
  );

  if (supportedNodes.length > 0) {
    lines.push("");
    lines.push("# ------------------------------------------------------------");
    lines.push("# リソース");
    lines.push("# ------------------------------------------------------------");

    for (let i = 0; i < supportedNodes.length; i++) {
      const { node, mapping } = supportedNodes[i];
      const finalName = deduped.get(i)!;
      const attrs: { key: string; value: string; isComment?: boolean }[] = [];

      if (mapping.extraAttrs) {
        for (const [key, value] of Object.entries(mapping.extraAttrs)) {
          attrs.push({ key, value });
        }
      }

      if (node.specs) {
        for (const [specKey, specValue] of Object.entries(node.specs)) {
          if (specValue === "") continue;
          const tfKey = mapping.specMap[specKey];
          if (tfKey) {
            attrs.push({ key: tfKey, value: specValue });
          } else {
            attrs.push({ key: specKey, value: specValue, isComment: true });
          }
        }
      }

      const parentGroup = findParentGroup(node.id, data.groups);
      let groupComment: string | undefined;
      if (parentGroup) {
        groupComment = `# ${parentGroup.label} (${parentGroup.type}) 内`;
      }

      lines.push("");
      lines.push(buildResourceBlock(mapping.resource, finalName, attrs, node.label, groupComment));
    }
  }

  if (unsupportedNodes.length > 0) {
    lines.push("");
    lines.push("# ------------------------------------------------------------");
    lines.push("# 未対応リソース");
    lines.push("# ------------------------------------------------------------");
    for (const node of unsupportedNodes) {
      const def = getServiceDef(node.type);
      const name = def?.name ?? node.type;
      lines.push(`# 未対応: ${name} (${node.type})`);
      lines.push("# TODO: 手動でリソースを追加してください");
    }
  }

  if (data.edges.length > 0) {
    lines.push("");
    lines.push("# ------------------------------------------------------------");
    lines.push("# 接続関係");
    lines.push("# ------------------------------------------------------------");
    for (const edge of data.edges) {
      const sourceLabel = sanitizeResourceName(resolveNodeLabel(edge.source, data));
      const targetLabel = sanitizeResourceName(resolveNodeLabel(edge.target, data));
      const label = edge.label ? ` (${edge.label})` : "";
      lines.push(`# ${sourceLabel} --> ${targetLabel}${label}`);
    }
  }

  lines.push("");
  return lines.join("\n");
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
