import { useState } from "react";
import { usePropertyStore } from "@/store";
import type { ParseResult, RawProperty } from "@/types";

export function PopupApp() {
  const { addProperty, properties, setActiveProperty } = usePropertyStore();
  const [status, setStatus] = useState<"idle" | "parsing" | "confirm" | "done" | "error">("idle");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleParse() {
    setStatus("parsing");
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("タブが取得できません");

      const results = await chrome.tabs.sendMessage(tab.id, { type: "PARSE_PAGE" });
      if (!results.ok) throw new Error(results.error);

      setParseResult(results.result);
      setStatus("confirm");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }

  function handleConfirm() {
    if (!parseResult) return;
    const raw: RawProperty = {
      ...parseResult.candidates,
      currentUrl: parseResult.candidates.currentUrl ?? "",
      source: parseResult.source,
      fetchedAt: new Date().toISOString(),
    };
    const property = addProperty(raw);
    setActiveProperty(property.id);

    chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" });
    setStatus("done");
  }

  return (
    <div className="p-4 min-w-[320px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">積</div>
        <div>
          <div className="text-sm font-bold">不動産積算ナビ</div>
          <div className="text-xs text-gray-500">物件情報を半自動抽出</div>
        </div>
      </div>

      {status === "idle" && (
        <>
          <button
            onClick={handleParse}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            このページから物件情報を取得
          </button>
          <div className="mt-3 text-xs text-gray-500">
            登録済み: {properties.length}件
          </div>
        </>
      )}

      {status === "parsing" && (
        <div className="text-center py-4 text-sm text-gray-600">解析中...</div>
      )}

      {status === "confirm" && parseResult && (
        <div>
          <div className="text-xs font-bold text-gray-700 mb-2">取得候補（確認してください）</div>
          <div className="bg-gray-50 rounded p-2 max-h-48 overflow-y-auto text-xs space-y-1 mb-3">
            {Object.entries(parseResult.candidates)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-gray-500 w-24 shrink-0">{k}</span>
                  <span className="text-gray-800 truncate">{String(v)}</span>
                </div>
              ))}
          </div>
          {parseResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-100 rounded p-2 mb-3 text-xs text-yellow-700">
              {parseResult.warnings.join(" / ")}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setStatus("idle")}
              className="flex-1 border border-gray-300 text-gray-600 py-1.5 rounded text-xs hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-blue-600 text-white py-1.5 rounded text-xs font-bold hover:bg-blue-700"
            >
              保存してサイドパネルへ
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="text-center py-4">
          <div className="text-green-600 font-bold text-sm mb-1">✓ 保存しました</div>
          <div className="text-xs text-gray-500">サイドパネルで確認してください</div>
        </div>
      )}

      {status === "error" && (
        <div>
          <div className="bg-red-50 border border-red-100 rounded p-2 text-xs text-red-600 mb-3">
            {errorMsg}
          </div>
          <button
            onClick={() => setStatus("idle")}
            className="w-full border border-gray-300 text-gray-600 py-1.5 rounded text-xs"
          >
            戻る
          </button>
        </div>
      )}
    </div>
  );
}
