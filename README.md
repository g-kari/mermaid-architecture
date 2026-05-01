# mermaid-architecture

AWS構成図をGUIで作成し、Mermaid / SVG / PNG / draw.io / Markdown としてエクスポートできるWebアプリ。
ドラッグ&ドロップでAWSサービスを配置・接続し、リアルタイム共同編集にも対応。

## 主な機能

- **ビジュアルエディタ**: SVGベースのキャンバスにAWSサービスをドラッグ&ドロップで配置
- **76種のAWSサービス + 汎用ノード**: Compute, Containers, Storage, Database, Networking, Security, Analytics など11カテゴリ
- **接続線の描画**: ノード間をクリックで接続（実線/破線/点線）
- **グルーピング**: VPC/サブネット等のゾーンでノードをグループ化
- **スペック設定**: サービスごとの固有パラメータ（インスタンスタイプ、ストレージ容量等）を入力
- **5種のエクスポート**: Mermaid (.mmd) / SVG / PNG (2x) / draw.io (.drawio) / Markdown
- **リアルタイム共同編集**: Yjs CRDT + WebSocket でライブ同期、リモートカーソル表示
- **バージョン履歴**: スナップショットの保存・復元
- **テンプレート**: Web App / Static Site / Microservices / Serverless API の4種 + カスタムテンプレート
- **ダーク/ライトモード**: テーマ切り替え対応
- **キーボードショートカット**: Undo/Redo, 複製, エクスポート, ズーム操作 等

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS 4 + Zustand |
| バックエンド | Cloudflare Workers + Hono |
| データベース | Cloudflare D1 (SQLite) |
| リアルタイム同期 | Yjs + WebSocket (Durable Objects hibernation API) |
| 認証 | Cloudflare Access JWT |
| アイコン | Iconify (@iconify/react) |
| 品質管理 | Biome (lint + format) + Vitest + pre-commit |
| パッケージ管理 | pnpm |
| コマンドランナー | just |

## アーキテクチャ

```
ブラウザ (React SPA)
  ├─ REST API (/api/*) ──→ Cloudflare Workers (Hono)
  │                              ├─ /projects, /diagrams, /templates, /snapshots, /users
  │                              ├─ Auth middleware (CF Access JWT)
  │                              └─ D1 (SQLite)
  │
  └─ WebSocket ──→ Durable Objects (DiagramRoom)
                        ├─ Yjs CRDT + Awareness protocol
                        └─ 30秒間隔で D1 にフラッシュ (alarm API)
```

## セットアップ

### 必要なもの

- Node.js
- pnpm
- [just](https://github.com/casey/just) (コマンドランナー)
- [devbox](https://www.jetpack.io/devbox/) (任意)

### 初回セットアップ

```bash
# devbox利用の場合
devbox shell

# 依存関係のインストール
pnpm install

# pre-commitフックのインストール
just setup

# ローカルDBのマイグレーション
just db-migrate-local
```

### 開発

```bash
just dev              # フロント(5173) + Worker(8787) 並列起動
just dev-front        # Vite のみ
just dev-worker       # Wrangler のみ
```

開発時は `wrangler.toml` の `DEV_MODE=true` で認証バイパスが有効になる。
Vite は `/api/*` を `localhost:8787` にプロキシする。

### 品質チェック

```bash
just check            # typecheck + biome check (全チェック)
just lint             # Biome lint
just lint-fix         # lint 自動修正
just fmt              # Biome format
just fmt-check        # format チェック（修正なし）
just test             # Vitest
just test-watch       # テスト ウォッチモード
```

### デプロイ

```bash
just build            # Vite フロントエンドビルド
just deploy           # build + wrangler deploy
just db-migrate       # D1マイグレーション（リモート）
```

## プロジェクト構造

```
src/
├── worker/                  # Cloudflare Workers バックエンド
│   ├── routes/              # REST API (projects, diagrams, templates, snapshots, users)
│   ├── durable-objects/     # DiagramRoom (WebSocket + Yjs同期)
│   ├── middleware/          # CF Access JWT認証
│   └── index.ts             # Hono アプリ
│
├── client/                  # React SPA
│   ├── pages/               # Dashboard, ProjectDetail, Editor
│   ├── components/          # Canvas, Palette, Properties, Toolbar 等
│   ├── stores/              # Zustand (canvas, auth, collaboration, theme)
│   ├── lib/                 # API, エクスポーター, AWSサービス定義
│   └── types/               # TypeScript 型定義
│
migrations/                  # D1 SQLマイグレーション
```

## キーボードショートカット

| ショートカット | 動作 |
|---|---|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` / `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + D` | ノード複製 |
| `Ctrl/Cmd + E` | エクスポート |
| `Ctrl/Cmd + =` / `Ctrl/Cmd + -` | ズームイン/アウト |
| `Ctrl/Cmd + 0` | ズームリセット |
| `Delete` / `Backspace` | 選択削除 |
| `矢印キー` | ノード移動 (10px / Shift: 50px) |
| `Escape` | 選択解除 |
| `?` | ショートカット一覧 |

## 対応AWSサービス (76種 + 汎用ノード)

**Compute**: EC2, Lambda, Lightsail, Batch, Elastic Beanstalk, App Runner
**Containers**: ECS, Fargate, EKS, ECR
**Storage**: S3, EFS, EBS, S3 Glacier, Backup, Storage Gateway
**Database**: RDS, Aurora, DynamoDB, ElastiCache, Redshift, Neptune, DocumentDB, Keyspaces, Timestream
**Networking**: VPC, ALB, NLB, CloudFront, Route 53, API Gateway, NAT Gateway, Direct Connect, Global Accelerator, Transit Gateway
**Application**: SQS, SNS, EventBridge, SES, Step Functions, AppSync, MQ, App Mesh
**Security**: IAM, WAF, ACM, Cognito, KMS, Secrets Manager, Shield, GuardDuty, Security Hub
**Management**: CloudWatch, CloudFormation, Systems Manager, CloudTrail, Config, Trusted Advisor, Organizations
**Analytics**: Kinesis, Athena, Glue, QuickSight, MSK, OpenSearch, Lake Formation, EMR
**Developer Tools**: CodePipeline, CodeCommit, CodeBuild, CodeDeploy, CodeStar, X-Ray, Amplify
**AI/ML**: SageMaker, Bedrock
