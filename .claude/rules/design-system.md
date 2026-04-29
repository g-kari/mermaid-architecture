---
paths: "src/client/**/*.tsx,src/client/**/*.css"
---

# デザインシステムルール

## テーマ

ライト/ダーク切り替え対応。CSS変数（`src/client/index.css`）でトークンを定義し、Tailwind CSS 4の@themeで統合。

## カラー — 必ずCSS変数ベースのTailwindクラスを使う

ハードコードされた色（`bg-gray-800`, `text-white`, `#1f2937`等）は禁止。以下のトークンを使うこと：

| 用途 | Tailwindクラス | ライト値 | ダーク値 |
|------|---------------|---------|---------|
| ベース背景 | `bg-bg` | #FFFFFF | #0F172A |
| パネル背景 | `bg-bg-panel` | #F9FAFB | #1E293B |
| キャンバス背景 | `bg-bg-canvas` | #F3F4F6 | #0F172A |
| ホバー | `bg-bg-hover` | #F3F4F6 | #334155 |
| 入力欄 | `bg-bg-input` | #FFFFFF | #1E293B |
| ボーダー | `border-border` | #E5E7EB | #334155 |
| 強いボーダー | `border-border-strong` | #D1D5DB | #475569 |
| テキスト | `text-text` | #111827 | #F1F5F9 |
| 二次テキスト | `text-text-secondary` | #4B5563 | #94A3B8 |
| 三次テキスト | `text-text-tertiary` | #9CA3AF | #64748B |
| アクセント | `bg-accent` / `text-accent` | #4F46E5 | #6366F1 |
| アクセントホバー | `bg-accent-hover` | #4338CA | #4F46E5 |
| アクセント薄 | `bg-accent-soft` | #EEF2FF | rgba(99,102,241,0.15) |
| 危険 | `bg-danger` / `text-danger-text` | #EF4444 | #F87171 |
| 成功 | `bg-success` | #10B981 | #34D399 |
| オーバーレイ | `bg-overlay` | rgba(0,0,0,0.3) | rgba(0,0,0,0.6) |

## SVG内の色 — CSS変数を直接使う

SVGの`fill`/`stroke`属性にはCSS変数を使用：

- `var(--grid-color)` — キャンバスグリッド
- `var(--node-body)` / `var(--node-border)` / `var(--node-selected-border)` — ノード
- `var(--edge-color)` / `var(--edge-selected)` / `var(--edge-label)` — エッジ
- `var(--port-color)` / `var(--port-target)` — 接続ポート

例外: AWSサービス固有色（`service.color`）とユーザー固有色（リモートカーソル等）はハードコードOK。

## 角丸

- カード / モーダル: `rounded-lg`
- ボタン / 入力欄: `rounded-md`
- アバター / インジケーター: `rounded-full`
- SVGノード: `rx={8}`

## ボタンテキスト

- アクセント背景のボタン: `text-accent-text`（常に白）
- サービス色背景のアイコン: `text-white`（動的背景色上のため）
- それ以外のテキスト: `text-text` 系を使い、`text-white` は使わない

## 新規コンポーネント追加時

1. 上記トークンのみ使用
2. ライト/ダーク両方で確認
3. `text-white`は動的色背景上のみ許可
