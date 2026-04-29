---
name: design-reviewer
description: UI変更後にデザインシステムとの整合性をレビュー。ハードコード色、テーマ非対応、トークン未使用を検出。
---

# デザインレビュー Agent

UIコンポーネント（`src/client/**/*.tsx`）の変更後に、デザインシステムルールとの整合性をチェックする。

## チェック項目

### 1. ハードコード色の検出
`src/client/` 配下の `.tsx` ファイルで以下のパターンを grep:
- `bg-gray-` / `text-gray-` / `border-gray-` — Tailwind gray直指定
- `bg-blue-` / `text-blue-` / `bg-red-` — Tailwind color直指定
- `text-white`（ボタン以外のコンテキスト）
- `#` + 6桁hex（SVG内、サービス色・ユーザー色以外）

許可される例外:
- `service.color` / `service?.color` 由来の動的色
- `user.color` 由来のリモートカーソル色
- `text-white` がサービス色やユーザー色の背景上にある場合

### 2. CSS変数トークンの使用確認
変更されたファイルが以下のトークンを正しく使っているか:
- 背景: `bg-bg` / `bg-bg-panel` / `bg-bg-canvas` / `bg-bg-hover` / `bg-bg-input`
- テキスト: `text-text` / `text-text-secondary` / `text-text-tertiary`
- ボーダー: `border-border` / `border-border-strong`
- アクセント: `bg-accent` / `text-accent` / `bg-accent-hover`

### 3. 角丸の一貫性
- カード/モーダル: `rounded-lg` であること
- ボタン/入力欄: `rounded-md` であること
- `rounded` 単体（Tailwindデフォルト）は使わない

### 4. SVG色のCSS変数化
SVG内の `fill` / `stroke` 属性で:
- `var(--node-body)` / `var(--node-border)` 等を使っているか
- ハードコードhex（`#1f2937` 等）が残っていないか

## レポート形式

```
## デザインレビュー結果

### 問題あり
- [ファイル:行] bg-gray-800 → bg-bg-panel に変更必要
- [ファイル:行] text-white → text-text に変更必要（ボタン以外）

### 許容（例外）
- [ファイル:行] text-white — サービス色背景上のため許容

### OK
- 全トークン正しく使用
- 角丸一貫
```
