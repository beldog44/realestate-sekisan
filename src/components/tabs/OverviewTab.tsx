import type { Property } from "@/types";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { GradeChip } from "@/components/ui/GradeChip";
import { usePropertyStore } from "@/store";
import { formatManEn, formatRatio } from "@/lib";
import { MapPin, Train, Calendar, Building2, ExternalLink } from "lucide-react";

interface OverviewTabProps {
  property: Property;
}

const STATUS_OPTIONS = ["未設定", "買付候補", "詳細確認", "保留", "除外"] as const;

export function OverviewTab({ property }: OverviewTabProps) {
  const { setStatus } = usePropertyStore();
  const r = property.raw;

  return (
    <div className="space-y-4">
      {/* 物件基本情報 */}
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-sm font-bold text-gray-800 leading-tight">
            {r.name ?? "物件名未取得"}
          </h2>
          {property.score && (
            <GradeChip grade={property.score.grade} score={property.score.totalScore} />
          )}
        </div>

        <div className="text-xl font-bold text-blue-700 mb-2">
          {r.price ? formatManEn(r.price) : "価格未取得"}
        </div>

        <div className="space-y-1 text-xs text-gray-600">
          {r.address && (
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>{r.address}</span>
            </div>
          )}
          {r.nearestStation && (
            <div className="flex items-center gap-1">
              <Train size={12} />
              <span>{r.nearestStation} 徒歩{r.walkMinutes ?? "?"}分</span>
            </div>
          )}
          {r.builtYear && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{r.builtYear}年{r.builtMonth ? `${r.builtMonth}月` : ""}築 / {r.structure ?? "構造不明"}</span>
            </div>
          )}
          {(r.landArea || r.buildingArea) && (
            <div className="flex items-center gap-1">
              <Building2 size={12} />
              <span>
                {r.landArea ? `土地${r.landArea}㎡` : ""}
                {r.landArea && r.buildingArea ? " / " : ""}
                {r.buildingArea ? `建物${r.buildingArea}㎡` : ""}
                {r.floorPlan ? ` / ${r.floorPlan}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 積算サマリー */}
      {property.sekisan && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <h3 className="text-xs font-bold text-blue-700 mb-2">積算評価サマリー</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-500">積算価格</div>
              <div className="font-bold text-gray-800">{formatManEn(property.sekisan.totalSekisan)}</div>
            </div>
            <div>
              <div className="text-gray-500">価格/積算比</div>
              <div className={`font-bold ${property.sekisan.priceToSekisanRatio <= 1 ? "text-green-700" : "text-red-600"}`}>
                {formatRatio(property.sekisan.priceToSekisanRatio)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">土地積算</div>
              <div className="font-bold text-gray-800">{formatManEn(property.sekisan.land.totalLandValue)}</div>
            </div>
            <div>
              <div className="text-gray-500">土地値割合</div>
              <div className="font-bold text-gray-800">{formatRatio(property.sekisan.landValueRatio)}</div>
            </div>
          </div>
        </div>
      )}

      {/* スコア一覧 */}
      {property.score && (
        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold text-gray-700 mb-2">カテゴリスコア</h3>
          <div className="space-y-2">
            <ScoreBar label="積算" score={property.score.sekisanScore} compact />
            <ScoreBar label="融資" score={property.score.loanScore} compact />
            <ScoreBar label="民泊" score={property.score.airbnbScore} compact />
            <ScoreBar label="出口" score={property.score.exitScore} compact />
            <ScoreBar label="収益" score={property.score.profitabilityScore} compact />
            <ScoreBar label="リスク" score={property.score.riskScore} compact />
          </div>
        </div>
      )}

      {/* ステータス */}
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-700 mb-2">ステータス</h3>
        <div className="flex flex-wrap gap-1">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(property.id, s)}
              className={`text-xs px-2 py-1 rounded-full border transition-all ${
                property.status === s
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-300 text-gray-600 hover:border-blue-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 外部リンク */}
      {property.externalLinks && (
        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold text-gray-700 mb-2">外部リンク</h3>
          <div className="grid grid-cols-2 gap-1">
            {[
              { label: "国税庁路線価", url: property.externalLinks.rosen },
              { label: "Google Maps", url: property.externalLinks.googleMaps },
              { label: "地理院地図", url: property.externalLinks.gsi },
              { label: "用途地域", url: property.externalLinks.zoning },
              { label: "ハザードマップ", url: property.externalLinks.hazardMap },
            ].map(({ label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <ExternalLink size={10} />
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
