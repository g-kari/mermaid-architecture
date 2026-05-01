import type { TerraformMapping } from "./types";

export const SERVICE_TO_TERRAFORM: Record<string, TerraformMapping> = {
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
