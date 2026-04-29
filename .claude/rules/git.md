---
paths:
---

# Git 運用方針

- **コミット前に必ず** `npm run typecheck` を実行（check-allは未設定）
- コミットメッセージは日本語
- 機能単位でコミット、大きな変更は適切な単位に分割
- build確認が必要な場合は `npm run build` も実行

※ `npm run lint`, `npm run check-all` はこのプロジェクトに存在しない
