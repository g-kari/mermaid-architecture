# mermaid-architecture コマンド管理

# 開発サーバー起動（フロント + Worker並列）
dev:
    pnpm dev & pnpm dev:worker & wait

# フロントエンドのみ起動
dev-front:
    pnpm dev

# Workerのみ起動
dev-worker:
    pnpm dev:worker

# ビルド
build:
    pnpm build

# デプロイ（build + wrangler deploy）
deploy:
    pnpm deploy

# 型チェック
typecheck:
    pnpm typecheck

# lint（Biome）
lint:
    pnpm lint

# lint自動修正
lint-fix:
    pnpm lint:fix

# フォーマット
fmt:
    pnpm format

# フォーマットチェック
fmt-check:
    pnpm format:check

# テスト
test:
    pnpm test

# テスト（watchモード）
test-watch:
    pnpm test:watch

# 全チェック（typecheck + biome check）
check:
    pnpm check-all

# D1マイグレーション（ローカル）
db-migrate-local:
    pnpm db:migrate:local

# D1マイグレーション（リモート）
db-migrate:
    pnpm db:migrate

# pre-commit hooks インストール
setup:
    pre-commit install
