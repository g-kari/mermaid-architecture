export interface AwsServiceDef {
  id: string;
  name: string;
  category: AwsCategory;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
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
  },
  {
    id: "lambda",
    name: "Lambda",
    category: "compute",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "lightsail",
    name: "Lightsail",
    category: "compute",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "batch",
    name: "Batch",
    category: "compute",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "elastic-beanstalk",
    name: "Elastic Beanstalk",
    category: "compute",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "app-runner",
    name: "App Runner",
    category: "compute",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
  },

  // Containers
  {
    id: "ecs",
    name: "ECS",
    category: "container",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "ecs-fargate",
    name: "Fargate",
    category: "container",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "eks",
    name: "EKS",
    category: "container",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "ecr",
    name: "ECR",
    category: "container",
    color: "#ED7100",
    defaultWidth: 80,
    defaultHeight: 80,
  },

  // Storage
  {
    id: "s3",
    name: "S3",
    category: "storage",
    color: "#3F8624",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "efs",
    name: "EFS",
    category: "storage",
    color: "#3F8624",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "ebs",
    name: "EBS",
    category: "storage",
    color: "#3F8624",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "glacier",
    name: "S3 Glacier",
    category: "storage",
    color: "#3F8624",
    defaultWidth: 80,
    defaultHeight: 80,
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
  },
  {
    id: "aurora",
    name: "Aurora",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "dynamodb",
    name: "DynamoDB",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "elasticache",
    name: "ElastiCache",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "redshift",
    name: "Redshift",
    category: "database",
    color: "#2E27AD",
    defaultWidth: 80,
    defaultHeight: 80,
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
  },
  {
    id: "nlb",
    name: "NLB",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "cloudfront",
    name: "CloudFront",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "route53",
    name: "Route 53",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "api-gateway",
    name: "API Gateway",
    category: "network",
    color: "#8C4FFF",
    defaultWidth: 80,
    defaultHeight: 80,
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
  },
  {
    id: "sns",
    name: "SNS",
    category: "application",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: "eventbridge",
    name: "EventBridge",
    category: "application",
    color: "#E7157B",
    defaultWidth: 80,
    defaultHeight: 80,
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
  },
  {
    id: "bedrock",
    name: "Bedrock",
    category: "ai-ml",
    color: "#01A88D",
    defaultWidth: 80,
    defaultHeight: 80,
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
