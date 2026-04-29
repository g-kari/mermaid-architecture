# CLAUDE.md

## プロジェクト概要

AWS構成図をGUIで作成しMermaidコードとしてエクスポートするWebアプリ。ドラッグ&ドロップでAWSサービスを配置・接続。リアルタイム共同編集対応。

## 技術スタック

- **フロントエンド**: React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS 4 + Zustand
- **バックエンド**: Cloudflare Workers + Hono + D1 (SQLite)
- **リアルタイム同期**: Yjs + y-protocols + WebSocket (Durable Objects hibernation API)
- **認証**: Cloudflare Access JWT（dev時はX-Dev-User-Emailヘッダーでバイパス）

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

## 開発コマンド

```bash
npm run dev              # Vite dev server（ポート5173、/api→8787プロキシ）
npm run dev:worker       # Wrangler dev server（ポート8787）
npm run build            # Viteフロントエンドビルド
npm run deploy           # build + wrangler deploy
npm run db:migrate:local # D1マイグレーション（ローカル）
npm run db:migrate       # D1マイグレーション（リモート）
npm run typecheck        # tsc --noEmit
```

※ lint/format/test コマンドは未設定。品質チェックは typecheck のみ。

## 開発時の注意事項

- dev時は2プロセス必要: `npm run dev`（フロント） + `npm run dev:worker`（API）
- Viteは /api/* を localhost:8787 にプロキシ
- wrangler.toml の DEV_MODE=true で認証バイパス有効
- D1スキーマ変更後は `npm run db:migrate:local` を忘れずに
- キャンバスはSVG（HTML Canvasではない）、viewBox制御でパン/ズーム
- ノード追加は HTML5 Drag and Drop API（dnd-kitではない）
- DiagramRoom は30秒間隔のalarmでD1にフラッシュ
