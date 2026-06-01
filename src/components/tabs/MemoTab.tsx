import { useState, useEffect } from "react";
import type { Property } from "@/types";
import { usePropertyStore } from "@/store";

interface MemoTabProps {
  property: Property;
}

export function MemoTab({ property }: MemoTabProps) {
  const { updateMemo } = usePropertyStore();
  const [memo, setMemo] = useState(property.memo);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMemo(property.memo);
  }, [property.id]);

  function handleSave() {
    updateMemo(property.id, memo);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-700 mb-2">メモ</h3>
        <textarea
          className="w-full border rounded p-2 text-xs h-48 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="現地確認メモ、交渉ポイント、懸念事項などを記録..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
        <button
          onClick={handleSave}
          className={`mt-2 w-full py-1.5 rounded text-xs font-bold transition-colors ${
            saved ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {saved ? "✓ 保存しました" : "保存"}
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <h3 className="text-xs font-bold text-gray-600 mb-2">チェックリスト（テンプレ）</h3>
        <ul className="text-xs text-gray-500 space-y-1">
          {[
            "□ 現地確認済み",
            "□ 路線価確認済み",
            "□ ハザードマップ確認",
            "□ 周辺民泊軒数調査",
            "□ 銀行打診済み",
            "□ 管理会社問合せ",
            "□ 売主属性確認",
            "□ 隣地境界確認",
          ].map((item) => (
            <li key={item} className="font-mono">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
