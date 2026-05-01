import { nanoid } from "nanoid";
import type { CanvasData, CanvasEdge, CanvasGroup, CanvasNode } from "../types";

const KNOWN_SERVICE_IDS = new Set([
  "ec2",
  "lambda",
  "lightsail",
  "batch",
  "elastic-beanstalk",
  "app-runner",
  "ecs",
  "ecs-fargate",
  "eks",
  "ecr",
  "s3",
  "efs",
  "ebs",
  "glacier",
  "backup",
  "storage-gateway",
  "rds",
  "aurora",
  "dynamodb",
  "elasticache",
  "redshift",
  "neptune",
  "documentdb",
  "keyspaces",
  "timestream",
  "vpc",
  "alb",
  "nlb",
  "cloudfront",
  "route53",
  "api-gateway",
  "nat-gateway",
  "direct-connect",
  "global-accelerator",
  "transit-gateway",
  "sqs",
  "sns",
  "eventbridge",
  "ses",
  "step-functions",
  "appsync",
  "mq",
  "app-mesh",
  "iam",
  "waf",
  "acm",
  "cognito",
  "kms",
  "secrets-manager",
  "shield",
  "guardduty",
  "security-hub",
  "cloudwatch",
  "cloudformation",
  "ssm",
  "cloudtrail",
  "config",
  "trusted-advisor",
  "organizations",
  "kinesis",
  "athena",
  "glue",
  "quicksight",
  "msk",
  "opensearch",
  "lake-formation",
  "emr",
  "codepipeline",
  "codecommit",
  "codebuild",
  "codedeploy",
  "codestar",
  "xray",
  "amplify",
  "sagemaker",
  "bedrock",
  "user",
]);

function detectServiceType(nodeId: string): string {
  if (KNOWN_SERVICE_IDS.has(nodeId)) {
    return nodeId;
  }

  const stripped = nodeId.replace(/-\d+$/, "");
  if (KNOWN_SERVICE_IDS.has(stripped)) {
    return stripped;
  }

  return "ec2";
}

function detectGroupType(id: string, label: string): string {
  const combined = `${id} ${label}`.toLowerCase();
  if (combined.includes("subnet")) return "subnet";
  if (combined.includes("vpc")) return "vpc";
  if (combined.includes("az") || combined.includes("availability")) return "az";
  if (combined.includes("region")) return "region";
  return "generic";
}

function parseSpecs(line: string): Record<string, string> | undefined {
  const match = line.match(/%%\s*specs:\s*(.+)/);
  if (!match) return undefined;

  const specs: Record<string, string> = {};
  const raw = match[1];
  const pairs = raw.split(",");
  for (const pair of pairs) {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) continue;
    const key = pair.slice(0, eqIndex).trim();
    const value = pair.slice(eqIndex + 1).trim();
    if (key) {
      specs[key] = value;
    }
  }
  return Object.keys(specs).length > 0 ? specs : undefined;
}

interface EdgeStyle {
  source: string;
  target: string;
  label?: string;
  style: "solid" | "dashed" | "dotted";
}

function parseEdge(line: string): EdgeStyle | null {
  const trimmed = line.trim();

  const dotted = trimmed.match(/^([a-zA-Z0-9_-]+)\s+-\.\.->(?:\|([^|]*)\|)?\s*([a-zA-Z0-9_-]+)$/);
  if (dotted) {
    return {
      source: dotted[1],
      target: dotted[3],
      label: dotted[2] || undefined,
      style: "dotted",
    };
  }

  const dashed = trimmed.match(/^([a-zA-Z0-9_-]+)\s+-\.->(?:\|([^|]*)\|)?\s*([a-zA-Z0-9_-]+)$/);
  if (dashed) {
    return {
      source: dashed[1],
      target: dashed[3],
      label: dashed[2] || undefined,
      style: "dashed",
    };
  }

  const solid = trimmed.match(/^([a-zA-Z0-9_-]+)\s+-->(?:\|([^|]*)\|)?\s*([a-zA-Z0-9_-]+)$/);
  if (solid) {
    return {
      source: solid[1],
      target: solid[3],
      label: solid[2] || undefined,
      style: "solid",
    };
  }

  return null;
}

function parseNodeDeclaration(line: string): { id: string; label: string } | null {
  const trimmed = line.trim();
  const match = trimmed.match(/^([a-zA-Z0-9_-]+)\["([^"]*)"\]\s*$/);
  if (match) {
    return { id: match[1], label: match[2] };
  }
  return null;
}

interface SubgraphFrame {
  id: string;
  label: string;
  children: string[];
}

/** Mermaid flowchartコードをパースしてCanvasDataに変換する */
export function parseMermaid(code: string): CanvasData {
  if (!code?.trim()) {
    return { nodes: [], edges: [], groups: [] };
  }

  const lines = code.split("\n");

  const nodeMap = new Map<string, { label: string; group?: string }>();
  const nodeSpecs = new Map<string, Record<string, string>>();
  const edges: CanvasEdge[] = [];
  const groups: CanvasGroup[] = [];
  const subgraphStack: SubgraphFrame[] = [];
  let lastNodeId: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("flowchart")) {
      lastNodeId = null;
      continue;
    }

    const specs = parseSpecs(trimmed);
    if (specs) {
      if (lastNodeId) {
        nodeSpecs.set(lastNodeId, specs);
      }
      continue;
    }

    if (trimmed === "end") {
      const frame = subgraphStack.pop();
      if (frame) {
        const groupType = detectGroupType(frame.id, frame.label);
        groups.push({
          id: frame.id,
          type: groupType,
          label: frame.label,
          children: frame.children,
        });
        if (subgraphStack.length > 0) {
          subgraphStack[subgraphStack.length - 1].children.push(frame.id);
        }
      }
      lastNodeId = null;
      continue;
    }

    const subgraphMatch = trimmed.match(/^subgraph\s+([a-zA-Z0-9_-]+)\["([^"]*)"\]\s*$/);
    if (subgraphMatch) {
      subgraphStack.push({
        id: subgraphMatch[1],
        label: subgraphMatch[2],
        children: [],
      });
      lastNodeId = null;
      continue;
    }

    const subgraphPlain = trimmed.match(/^subgraph\s+([a-zA-Z0-9_-]+)\s*$/);
    if (subgraphPlain) {
      subgraphStack.push({
        id: subgraphPlain[1],
        label: subgraphPlain[1],
        children: [],
      });
      lastNodeId = null;
      continue;
    }

    const edgeParsed = parseEdge(trimmed);
    if (edgeParsed) {
      const edge: CanvasEdge = {
        id: nanoid(8),
        source: edgeParsed.source,
        target: edgeParsed.target,
        style: edgeParsed.style === "solid" ? undefined : edgeParsed.style,
      };
      if (edgeParsed.label) {
        edge.label = edgeParsed.label;
      }
      edges.push(edge);

      for (const nid of [edgeParsed.source, edgeParsed.target]) {
        if (!nodeMap.has(nid)) {
          nodeMap.set(nid, { label: nid });
        }
      }

      lastNodeId = null;
      continue;
    }

    const nodeParsed = parseNodeDeclaration(trimmed);
    if (nodeParsed) {
      const currentGroup =
        subgraphStack.length > 0 ? subgraphStack[subgraphStack.length - 1] : null;
      nodeMap.set(nodeParsed.id, {
        label: nodeParsed.label,
        group: currentGroup?.id,
      });
      if (currentGroup) {
        currentGroup.children.push(nodeParsed.id);
      }
      lastNodeId = nodeParsed.id;
      continue;
    }

    lastNodeId = null;
  }

  const groupIds = new Set(groups.map((g) => g.id));

  const nodeIds = Array.from(nodeMap.keys());
  const nodesPerRow = 4;
  const startX = 100;
  const startY = 100;
  const spacingX = 180;
  const spacingY = 150;
  const nodeWidth = 80;
  const nodeHeight = 80;

  const groupNodeOffsets = new Map<string, { index: number }>();
  for (const g of groups) {
    groupNodeOffsets.set(g.id, { index: 0 });
  }

  const nodes: CanvasNode[] = [];
  let ungroupedIndex = 0;

  for (const id of nodeIds) {
    const info = nodeMap.get(id);
    if (!info) continue;

    if (groupIds.has(id)) continue;

    let x: number;
    let y: number;

    if (info.group) {
      const offset = groupNodeOffsets.get(info.group);
      const idx = offset ? offset.index : 0;
      const col = idx % nodesPerRow;
      const row = Math.floor(idx / nodesPerRow);
      x = startX + 40 + col * spacingX;
      y = startY + 40 + row * spacingY;
      if (offset) {
        offset.index = idx + 1;
      }
    } else {
      const col = ungroupedIndex % nodesPerRow;
      const row = Math.floor(ungroupedIndex / nodesPerRow);
      x = startX + col * spacingX;
      y = startY + row * spacingY;
      ungroupedIndex++;
    }

    const node: CanvasNode = {
      id,
      type: detectServiceType(id),
      label: info.label,
      x,
      y,
      width: nodeWidth,
      height: nodeHeight,
    };

    if (info.group) {
      node.group = info.group;
    }

    const specs = nodeSpecs.get(id);
    if (specs) {
      node.specs = specs;
    }

    nodes.push(node);
  }

  return { nodes, edges, groups };
}
