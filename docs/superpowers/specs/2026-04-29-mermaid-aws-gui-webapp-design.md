# Mermaid AWS Architecture GUI WebApp 設計書

## Context

社内エンジニアがAWSアーキテクチャ図をGUIで作成・共有するためのWebアプリケーション。Mermaid.jsのコードを裏で自動生成し、エクスポート可能にする。Cloudflare Workers + D1 + Durable Objectsで完結するフルCloudflareアーキテクチャ。

**解決する課題**: アーキテクチャ図の作成・管理が属人化しており、バージョン管理やリアルタイム共同編集ができない。Mermaidコードを手書きするのは学習コストが高い。

## 要件サマリ

| 項目 | 決定事項 |
|------|----------|
| ターゲット | 社内エンジニア向け社内ツール |
| 認証 | Cloudflare Access（JWT検証のみ） |
| エディタUI | GUIドラッグ&ドロップ（裏でMermaidコード自動生成） |
| 同時編集 | リアルタイム共同編集（Yjs CRDT + Durable Objects WebSocket） |
| テンプレート | ユースケース単位（Webアプリ、マイクロサービス等） |
| バージョン管理 | スナップショット履歴（Figma的） |
| エクスポート | Mermaidコード（.mmd / クリップボード） |
| フロントエンド | React + Vite + TypeScript + Tailwind CSS |
| バックエンド | Cloudflare Workers (Hono) + D1 + Durable Objects |
| DB | D1（SQLite） |

## 全体アーキテクチャ

```
ブラウザ (React SPA)
  ├── REST API ──→ Cloudflare Workers (Hono)
  │                    ├── D1 (SQLite) ... メタデータ、バージョン、テンプレート
  │                    └── (V2以降) R2 ... サムネイル等
  └── WebSocket ──→ Durable Objects (DiagramRoom)
                       └── Yjs CRDT同期
```

### フロントエンド

- React + Vite + TypeScript + Tailwind CSS
- ドラッグ&ドロップ: `@dnd-kit/core`
- キャンバス描画: SVG（Mermaidの出力がSVGなので相性がいい）
- リアルタイム同期: `yjs` + カスタムWebSocket provider
- 状態管理: Zustand

### バックエンド

- Cloudflare Workers + Hono（REST API）
- Durable Objects（WebSocketサーバー + Yjsドキュメントの永続化）
- D1（メタデータ、スナップショット、テンプレート）
- R2はV1では不使用（V2以降でサムネイル保存等に使用する可能性）

### 認証

- Cloudflare Access で認証（Workers側では `CF-Access-JWT-Assertion` ヘッダーを検証）
- ユーザー識別は JWT の email claim から取得

## データモデル（D1）

```sql
-- ユーザー（Cloudflare Accessから自動作成）
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- プロジェクト（図のグループ）
CREATE TABLE projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  owner_id    TEXT NOT NULL REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- プロジェクトメンバー
CREATE TABLE project_members (
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  PRIMARY KEY (project_id, user_id)
);

-- ダイアグラム
CREATE TABLE diagrams (
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

-- スナップショット（バージョン履歴）
CREATE TABLE snapshots (
  id           TEXT PRIMARY KEY,
  diagram_id   TEXT NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
  mermaid_code TEXT NOT NULL,
  canvas_data  TEXT,
  created_by   TEXT NOT NULL REFERENCES users(id),
  label        TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- テンプレート
CREATE TABLE templates (
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
```

**補足**:
- `diagrams.yjs_state`: Yjs doc全体のバイナリ状態（`Y.encodeStateAsUpdate`の結果）。Durable Objectからフラッシュされる
- `diagrams.canvas_data`: ノード位置等のGUI固有メタデータ（JSON）。yjs_stateと同期して保存
- `diagrams.mermaid_code`: canvas_dataから自動生成されるMermaidコード。エクスポート用にも保持

## GUIエディタ

### レイアウト

```
┌──────────────────────────────────────────────────────┐
│ Toolbar: [保存] [元に戻す] [テンプレート] [エクスポート] [共有]  │
├────────┬───────────────────────────────┬──────────────┤
│        │                               │              │
│ AWS    │       Canvas (SVG)            │  Properties  │
│ Service│                               │  Panel       │
│ Palette│   ┌───┐    ┌───┐             │              │
│        │   │EC2│────│RDS│             │  Label: __   │
│ ─ Compute  └───┘    └───┘             │  Style: __   │
│ ─ Storage│                             │              │
│ ─ Database                             │              │
│ ─ Network│                             │              │
│ ...    │                               │              │
├────────┴───────────────────────────────┴──────────────┤
│ Version History Timeline (折りたたみ可)                   │
└──────────────────────────────────────────────────────┘
```

### CanvasData構造

```typescript
interface CanvasData {
  nodes: Array<{
    id: string
    type: string        // 'ec2' | 'rds' | 'alb' | 's3' | ...
    label: string
    x: number
    y: number
    width: number
    height: number
    group?: string      // 所属するグループのID
  }>
  edges: Array<{
    id: string
    source: string      // node id
    target: string      // node id
    label?: string
    style?: 'solid' | 'dashed' | 'dotted'
  }>
  groups: Array<{
    id: string
    type: string        // 'vpc' | 'subnet' | 'az' | 'region' | 'generic'
    label: string
    children: string[]  // node ids
  }>
}
```

### CanvasData → Mermaidコード変換

CanvasDataからMermaid `flowchart TD` 記法を自動生成:
- `nodes` → ノード定義（`id["label"]`）。アイコンはMermaidでは表現不可なのでラベルに含める
- `edges` → 接続定義（`source --> target` / `source -.-> target`）
- `groups` → `subgraph` ブロック

### 操作フロー

1. 左サイドバーのAWSサービスパレットからキャンバスにD&D
2. ノード間をドラッグで接続線作成
3. ノード/エッジクリックでプロパティパネルに詳細表示・編集
4. すべての操作で `CanvasData` を更新 → Mermaidコード再生成
5. Undo/RedoはYjsの `Y.UndoManager` を使用（CRDT操作と自動連動）

## リアルタイム共同編集

### Durable Object: DiagramRoom

各ダイアグラムに1つの `DiagramRoom` Durable Objectが対応。

**責務**:
- WebSocket接続の管理（接続/切断/メッセージ配信）
- Yjs更新メッセージのブロードキャスト
- Awareness情報の配信（カーソル位置、選択状態）
- 定期的にD1へYjsドキュメント状態をフラッシュ（alarmで30秒ごと、env.DB bindingでD1にアクセス）
- 全クライアント退出時にfinal flush → hibernation

### Yjs統合

- `CanvasData`を `Y.Map`（nodes: `Y.Array`, edges: `Y.Array`, groups: `Y.Array`）で管理
- クライアント側で `yjs` + カスタムWebSocket providerを実装
- providerはDurable ObjectのWebSocketエンドポイントに接続

### Awareness

- 他ユーザーのカーソル位置をキャンバス上に表示
- 選択中のノード/エッジに他ユーザーの選択を色付きボーダーで表示
- オンラインユーザー一覧をツールバーにアバター表示

### 永続化

- Durable Object alarm APIで30秒ごとにD1へ保存
- 保存内容: `Y.encodeStateAsUpdate(doc)` → `diagrams.yjs_state`
- 同時に `canvas_data` と `mermaid_code` も更新
- 全員退出時にfinal flush

## バージョン管理

### スナップショット

- **自動**: D1保存時に前回と差分があればスナップショット自動作成
- **手動**: ユーザーが「バージョンを保存」で名前付きスナップショット作成
- **保持**: 自動は直近100件、手動は無制限
- **復元**: 過去バージョンを選択 → 新しいスナップショットとして保存（非破壊）

### 履歴パネル

- 画面下部に折りたたみ可能なタイムラインで表示
- 各スナップショットに日時・作成者・ラベル
- クリックでプレビュー（読み取り専用表示）
- 「このバージョンに戻す」ボタンで復元

## テンプレート

### ビルトイン（初回マイグレーションで投入）

| カテゴリ | テンプレート名 | 構成例 |
|---------|-------------|-------|
| web-app | Webアプリケーション | CloudFront + ALB + ECS + RDS |
| static-site | 静的サイト | CloudFront + S3 |
| microservice | マイクロサービス | ALB + ECS × N + SQS + RDS |
| serverless | サーバーレスAPI | API Gateway + Lambda + DynamoDB |

### カスタムテンプレート

- 既存の図から「テンプレートとして保存」で作成
- プロジェクト/ダイアグラム作成時にテンプレート選択ダイアログ

## エクスポート

- Mermaidコードをクリップボードにコピー
- `.mmd` ファイルとしてダウンロード

## プロジェクト構造

```
mermaid-architecture/
├── package.json
├── tsconfig.json
├── wrangler.toml
├── vite.config.ts
├── tailwind.config.ts
├── .gitignore
├── src/
│   ├── worker/                    # Cloudflare Workers
│   │   ├── index.ts               # エントリポイント (Hono app)
│   │   ├── routes/
│   │   │   ├── diagrams.ts
│   │   │   ├── projects.ts
│   │   │   ├── templates.ts
│   │   │   ├── snapshots.ts
│   │   │   └── users.ts
│   │   ├── durable-objects/
│   │   │   └── diagram-room.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── db/
│   │       ├── schema.sql
│   │       └── seed.sql
│   └── client/                    # React フロントエンド
│       ├── index.html
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── Canvas/
│       │   │   ├── Canvas.tsx
│       │   │   ├── Node.tsx
│       │   │   ├── Edge.tsx
│       │   │   └── Group.tsx
│       │   ├── Palette/
│       │   │   └── Palette.tsx
│       │   ├── Properties/
│       │   │   └── Properties.tsx
│       │   ├── Toolbar/
│       │   │   └── Toolbar.tsx
│       │   ├── VersionHistory/
│       │   │   └── VersionHistory.tsx
│       │   └── TemplateSelector/
│       │       └── TemplateSelector.tsx
│       ├── stores/
│       │   ├── canvas.ts
│       │   └── collaboration.ts
│       ├── lib/
│       │   ├── mermaid-generator.ts
│       │   ├── aws-services.ts
│       │   └── yjs-provider.ts
│       ├── types/
│       │   └── index.ts
│       └── assets/
│           └── aws-icons/
├── migrations/
│   └── 0001_initial.sql
└── docs/
```

## ビルド・デプロイ

- `wrangler dev`: ローカル開発（Workers + D1ローカル + Durable Objectsローカル）
- Viteビルド出力をWorkers Sites（`[site]`設定）で静的配信
- `wrangler deploy`: 本番デプロイ
- D1マイグレーション: `wrangler d1 migrations apply`

## 検証方法

1. `wrangler dev` でローカル起動、ブラウザでアクセス
2. AWSサービスをD&Dで配置、接続線を引く
3. Mermaidコードが正しく生成されることを確認
4. 別ブラウザタブで同じダイアグラムを開き、リアルタイム同期を確認
5. スナップショット作成・復元が正しく動くことを確認
6. テンプレートから新規ダイアグラム作成を確認
7. Mermaidコードのエクスポート（コピー/.mmd）を確認
