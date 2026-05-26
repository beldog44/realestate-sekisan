import type { Property } from "@/types";
import { usePropertyStore } from "@/store";
import { GradeChip } from "@/components/ui/GradeChip";
import { StatusBadge } from "@/components/ui/Badge";
import { formatManEn, formatRatio } from "@/lib";
import { exportToTSV, exportToCSV, exportToJSON, downloadFile, copyToClipboard } from "@/services";
import { Trash2, Copy, Download } from "lucide-react";
import { useState } from "react";

export function PropertyListTab() {
  const { properties, setActiveProperty, setActiveTab, deleteProperty, clearAll } = usePropertyStore();
  const [sortBy, setSortBy] = useState<"totalScore" | "price" | "createdAt" | "sekisanRatio">("totalScore");
  const [exportMsg, setExportMsg] = useState("");

  const sorted = [...properties].sort((a, b) => {
    if (sortBy === "totalScore") return (b.score?.totalScore ?? 0) - (a.score?.totalScore ?? 0);
    if (sortBy === "price") return (a.raw.price ?? 0) - (b.raw.price ?? 0);
    if (sortBy === "sekisanRatio") return (a.sekisan?.priceToSekisanRatio ?? 999) - (b.sekisan?.priceToSekisanRatio ?? 999);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  async function handleCopyTSV() {
    const tsv = exportToTSV(sorted);
    await copyToClipboard(tsv);
    setExportMsg("TSVコピー済み！");
    setTimeout(() => setExportMsg(""), 2000);
  }

  function handleDownloadCSV() {
    const csv = exportToCSV(sorted);
    downloadFile(csv, `sekisan_${Date.now()}.csv`, "text/csv");
  }

  function handleDownloadJSON() {
    const json = exportToJSON(sorted);
    downloadFile(json, `sekisan_${Date.now()}.json`, "application/json");
  }

  return (
    <div className="space-y-3">
      {/* ヘッダー操作 */}
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-700">物件一覧 ({properties.length}件)</h3>
          <select
            className="text-xs border rounded px-1 py-0.5"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="totalScore">総合スコア順</option>
            <option value="sekisanRatio">積算比率順</option>
            <option value="price">価格順</option>
            <option value="createdAt">登録日順</option>
          </select>
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={handleCopyTSV}
            className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
          >
            <Copy size={10} /> TSVコピー
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            <Download size={10} /> CSV
          </button>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1 text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
          >
            <Download size={10} /> JSON
          </button>
          {exportMsg && <span className="text-xs text-green-600 font-bold ml-1">{exportMsg}</span>}
        </div>
      </div>

      {/* 物件リスト */}
      {sorted.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-8">
          まだ物件が登録されていません
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((p, rank) => (
            <PropertyCard
              key={p.id}
              property={p}
              rank={rank + 1}
              onClick={() => {
                setActiveProperty(p.id);
                setActiveTab("overview");
              }}
              onDelete={() => deleteProperty(p.id)}
            />
          ))}
        </div>
      )}

      {properties.length > 0 && (
        <button
          onClick={() => { if (confirm("全物件を削除しますか？")) clearAll(); }}
          className="w-full text-xs text-red-500 border border-red-200 rounded py-1 hover:bg-red-50"
        >
          全件削除
        </button>
      )}
    </div>
  );
}

function PropertyCard({
  property,
  rank,
  onClick,
  onDelete,
}: {
  property: Property;
  rank: number;
  onClick: () => void;
  onDelete: () => void;
}) {
  const r = property.raw;
  return (
    <div
      className="bg-white rounded-lg p-2.5 border border-gray-100 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div className="text-xs text-gray-400 font-bold w-5 pt-0.5">#{rank}</div>
        {property.score && (
          <GradeChip grade={property.score.grade} score={property.score.totalScore} />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-gray-800 truncate">{r.name ?? "名称なし"}</div>
          <div className="text-xs text-blue-700 font-medium">{r.price ? formatManEn(r.price) : "価格未取得"}</div>
          <div className="text-xs text-gray-500 truncate">{r.address ?? ""}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge status={property.status} />
            {property.sekisan && (
              <span className={`text-xs ${property.sekisan.priceToSekisanRatio <= 1 ? "text-green-600" : "text-red-500"}`}>
                積算比{formatRatio(property.sekisan.priceToSekisanRatio)}
              </span>
            )}
            <span className="text-xs text-gray-400">{r.source}</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-gray-300 hover:text-red-400 p-1"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
