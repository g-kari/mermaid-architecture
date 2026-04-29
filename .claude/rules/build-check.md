---
paths: "**/*.ts,**/*.tsx"
---

# ビルドチェックフロー

コード変更後は以下の順序で実行：

1. `just lint-fix` — Biome lint + format 自動修正
2. `just check` — typecheck + biome check 全チェック
3. `just test` — テスト実行
