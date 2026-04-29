---
paths:
---

# Git 運用方針

- **コミット前に** `just check` を実行（typecheck + biome check）
- pre-commitフックで Biome + typecheck + test が自動実行される
- コミットメッセージは日本語
- 機能単位でコミット、大きな変更は適切な単位に分割
