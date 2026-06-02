# Claude Code フック

[affaan-m/ECC](https://github.com/affaan-m/ECC) のフック設計を参考に、当プロジェクト
(Chrome 拡張 / TypeScript + React + Vite)向けに最小構成で導入したもの。
設定本体は [`.claude/settings.json`](../settings.json)。

| フック | イベント | 対象 | 動作 |
|--------|----------|------|------|
| `post-edit.mjs` | PostToolUse | `Edit` / `Write` / `MultiEdit` | 編集ファイルを Prettier で自動整形し、`src` 配下の `.ts/.tsx` に `console.log` が残っていれば警告を返す |
| `pre-bash-gate.mjs` | PreToolUse | `Bash` | `git commit` / `git push` の前に `tsc --noEmit` を実行し、型エラーがあれば実行をブロックする |

## 設計メモ

- いずれも標準入力で Claude Code から JSON を受け取り、Node.js のみで動作する
  (外部依存なし)。Prettier はローカルに無ければ整形をスキップするため安全。
- `post-edit.mjs` は編集された 1 ファイルのみを処理するため軽量。
- `pre-bash-gate.mjs` は `permissionDecision: "deny"` を返してコミット/プッシュを
  止める。型崩れのまま push する事故を防ぐのが目的。
- 無効化したい場合は `.claude/settings.json` の該当エントリを削除する。
