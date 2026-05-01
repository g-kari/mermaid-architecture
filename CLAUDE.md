# CLAUDE.md

## プロジェクト概要

AWS構成図をGUIで作成しMermaidコードとしてエクスポートするWebアプリ。ドラッグ&ドロップでAWSサービスを配置・接続。リアルタイム共同編集対応。

## 技術スタック

- **フロントエンド**: React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS 4 + Zustand
- **バックエンド**: Cloudflare Workers + Hono + D1 (SQLite)
- **リアルタイム同期**: Yjs + y-protocols + WebSocket (Durable Objects hibernation API)
- **認証**: Cloudflare Access JWT（dev時はX-Dev-User-Emailヘッダーでバイパス）
- **品質管理**: Biome (lint + format) + Vitest (test) + pre-commit
- **パッケージ管理**: pnpm + devbox
- **コマンド管理**: just

## アーキテクチャ

```
ブラウザ(React SPA) ←REST API→ Workers(Hono) ←→ D1
                     ←WebSocket→ Durable Object(DiagramRoom) → D1 flush(30秒alarm)
```

## プロジェクト構造

```
src/worker/         — Cloudflare Workers バックエンド
  routes/           — REST API（projects, diagrams, templates, snapshots, users）
  durable-objects/  — DiagramRoom（WebSocket + Yjs同期 + D1フラッシュ）
  middleware/       — CF Access JWT認証
src/client/         — React SPA
  pages/            — Dashboard, ProjectDetail, Editor
  components/       — Canvas, Palette, Properties, Toolbar, TemplateSelector, VersionHistory
  stores/           — Zustand（canvas, auth, collaboration）
  lib/              — api, aws-services, mermaid-generator, yjs-provider
migrations/         — D1 SQLマイグレーション
```

## 開発コマンド（just）

```bash
just dev              # フロント + Worker 並列起動
just dev-front        # Vite dev server（ポート5173）
just dev-worker       # Wrangler dev server（ポート8787）
just build            # Viteフロントエンドビルド
just deploy           # build + wrangler deploy
just lint             # Biome lint
just lint-fix         # Biome lint 自動修正
just fmt              # Biome format
just test             # Vitest
just check            # typecheck + biome check 全チェック
just db-migrate-local # D1マイグレーション（ローカル）
just db-migrate       # D1マイグレーション（リモート）
just setup            # pre-commit hooks インストール
```

## 開発時の注意事項

- dev時は `just dev` で2プロセス並列起動（フロント + Worker）
- Viteは /api/* を localhost:8787 にプロキシ
- wrangler.toml の DEV_MODE=true で認証バイパス有効
- D1スキーマ変更後は `just db-migrate-local` を忘れずに
- キャンバスはSVG（HTML Canvasではない）、viewBox制御でパン/ズーム
- ノード追加は HTML5 Drag and Drop API（dnd-kitではない）
- DiagramRoom は30秒間隔のalarmでD1にフラッシュ
- コミット時にpre-commitでBiome + typecheck + testが自動実行される
- アイコンは `aws-icons` パッケージの公式AWS Architecture Icons（SVG）を利用。`public/aws-icons/` に配置し、`src/client/lib/aws-icons.ts` の `getIconUrl(serviceId)` でパスを取得
- 新サービス追加時は `aws-icons` パッケージから該当SVGを `public/aws-icons/{serviceId}.svg` にコピーすること
- SVGキャンバス内でHTMLコンポーネントを使う場合は `<foreignObject>` でラップすること
