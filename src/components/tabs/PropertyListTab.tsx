import type { Property } from "@/types";
import { usePropertyStore } from "@/store";
import { GradeChip } from "@/components/ui/GradeChip";
import { StatusBadge } from "@/components/ui/Badge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { formatManEn, formatRatio } from "@/lib";
import { exportToTSV, exportToCSV, exportToJSON, downloadFile, copyToClipboard } from "@/services";
import { Trash2, Copy, Download, GitCompare, X } from "lucide-react";
import { useState } from "react";

export function PropertyListTab() {
  const { properties, setActiveProperty, setActiveTab, deleteProperty, duplicateProperty, clearAll } = usePropertyStore();
  const [sortBy, setSortBy] = useState<"totalScore" | "price" | "createdAt" | "sekisanRatio">("totalScore");
  const [exportMsg, setExportMsg] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  const sorted = [...properties].sort((a, b) => {
    if (sortBy === "totalScore") return (b.score?.totalScore ?? 0) - (a.score?.totalScore ?? 0);
    if (sortBy === "price") return (a.raw.price ?? 0) - (b.raw.price ?? 0);
    if (sortBy === "sekisanRatio") return (a.sekisan?.priceToSekisanRatio ?? 999) - (b.sekisan?.priceToSekisanRatio ?? 999);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const selectedProperties = sorted.filter((p) => selectedIds.has(p.id));

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

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5) next.add(id);
      return next;
    });
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
          {selectedIds.size >= 2 && (
            <button
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-1 text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
            >
              <GitCompare size={10} /> 比較({selectedIds.size})
            </button>
          )}
          {exportMsg && <span className="text-xs text-green-600 font-bold ml-1">{exportMsg}</span>}
        </div>
        {selectedIds.size > 0 && (
          <p className="text-2xs text-gray-400 mt-1">
            {selectedIds.size}件選択中（最大5件比較可能）
          </p>
        )}
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
              selected={selectedIds.has(p.id)}
              onSelect={() => toggleSelect(p.id)}
              onClick={() => {
                setActiveProperty(p.id);
                setActiveTab("overview");
              }}
              onDelete={() => deleteProperty(p.id)}
              onDuplicate={() => {
                duplicateProperty(p.id);
                setActiveTab("overview");
              }}
            />
          ))}
        </div>
      )}

      {properties.length > 0 && (
        <button
          onClick={() => { if (window.confirm("全物件を削除しますか？")) clearAll(); }}
          className="w-full text-xs text-red-500 border border-red-200 rounded py-1 hover:bg-red-50"
        >
          全件削除
        </button>
      )}

      {/* 比較モーダル */}
      {showCompare && selectedProperties.length >= 2 && (
        <CompareModal
          properties={selectedProperties}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}

function PropertyCard({
  property,
  rank,
  selected,
  onSelect,
  onClick,
  onDelete,
  onDuplicate,
}: {
  property: Property;
  rank: number;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const r = property.raw;
  return (
    <div
      className={`bg-white rounded-lg p-2.5 border shadow-sm cursor-pointer transition-colors ${
        selected ? "border-purple-400 bg-purple-50" : "border-gray-100 hover:border-blue-300"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={selected}
          onClick={(e) => e.stopPropagation()}
          onChange={onSelect}
          className="mt-1 cursor-pointer"
        />
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
        <div className="flex flex-col gap-1">
          <button
            title="複製"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="text-gray-300 hover:text-blue-400 p-1"
          >
            <Copy size={12} />
          </button>
          <button
            title="削除"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-gray-300 hover:text-red-400 p-1"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CompareModal({ properties, onClose }: { properties: Property[]; onClose: () => void }) {
  const SCORE_LABELS = [
    { key: "sekisanScore", label: "積算" },
    { key: "loanScore", label: "融資" },
    { key: "airbnbScore", label: "民泊" },
    { key: "exitScore", label: "出口" },
    { key: "profitabilityScore", label: "収益" },
    { key: "riskScore", label: "リスク" },
    { key: "totalScore", label: "総合" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="bg-white w-full rounded-t-xl p-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">物件比較</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* 物件名・価格 */}
        <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `repeat(${properties.length}, 1fr)` }}>
          {properties.map((p) => (
            <div key={p.id} className="text-center">
              {p.score && <GradeChip grade={p.score.grade} score={p.score.totalScore} size="lg" />}
              <div className="text-xs font-bold text-gray-800 mt-1 truncate">{p.raw.name ?? "名称なし"}</div>
              <div className="text-xs text-blue-700">{p.raw.price ? formatManEn(p.raw.price) : "-"}</div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>

        {/* 積算比較 */}
        <div className="mb-3">
          <div className="text-xs font-bold text-gray-600 mb-1">積算情報</div>
          {[
            { label: "積算価格", getValue: (p: Property) => p.sekisan ? formatManEn(p.sekisan.totalSekisan) : "-" },
            { label: "価格/積算比", getValue: (p: Property) => p.sekisan ? formatRatio(p.sekisan.priceToSekisanRatio) : "-" },
            { label: "土地値割合", getValue: (p: Property) => p.sekisan ? formatRatio(p.sekisan.landValueRatio) : "-" },
          ].map(({ label, getValue }) => (
            <div key={label} className="flex text-xs py-1 border-b border-gray-50">
              <span className="w-20 text-gray-500 shrink-0">{label}</span>
              <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${properties.length}, 1fr)` }}>
                {properties.map((p) => (
                  <span key={p.id} className="text-center font-medium">{getValue(p)}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* スコア比較 */}
        <div>
          <div className="text-xs font-bold text-gray-600 mb-2">スコア比較</div>
          {SCORE_LABELS.map(({ key, label }) => (
            <div key={key} className="mb-2">
              <div className="text-2xs text-gray-400 mb-1">{label}</div>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${properties.length}, 1fr)` }}>
                {properties.map((p) => {
                  const score = p.score?.[key] ?? 0;
                  return (
                    <ScoreBar key={p.id} label="" score={score} compact />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
