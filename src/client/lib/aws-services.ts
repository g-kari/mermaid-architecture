export interface SpecFieldDef {
  key: string;
  label: string;
  placeholder?: string;
}

export interface AwsServiceDef {
  id: string;
  name: string;
  category: AwsCategory;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
  specFields?: SpecFieldDef[];
}

export type AwsCategory =
  | "compute"
  | "container"
  | "storage"
  | "database"
  | "network"
  | "application"
  | "security"
  | "management"
  | "analytics"
  | "devtools"
  | "ai-ml";

export const AWS_CATEGORIES: Record<AwsCategory, { label: string; color: string }> = {
  compute: { label: "Compute", color: "#ED7100" },
  container: { label: "Containers", color: "#ED7100" },
  storage: { label: "Storage", color: "#3F8624" },
  database: { label: "Database", color: "#2E27AD" },
  network: { label: "Networking", color: "#8C4FFF" },
  application: { label: "Application", color: "#E7157B" },
  security: { label: "Security", color: "#DD344C" },
  management: { label: "Management", color: "#E7157B" },
  analytics: { label: "Analytics", color: "#8C4FFF" },
  devtools: { label: "Developer Tools", color: "#437DAC" },
  "ai-ml": { label: "AI / ML", color: "#01A88D" },
};

export const AWS_SERVICES: AwsServiceDef[] = [
  // Compute
  {
    id: "ec2",
    name: "EC2",
    category: "compute",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "instanceType", label: "インスタンスタイプ", placeholder: "t3.micro" },
      { key: "ami", label: "AMI", placeholder: "Amazon Linux 2023" },
      { key: "storage", label: "ストレージ", placeholder: "20 GiB gp3" },
      { key: "os", label: "OS", placeholder: "Amazon Linux 2023" },
    ],
  },
  {
    id: "lambda",
    name: "Lambda",
    category: "compute",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "runtime", label: "ランタイム", placeholder: "Node.js 20.x" },
      { key: "memory", label: "メモリ", placeholder: "128 MB" },
      { key: "timeout", label: "タイムアウト", placeholder: "30秒" },
      { key: "architecture", label: "アーキテクチャ", placeholder: "arm64" },
    ],
  },
  {
    id: "lightsail",
    name: "Lightsail",
    category: "compute",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "plan", label: "プラン", placeholder: "$3.50/月" },
      { key: "os", label: "OS", placeholder: "Amazon Linux 2" },
    ],
  },
  {
    id: "batch",
    name: "Batch",
    category: "compute",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "computeEnv", label: "コンピューティング環境", placeholder: "Fargate" },
      { key: "vcpus", label: "vCPU", placeholder: "1" },
      { key: "memory", label: "メモリ", placeholder: "2048 MiB" },
    ],
  },
  {
    id: "elastic-beanstalk",
    name: "Elastic Beanstalk",
    category: "compute",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "platform", label: "プラットフォーム", placeholder: "Node.js 20" },
      { key: "instanceType", label: "インスタンスタイプ", placeholder: "t3.small" },
    ],
  },
  {
    id: "app-runner",
    name: "App Runner",
    category: "compute",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "cpu", label: "CPU", placeholder: "1 vCPU" },
      { key: "memory", label: "メモリ", placeholder: "2 GB" },
      { key: "source", label: "ソース", placeholder: "ECR / GitHub" },
    ],
  },

  // Containers
  {
    id: "ecs",
    name: "ECS",
    category: "container",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "launchType", label: "起動タイプ", placeholder: "Fargate / EC2" },
      { key: "cpu", label: "CPU", placeholder: "256" },
      { key: "memory", label: "メモリ", placeholder: "512 MiB" },
      { key: "desiredCount", label: "タスク数", placeholder: "2" },
    ],
  },
  {
    id: "ecs-fargate",
    name: "Fargate",
    category: "container",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "cpu", label: "CPU", placeholder: "256" },
      { key: "memory", label: "メモリ", placeholder: "512 MiB" },
      { key: "desiredCount", label: "タスク数", placeholder: "2" },
    ],
  },
  {
    id: "eks",
    name: "EKS",
    category: "container",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "version", label: "バージョン", placeholder: "1.29" },
      { key: "nodeType", label: "ノードタイプ", placeholder: "t3.medium" },
      { key: "nodeCount", label: "ノード数", placeholder: "3" },
    ],
  },
  {
    id: "ecr",
    name: "ECR",
    category: "container",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "scanOnPush", label: "プッシュ時スキャン", placeholder: "有効" },
      { key: "encryption", label: "暗号化", placeholder: "AES-256" },
    ],
  },

  // Storage
  {
    id: "s3",
    name: "S3",
    category: "storage",
    color: "#3F8624",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "storageClass", label: "ストレージクラス", placeholder: "Standard" },
      { key: "versioning", label: "バージョニング", placeholder: "有効" },
      { key: "encryption", label: "暗号化", placeholder: "SSE-S3" },
    ],
  },
  {
    id: "efs",
    name: "EFS",
    category: "storage",
    color: "#3F8624",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "performanceMode", label: "パフォーマンスモード", placeholder: "汎用" },
      { key: "throughputMode", label: "スループットモード", placeholder: "バースト" },
    ],
  },
  {
    id: "ebs",
    name: "EBS",
    category: "storage",
    color: "#3F8624",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "volumeType", label: "ボリュームタイプ", placeholder: "gp3" },
      { key: "size", label: "サイズ", placeholder: "100 GiB" },
      { key: "iops", label: "IOPS", placeholder: "3000" },
    ],
  },
  {
    id: "glacier",
    name: "S3 Glacier",
    category: "storage",
    color: "#3F8624",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [{ key: "retrievalTier", label: "取得階層", placeholder: "Standard" }],
  },
  {
    id: "backup",
    name: "Backup",
    category: "storage",
    color: "#3F8624",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "storage-gateway",
    name: "Storage Gateway",
    category: "storage",
    color: "#3F8624",
    defaultWidth: 80,
    defaultHeight: 80,
  },

  // Database
  {
    id: "rds",
    name: "RDS",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "engine", label: "エンジン", placeholder: "MySQL 8.0" },
      { key: "instanceClass", label: "インスタンスクラス", placeholder: "db.t3.micro" },
      { key: "storage", label: "ストレージ", placeholder: "20 GiB gp3" },
      { key: "multiAz", label: "Multi-AZ", placeholder: "有効" },
    ],
  },
  {
    id: "aurora",
    name: "Aurora",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "engine", label: "エンジン", placeholder: "Aurora MySQL 3" },
      { key: "instanceClass", label: "インスタンスクラス", placeholder: "db.r6g.large" },
      { key: "replicas", label: "レプリカ数", placeholder: "2" },
      { key: "serverless", label: "Serverless v2", placeholder: "無効" },
    ],
  },
  {
    id: "dynamodb",
    name: "DynamoDB",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "capacityMode", label: "キャパシティモード", placeholder: "オンデマンド" },
      { key: "rcu", label: "RCU", placeholder: "5" },
      { key: "wcu", label: "WCU", placeholder: "5" },
    ],
  },
  {
    id: "elasticache",
    name: "ElastiCache",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "engine", label: "エンジン", placeholder: "Valkey 8" },
      { key: "nodeType", label: "ノードタイプ", placeholder: "cache.t3.micro" },
      { key: "nodes", label: "ノード数", placeholder: "2" },
    ],
  },
  {
    id: "redshift",
    name: "Redshift",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "nodeType", label: "ノードタイプ", placeholder: "dc2.large" },
      { key: "nodes", label: "ノード数", placeholder: "2" },
      { key: "serverless", label: "Serverless", placeholder: "無効" },
    ],
  },
  {
    id: "neptune",
    name: "Neptune",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "documentdb",
    name: "DocumentDB",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "keyspaces",
    name: "Keyspaces",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "timestream",
    name: "Timestream",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
  },

  // Networking
  {
    id: "vpc",
    name: "VPC",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "alb",
    name: "ALB",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "scheme", label: "スキーム", placeholder: "internet-facing" },
      { key: "listeners", label: "リスナー", placeholder: "HTTPS:443" },
    ],
  },
  {
    id: "nlb",
    name: "NLB",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "scheme", label: "スキーム", placeholder: "internal" },
      { key: "listeners", label: "リスナー", placeholder: "TCP:80" },
    ],
  },
  {
    id: "cloudfront",
    name: "CloudFront",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "priceClass", label: "料金クラス", placeholder: "PriceClass_200" },
      { key: "origins", label: "オリジン", placeholder: "S3 / ALB" },
      { key: "waf", label: "WAF", placeholder: "有効" },
    ],
  },
  {
    id: "route53",
    name: "Route 53",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "domain", label: "ドメイン", placeholder: "example.com" },
      { key: "recordType", label: "レコードタイプ", placeholder: "A / CNAME" },
    ],
  },
  {
    id: "api-gateway",
    name: "API Gateway",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "type", label: "タイプ", placeholder: "REST / HTTP" },
      { key: "auth", label: "認証", placeholder: "Cognito / IAM" },
      { key: "stage", label: "ステージ", placeholder: "prod" },
    ],
  },
  {
    id: "nat-gateway",
    name: "NAT Gateway",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "direct-connect",
    name: "Direct Connect",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "global-accelerator",
    name: "Global Accelerator",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "transit-gateway",
    name: "Transit Gateway",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },

  // Application Integration
  {
    id: "sqs",
    name: "SQS",
    category: "application",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "type", label: "タイプ", placeholder: "Standard / FIFO" },
      { key: "visibilityTimeout", label: "可視性タイムアウト", placeholder: "30秒" },
      { key: "retentionPeriod", label: "保持期間", placeholder: "4日" },
    ],
  },
  {
    id: "sns",
    name: "SNS",
    category: "application",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "type", label: "タイプ", placeholder: "Standard / FIFO" },
      { key: "protocol", label: "プロトコル", placeholder: "HTTPS / SQS / Lambda" },
    ],
  },
  {
    id: "eventbridge",
    name: "EventBridge",
    category: "application",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "bus", label: "イベントバス", placeholder: "default" },
      { key: "rules", label: "ルール数", placeholder: "5" },
    ],
  },
  {
    id: "ses",
    name: "SES",
    category: "application",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "step-functions",
    name: "Step Functions",
    category: "application",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "appsync",
    name: "AppSync",
    category: "application",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "mq",
    name: "MQ",
    category: "application",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "app-mesh",
    name: "App Mesh",
    category: "application",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
  },

  // Security
  {
    id: "iam",
    name: "IAM",
    category: "security",
    color: "#DD344C",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "waf",
    name: "WAF",
    category: "security",
    color: "#DD344C",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "scope", label: "スコープ", placeholder: "Regional / CloudFront" },
      { key: "rules", label: "ルール数", placeholder: "10" },
    ],
  },
  {
    id: "acm",
    name: "ACM",
    category: "security",
    color: "#DD344C",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "cognito",
    name: "Cognito",
    category: "security",
    color: "#DD344C",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "pool", label: "プールタイプ", placeholder: "User Pool" },
      { key: "mfa", label: "MFA", placeholder: "必須" },
    ],
  },
  {
    id: "kms",
    name: "KMS",
    category: "security",
    color: "#DD344C",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "secrets-manager",
    name: "Secrets Manager",
    category: "security",
    color: "#DD344C",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "shield",
    name: "Shield",
    category: "security",
    color: "#DD344C",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "guardduty",
    name: "GuardDuty",
    category: "security",
    color: "#DD344C",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "security-hub",
    name: "Security Hub",
    category: "security",
    color: "#DD344C",
    defaultWidth: 80,
    defaultHeight: 80,
  },

  // Management
  {
    id: "cloudwatch",
    name: "CloudWatch",
    category: "management",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "alarms", label: "アラーム数", placeholder: "5" },
      { key: "logRetention", label: "ログ保持期間", placeholder: "30日" },
    ],
  },
  {
    id: "cloudformation",
    name: "CloudFormation",
    category: "management",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "ssm",
    name: "Systems Manager",
    category: "management",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "cloudtrail",
    name: "CloudTrail",
    category: "management",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "config",
    name: "Config",
    category: "management",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "trusted-advisor",
    name: "Trusted Advisor",
    category: "management",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "organizations",
    name: "Organizations",
    category: "management",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
  },

  // Analytics
  {
    id: "kinesis",
    name: "Kinesis",
    category: "analytics",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "athena",
    name: "Athena",
    category: "analytics",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "glue",
    name: "Glue",
    category: "analytics",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "quicksight",
    name: "QuickSight",
    category: "analytics",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "msk",
    name: "MSK",
    category: "analytics",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "opensearch",
    name: "OpenSearch",
    category: "analytics",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "lake-formation",
    name: "Lake Formation",
    category: "analytics",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "emr",
    name: "EMR",
    category: "analytics",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },

  // Developer Tools
  {
    id: "codepipeline",
    name: "CodePipeline",
    category: "devtools",
    color: "#437DAC",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "codecommit",
    name: "CodeCommit",
    category: "devtools",
    color: "#437DAC",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "codebuild",
    name: "CodeBuild",
    category: "devtools",
    color: "#437DAC",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "codedeploy",
    name: "CodeDeploy",
    category: "devtools",
    color: "#437DAC",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "codestar",
    name: "CodeStar",
    category: "devtools",
    color: "#437DAC",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "xray",
    name: "X-Ray",
    category: "devtools",
    color: "#437DAC",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "amplify",
    name: "Amplify",
    category: "devtools",
    color: "#437DAC",
    defaultWidth: 80,
    defaultHeight: 80,
  },

  // AI / ML
  {
    id: "sagemaker",
    name: "SageMaker",
    category: "ai-ml",
    color: "#01A88D",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "instanceType", label: "インスタンスタイプ", placeholder: "ml.t3.medium" },
      { key: "framework", label: "フレームワーク", placeholder: "PyTorch 2.0" },
    ],
  },
  {
    id: "bedrock",
    name: "Bedrock",
    category: "ai-ml",
    color: "#01A88D",
    defaultWidth: 80,
    defaultHeight: 80,
    specFields: [
      { key: "model", label: "モデル", placeholder: "Claude Sonnet 4" },
      { key: "throughput", label: "スループット", placeholder: "オンデマンド" },
    ],
  },

  // Generic
  {
    id: "user",
    name: "User/Client",
    category: "network",
    color: "#666666",
    defaultWidth: 80,
    defaultHeight: 80,
  },
];

export interface GroupTypeDef {
  type: string;
  label: string;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
}

export const GROUP_TYPES: GroupTypeDef[] = [
  { type: "vpc", label: "VPC", color: "#8C4FFF", defaultWidth: 400, defaultHeight: 300 },
  { type: "subnet", label: "Subnet", color: "#3F8624", defaultWidth: 300, defaultHeight: 200 },
  {
    type: "az",
    label: "Availability Zone",
    color: "#ED7100",
    defaultWidth: 450,
    defaultHeight: 350,
  },
  { type: "region", label: "Region", color: "#2E27AD", defaultWidth: 500, defaultHeight: 400 },
];

export function getServiceDef(type: string): AwsServiceDef | undefined {
  return AWS_SERVICES.find((s) => s.id === type);
}

export function getServicesByCategory(): Map<AwsCategory, AwsServiceDef[]> {
  const map = new Map<AwsCategory, AwsServiceDef[]>();
  for (const service of AWS_SERVICES) {
    const list = map.get(service.category) || [];
    list.push(service);
    map.set(service.category, list);
  }
  return map;
}
