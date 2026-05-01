import { Hono } from "hono";
import type { AppEnv } from "../types";

const ai = new Hono<AppEnv>();

const VALID_SERVICE_IDS = [
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
] as const;

const SYSTEM_PROMPT = `あなたはAWSアーキテクチャ図を生成するアシスタントです。
ユーザーの説明に基づいて、generate_diagram ツールを使ってCanvasDataを生成してください。

## 利用可能なサービスID
${VALID_SERVICE_IDS.join(", ")}

## グループタイプ
vpc, subnet, az, region, generic

## レイアウトルール
- ノードのサイズは常に width: 80, height: 80
- ノード間の水平間隔は180px、垂直間隔は150px
- 開始位置は x: 100, y: 100
- グループ内のノードはグループの領域内に配置すること

## エッジスタイル
- solid: デフォルトの実線
- dashed: 破線
- dotted: 点線

## 注意事項
- クライアント/ユーザーを表すノードには type: "user" を使用
- エッジには意味のあるラベルを付けること（例: "HTTPS", "TCP:3306", "gRPC"）
- 現実的なAWSアーキテクチャパターンに従うこと`;

const GENERATE_DIAGRAM_TOOL = {
  name: "generate_diagram",
  description: "AWSアーキテクチャ図のCanvasDataを生成する",
  input_schema: {
    type: "object" as const,
    properties: {
      nodes: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            id: {
              type: "string" as const,
              description: "Unique ID (e.g., 'node1', 'ec2-1')",
            },
            type: {
              type: "string" as const,
              description: "AWS service ID from the allowed list",
            },
            label: { type: "string" as const, description: "Display label" },
            x: { type: "number" as const },
            y: { type: "number" as const },
            width: { type: "number" as const, description: "Always 80" },
            height: { type: "number" as const, description: "Always 80" },
            group: {
              type: "string" as const,
              description: "Parent group ID if inside a group",
            },
          },
          required: ["id", "type", "label", "x", "y", "width", "height"],
        },
      },
      edges: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            id: { type: "string" as const },
            source: {
              type: "string" as const,
              description: "Source node ID",
            },
            target: {
              type: "string" as const,
              description: "Target node ID",
            },
            label: {
              type: "string" as const,
              description: "Edge label (e.g., 'HTTPS', 'TCP:3306')",
            },
            style: {
              type: "string" as const,
              enum: ["solid", "dashed", "dotted"],
            },
          },
          required: ["id", "source", "target"],
        },
      },
      groups: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            id: { type: "string" as const },
            type: {
              type: "string" as const,
              enum: ["vpc", "subnet", "az", "region", "generic"],
            },
            label: { type: "string" as const },
            children: {
              type: "array" as const,
              items: { type: "string" as const },
              description: "Node/group IDs",
            },
          },
          required: ["id", "type", "label", "children"],
        },
      },
    },
    required: ["nodes", "edges", "groups"],
  },
};

ai.post("/ai/generate", async (c) => {
  const { prompt } = await c.req.json<{ prompt: string }>();

  if (!prompt?.trim()) {
    return c.json({ error: "プロンプトを入力してください" }, 400);
  }

  if (prompt.length > 2000) {
    return c.json({ error: "プロンプトは2000文字以内で入力してください" }, 400);
  }

  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ error: "AI生成機能は現在利用できません" }, 503);
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": c.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      tools: [GENERATE_DIAGRAM_TOOL],
      tool_choice: { type: "tool", name: "generate_diagram" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    return c.json({ error: `AI生成に失敗しました (${response.status})` }, 502);
  }

  const result = (await response.json()) as {
    content: Array<{
      type: string;
      name?: string;
      input?: Record<string, unknown>;
    }>;
  };

  const toolUse = result.content.find(
    (block) => block.type === "tool_use" && block.name === "generate_diagram",
  );

  if (!toolUse?.input) {
    return c.json({ error: "図の生成に失敗しました" }, 500);
  }

  return c.json({ data: toolUse.input });
});

export default ai;
