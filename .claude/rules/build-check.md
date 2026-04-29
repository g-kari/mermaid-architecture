---
paths: "**/*.ts,**/*.tsx"
---

# ビルドチェックフロー

コード変更後は以下の順序で実行：

1. `npm run typecheck` — 型エラーがあれば修正
2. `npm run build` — ビルドエラーがあれば修正

lint/format ツールは未設定のため実行不要。
