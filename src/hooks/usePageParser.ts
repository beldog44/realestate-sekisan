import { useState, useCallback } from "react";
import type { ParseResult } from "@/types";

type ParseStatus = "idle" | "parsing" | "done" | "error";

export function usePageParser() {
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parse = useCallback(async () => {
    setStatus("parsing");
    setError(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error("アクティブタブが見つかりません");

      const response = await chrome.tabs.sendMessage(tab.id, { type: "PARSE_PAGE" });
      if (!response.ok) throw new Error(response.error ?? "パース失敗");

      setResult(response.result as ParseResult);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, parse, reset };
}
