#!/usr/bin/env node
/**
 * PreToolUse フック (Bash)
 *
 * ECC の「Pre-commit quality check / Git push reminder」を当プロジェクト向けに実装。
 * `git commit` / `git push` を実行しようとしたときだけ型チェック(tsc --noEmit)を走らせ、
 * 型エラーがあれば実行をブロックして理由を返す。型崩れのまま push する事故を防ぐ。
 *
 * 入力: stdin に Claude Code が渡す JSON ({ tool_input: { command } })
 * 出力: 型エラー時のみ permissionDecision="deny" を返す。それ以外は何もしない(許可)。
 */
import { execSync } from "node:child_process";

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

const command = payload?.tool_input?.command ?? "";

// git commit / git push のときだけゲートをかける
if (!/\bgit\s+(commit|push)\b/.test(command)) {
  process.exit(0);
}

try {
  execSync("npm run -s typecheck", { stdio: "pipe", cwd: payload?.cwd });
} catch (error) {
  const out =
    (error.stdout?.toString() ?? "") + (error.stderr?.toString() ?? "");
  const reason =
    "型チェック(tsc --noEmit)に失敗しました。commit/push の前に型エラーを修正してください。\n\n" +
    out.trim().slice(-2000);
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

process.exit(0);
