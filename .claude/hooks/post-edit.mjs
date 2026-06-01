#!/usr/bin/env node
/**
 * PostToolUse フック (Edit | Write | MultiEdit)
 *
 * ECC の「Prettier format」「console.log warning」フックを当プロジェクト向けに
 * まとめたもの。編集された 1 ファイルに対してのみ動作するため軽量。
 *
 *   1. Prettier が利用可能なら編集ファイルを自動整形(失敗時は静かにスキップ)
 *   2. src 配下の .ts/.tsx に console.log が残っていれば Claude に警告を返す
 *      (Chrome 拡張の公開前のデバッグ文混入を防ぐ)
 *
 * 入力: stdin に Claude Code が渡す JSON ({ tool_input: { file_path } })
 * 出力: 警告がある場合のみ hookSpecificOutput.additionalContext を返す(非ブロック)
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

const raw = await readStdin();
let payload = {};
try {
  payload = JSON.parse(raw);
} catch {
  process.exit(0);
}

const file = payload?.tool_input?.file_path;
if (!file) process.exit(0);

const messages = [];

// 1. Prettier で自動整形(ローカルに無ければスキップ)
if (/\.(ts|tsx|js|jsx|mjs|cjs|json|css|html|md)$/.test(file)) {
  try {
    execFileSync("npx", ["--no-install", "prettier", "--write", file], {
      stdio: "ignore",
    });
  } catch {
    // prettier 未導入 / 整形失敗時は何もしない(編集自体は妨げない)
  }
}

// 2. console.log の残存チェック(src 配下のソースのみ)
if (/src[/\\].*\.(ts|tsx)$/.test(file)) {
  try {
    const content = readFileSync(file, "utf-8");
    if (/\bconsole\.log\s*\(/.test(content)) {
      messages.push(
        `⚠️ ${file} に console.log が残っています。Chrome 拡張の公開前に削除を検討してください。`,
      );
    }
  } catch {
    // 読めない場合は無視
  }
}

if (messages.length > 0) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: messages.join("\n"),
      },
    }),
  );
}
process.exit(0);
