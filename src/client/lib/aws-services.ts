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
  | "storage"
  | "database"
  | "network"
  | "application"
  | "security"
  | "management"
  | "analytics";

export const AWS_CATEGORIES: Record<AwsCategory, { label: string; color: string }> = {
  compute: { label: "Compute", color: "#ED7100" },
  storage: { label: "Storage", color: "#3F8624" },
  database: { label: "Database", color: "#2E27AD" },
  network: { label: "Networking", color: "#8C4FFF" },
  application: { label: "Application", color: "#E7157B" },
  security: { label: "Security", color: "#DD344C" },
  management: { label: "Management", color: "#E7157B" },
  analytics: { label: "Analytics", color: "#8C4FFF" },
};

export const AWS_SERVICES: AwsServiceDef[] = [
  // Compute
  { id: "ec2", name: "EC2", category: "compute", color: "#ED7100", defaultWidth: 80, defaultHeight: 80 },
  { id: "lambda", name: "Lambda", category: "compute", color: "#ED7100", defaultWidth: 80, defaultHeight: 80 },
  { id: "ecs", name: "ECS", category: "compute", color: "#ED7100", defaultWidth: 80, defaultHeight: 80 },
  { id: "ecs-fargate", name: "Fargate", category: "compute", color: "#ED7100", defaultWidth: 80, defaultHeight: 80 },
  { id: "lightsail", name: "Lightsail", category: "compute", color: "#ED7100", defaultWidth: 80, defaultHeight: 80 },

  // Storage
  { id: "s3", name: "S3", category: "storage", color: "#3F8624", defaultWidth: 80, defaultHeight: 80 },
  { id: "efs", name: "EFS", category: "storage", color: "#3F8624", defaultWidth: 80, defaultHeight: 80 },
  { id: "ebs", name: "EBS", category: "storage", color: "#3F8624", defaultWidth: 80, defaultHeight: 80 },

  // Database
  { id: "rds", name: "RDS", category: "database", color: "#2E27AD", defaultWidth: 80, defaultHeight: 80 },
  { id: "aurora", name: "Aurora", category: "database", color: "#2E27AD", defaultWidth: 80, defaultHeight: 80 },
  { id: "dynamodb", name: "DynamoDB", category: "database", color: "#2E27AD", defaultWidth: 80, defaultHeight: 80 },
  { id: "elasticache", name: "ElastiCache", category: "database", color: "#2E27AD", defaultWidth: 80, defaultHeight: 80 },

  // Networking
  { id: "vpc", name: "VPC", category: "network", color: "#8C4FFF", defaultWidth: 80, defaultHeight: 80 },
  { id: "alb", name: "ALB", category: "network", color: "#8C4FFF", defaultWidth: 80, defaultHeight: 80 },
  { id: "nlb", name: "NLB", category: "network", color: "#8C4FFF", defaultWidth: 80, defaultHeight: 80 },
  { id: "cloudfront", name: "CloudFront", category: "network", color: "#8C4FFF", defaultWidth: 80, defaultHeight: 80 },
  { id: "route53", name: "Route 53", category: "network", color: "#8C4FFF", defaultWidth: 80, defaultHeight: 80 },
  { id: "api-gateway", name: "API Gateway", category: "network", color: "#8C4FFF", defaultWidth: 80, defaultHeight: 80 },
  { id: "nat-gateway", name: "NAT Gateway", category: "network", color: "#8C4FFF", defaultWidth: 80, defaultHeight: 80 },

  // Application Integration
  { id: "sqs", name: "SQS", category: "application", color: "#E7157B", defaultWidth: 80, defaultHeight: 80 },
  { id: "sns", name: "SNS", category: "application", color: "#E7157B", defaultWidth: 80, defaultHeight: 80 },
  { id: "eventbridge", name: "EventBridge", category: "application", color: "#E7157B", defaultWidth: 80, defaultHeight: 80 },
  { id: "ses", name: "SES", category: "application", color: "#E7157B", defaultWidth: 80, defaultHeight: 80 },

  // Security
  { id: "iam", name: "IAM", category: "security", color: "#DD344C", defaultWidth: 80, defaultHeight: 80 },
  { id: "waf", name: "WAF", category: "security", color: "#DD344C", defaultWidth: 80, defaultHeight: 80 },
  { id: "acm", name: "ACM", category: "security", color: "#DD344C", defaultWidth: 80, defaultHeight: 80 },
  { id: "cognito", name: "Cognito", category: "security", color: "#DD344C", defaultWidth: 80, defaultHeight: 80 },

  // Management
  { id: "cloudwatch", name: "CloudWatch", category: "management", color: "#E7157B", defaultWidth: 80, defaultHeight: 80 },
  { id: "cloudformation", name: "CloudFormation", category: "management", color: "#E7157B", defaultWidth: 80, defaultHeight: 80 },
  { id: "ssm", name: "Systems Manager", category: "management", color: "#E7157B", defaultWidth: 80, defaultHeight: 80 },

  // Analytics
  { id: "kinesis", name: "Kinesis", category: "analytics", color: "#8C4FFF", defaultWidth: 80, defaultHeight: 80 },
  { id: "athena", name: "Athena", category: "analytics", color: "#8C4FFF", defaultWidth: 80, defaultHeight: 80 },

  // Generic
  { id: "user", name: "User/Client", category: "network", color: "#666666", defaultWidth: 80, defaultHeight: 80 },
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
