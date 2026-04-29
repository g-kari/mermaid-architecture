-- Users (auto-created from Cloudflare Access)
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Projects (diagram groups)
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  owner_id    TEXT NOT NULL REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);

-- Project members
CREATE TABLE IF NOT EXISTS project_members (
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- Diagrams
CREATE TABLE IF NOT EXISTS diagrams (
  id           TEXT PRIMARY KEY,
  project_id   TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  mermaid_code TEXT,
  canvas_data  TEXT,
  yjs_state    BLOB,
  created_by   TEXT NOT NULL REFERENCES users(id),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_diagrams_project ON diagrams(project_id);

-- Snapshots (version history)
CREATE TABLE IF NOT EXISTS snapshots (
  id           TEXT PRIMARY KEY,
  diagram_id   TEXT NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
  mermaid_code TEXT NOT NULL,
  canvas_data  TEXT,
  created_by   TEXT NOT NULL REFERENCES users(id),
  label        TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_snapshots_diagram ON snapshots(diagram_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_created ON snapshots(diagram_id, created_at);

-- Templates
CREATE TABLE IF NOT EXISTS templates (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT,
  category     TEXT NOT NULL,
  mermaid_code TEXT NOT NULL,
  canvas_data  TEXT,
  is_builtin   INTEGER NOT NULL DEFAULT 1,
  created_by   TEXT REFERENCES users(id),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);

-- Seed: Built-in templates
INSERT INTO templates (id, name, description, category, mermaid_code, canvas_data) VALUES
(
  'tmpl-web-app',
  'Webアプリケーション',
  'CloudFront + ALB + ECS + RDS の標準的なWebアプリ構成',
  'web-app',
  'flowchart TD
  subgraph VPC["VPC"]
    subgraph PublicSubnet["Public Subnet"]
      ALB["Application Load Balancer"]
    end
    subgraph PrivateSubnet["Private Subnet"]
      ECS["ECS Service"]
      RDS["RDS Aurora"]
    end
  end
  CF["CloudFront"] --> ALB
  ALB --> ECS
  ECS --> RDS',
  '{"nodes":[{"id":"cf","type":"cloudfront","label":"CloudFront","x":300,"y":50,"width":80,"height":80},{"id":"alb","type":"alb","label":"Application Load Balancer","x":300,"y":200,"width":80,"height":80,"group":"public-subnet"},{"id":"ecs","type":"ecs","label":"ECS Service","x":200,"y":350,"width":80,"height":80,"group":"private-subnet"},{"id":"rds","type":"rds","label":"RDS Aurora","x":400,"y":350,"width":80,"height":80,"group":"private-subnet"}],"edges":[{"id":"e1","source":"cf","target":"alb","style":"solid"},{"id":"e2","source":"alb","target":"ecs","style":"solid"},{"id":"e3","source":"ecs","target":"rds","style":"solid"}],"groups":[{"id":"vpc","type":"vpc","label":"VPC","children":["public-subnet","private-subnet"]},{"id":"public-subnet","type":"subnet","label":"Public Subnet","children":["alb"]},{"id":"private-subnet","type":"subnet","label":"Private Subnet","children":["ecs","rds"]}]}'
),
(
  'tmpl-static-site',
  '静的サイト',
  'CloudFront + S3 のシンプルな静的サイトホスティング構成',
  'static-site',
  'flowchart TD
  User["User"] --> CF["CloudFront"]
  CF --> S3["S3 Bucket"]
  CF --> ACM["ACM Certificate"]',
  '{"nodes":[{"id":"user","type":"user","label":"User","x":300,"y":50,"width":80,"height":80},{"id":"cf","type":"cloudfront","label":"CloudFront","x":300,"y":200,"width":80,"height":80},{"id":"s3","type":"s3","label":"S3 Bucket","x":200,"y":350,"width":80,"height":80},{"id":"acm","type":"acm","label":"ACM Certificate","x":400,"y":350,"width":80,"height":80}],"edges":[{"id":"e1","source":"user","target":"cf","style":"solid"},{"id":"e2","source":"cf","target":"s3","style":"solid"},{"id":"e3","source":"cf","target":"acm","style":"dashed"}],"groups":[]}'
),
(
  'tmpl-microservice',
  'マイクロサービス',
  'ALB + ECS × N + SQS + RDS のマイクロサービス構成',
  'microservice',
  'flowchart TD
  subgraph VPC["VPC"]
    ALB["ALB"] --> SvcA["ECS: Service A"]
    ALB --> SvcB["ECS: Service B"]
    SvcA --> SQS["SQS Queue"]
    SQS --> SvcB
    SvcA --> RDS_A["RDS: DB A"]
    SvcB --> RDS_B["RDS: DB B"]
  end',
  '{"nodes":[{"id":"alb","type":"alb","label":"ALB","x":300,"y":50,"width":80,"height":80,"group":"vpc"},{"id":"svc-a","type":"ecs","label":"ECS: Service A","x":150,"y":200,"width":80,"height":80,"group":"vpc"},{"id":"svc-b","type":"ecs","label":"ECS: Service B","x":450,"y":200,"width":80,"height":80,"group":"vpc"},{"id":"sqs","type":"sqs","label":"SQS Queue","x":300,"y":200,"width":80,"height":80,"group":"vpc"},{"id":"rds-a","type":"rds","label":"RDS: DB A","x":150,"y":350,"width":80,"height":80,"group":"vpc"},{"id":"rds-b","type":"rds","label":"RDS: DB B","x":450,"y":350,"width":80,"height":80,"group":"vpc"}],"edges":[{"id":"e1","source":"alb","target":"svc-a","style":"solid"},{"id":"e2","source":"alb","target":"svc-b","style":"solid"},{"id":"e3","source":"svc-a","target":"sqs","style":"solid"},{"id":"e4","source":"sqs","target":"svc-b","style":"solid"},{"id":"e5","source":"svc-a","target":"rds-a","style":"solid"},{"id":"e6","source":"svc-b","target":"rds-b","style":"solid"}],"groups":[{"id":"vpc","type":"vpc","label":"VPC","children":["alb","svc-a","svc-b","sqs","rds-a","rds-b"]}]}'
),
(
  'tmpl-serverless',
  'サーバーレスAPI',
  'API Gateway + Lambda + DynamoDB のサーバーレス構成',
  'serverless',
  'flowchart TD
  Client["Client"] --> APIGW["API Gateway"]
  APIGW --> Lambda["Lambda Function"]
  Lambda --> DDB["DynamoDB"]
  Lambda --> S3["S3 Bucket"]',
  '{"nodes":[{"id":"client","type":"user","label":"Client","x":300,"y":50,"width":80,"height":80},{"id":"apigw","type":"api-gateway","label":"API Gateway","x":300,"y":200,"width":80,"height":80},{"id":"lambda","type":"lambda","label":"Lambda Function","x":300,"y":350,"width":80,"height":80},{"id":"ddb","type":"dynamodb","label":"DynamoDB","x":150,"y":500,"width":80,"height":80},{"id":"s3","type":"s3","label":"S3 Bucket","x":450,"y":500,"width":80,"height":80}],"edges":[{"id":"e1","source":"client","target":"apigw","style":"solid"},{"id":"e2","source":"apigw","target":"lambda","style":"solid"},{"id":"e3","source":"lambda","target":"ddb","style":"solid"},{"id":"e4","source":"lambda","target":"s3","style":"solid"}],"groups":[]}'
);
