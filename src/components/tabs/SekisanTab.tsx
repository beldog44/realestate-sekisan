import { useState } from "react";
import type { Property, SekisanInput, BuildingStructure } from "@/types";
import { usePropertyStore } from "@/store";
import { formatManEn, formatRatio } from "@/lib";
import { BUILDING_UNIT_PRICE_RANGES } from "@/constants";
import { Calculator } from "lucide-react";

interface SekisanTabProps {
  property: Property;
}

export function SekisanTab({ property }: SekisanTabProps) {
  const { recalculate } = usePropertyStore();
  const r = property.raw;

  const [input, setInput] = useState<Partial<SekisanInput>>({
    price: r.price ?? 0,
    landArea: r.landArea ?? 0,
    buildingArea: r.buildingArea ?? 0,
    structure: r.structure ?? "木造",
    builtYear: r.builtYear ?? new Date().getFullYear() - 20,
    builtMonth: r.builtMonth ?? 1,
    linePrice: 100000,
    frontRoadWidth: r.frontRoadWidth ?? 4,
    canRebuild: r.canRebuild ?? true,
    setback: r.setback ?? false,
    isLeasehold: false,
    leaseholdRatio: 0.6,
  });

  const structures: BuildingStructure[] = ["木造", "軽量鉄骨", "重量鉄骨", "RC", "SRC", "その他"];

  function handleCalc() {
    if (!input.linePrice || !input.price || !input.landArea || !input.buildingArea || !input.structure || !input.builtYear) return;
    recalculate(property.id, input as SekisanInput);
  }

  const s = property.sekisan;

  return (
    <div className="space-y-4">
      {/* 入力フォーム */}
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1">
          <Calculator size={12} /> 積算計算入力
        </h3>
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-gray-500">販売価格（万円）</span>
              <input
                type="number"
                className="mt-1 w-full border rounded px-2 py-1 text-xs"
                value={(input.price ?? 0) / 10000}
                onChange={(e) => setInput({ ...input, price: parseFloat(e.target.value) * 10000 })}
              />
            </label>
            <label className="block">
              <span className="text-gray-500 font-semibold text-blue-600">路線価（円/㎡）</span>
              <input
                type="number"
                className="mt-1 w-full border border-blue-300 rounded px-2 py-1 text-xs"
                value={input.linePrice}
                onChange={(e) => setInput({ ...input, linePrice: parseFloat(e.target.value) })}
                placeholder="例: 150000"
              />
            </label>
            <label className="block">
              <span className="text-gray-500">土地面積（㎡）</span>
              <input
                type="number"
                className="mt-1 w-full border rounded px-2 py-1 text-xs"
                value={input.landArea}
                onChange={(e) => setInput({ ...input, landArea: parseFloat(e.target.value) })}
              />
            </label>
            <label className="block">
              <span className="text-gray-500">建物面積（㎡）</span>
              <input
                type="number"
                className="mt-1 w-full border rounded px-2 py-1 text-xs"
                value={input.buildingArea}
                onChange={(e) => setInput({ ...input, buildingArea: parseFloat(e.target.value) })}
              />
            </label>
            <label className="block">
              <span className="text-gray-500">構造</span>
              <select
                className="mt-1 w-full border rounded px-2 py-1 text-xs"
                value={input.structure}
                onChange={(e) => setInput({ ...input, structure: e.target.value as BuildingStructure })}
              >
                {structures.map((s) => (
                  <option key={s} value={s}>{s}（{BUILDING_UNIT_PRICE_RANGES[s].default.toLocaleString()}円/㎡）</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-gray-500">築年（西暦）</span>
              <input
                type="number"
                className="mt-1 w-full border rounded px-2 py-1 text-xs"
                value={input.builtYear}
                onChange={(e) => setInput({ ...input, builtYear: parseInt(e.target.value) })}
              />
            </label>
            <label className="block">
              <span className="text-gray-500">前面道路幅員（m）</span>
              <input
                type="number"
                step="0.1"
                className="mt-1 w-full border rounded px-2 py-1 text-xs"
                value={input.frontRoadWidth}
                onChange={(e) => setInput({ ...input, frontRoadWidth: parseFloat(e.target.value) })}
              />
            </label>
          </div>
          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={input.canRebuild ?? true}
                onChange={(e) => setInput({ ...input, canRebuild: e.target.checked })}
              />
              再建築可
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={input.setback ?? false}
                onChange={(e) => setInput({ ...input, setback: e.target.checked })}
              />
              セットバックあり
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={input.isLeasehold ?? false}
                onChange={(e) => setInput({ ...input, isLeasehold: e.target.checked })}
              />
              借地権
            </label>
          </div>
        </div>
        <button
          onClick={handleCalc}
          className="mt-3 w-full bg-blue-600 text-white text-xs py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          積算計算する
        </button>
      </div>

      {/* 計算結果 */}
      {s && (
        <>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <h3 className="text-xs font-bold text-blue-700 mb-2">積算結果</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-500">積算合計</div>
                <div className="font-bold text-blue-700 text-sm">{formatManEn(s.totalSekisan)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">価格/積算</div>
                <div className={`font-bold text-sm ${s.priceToSekisanRatio <= 1 ? "text-green-700" : "text-red-600"}`}>
                  {formatRatio(s.priceToSekisanRatio)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">土地値割合</div>
                <div className="font-bold text-gray-700 text-sm">{formatRatio(s.landValueRatio)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 mb-2">土地積算明細</h3>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-50">
                <tr><td className="py-1 text-gray-500">路線価</td><td className="text-right font-medium">{s.land.linePrice.toLocaleString()} 円/㎡</td></tr>
                <tr><td className="py-1 text-gray-500">土地面積</td><td className="text-right font-medium">{s.land.landArea} ㎡</td></tr>
                <tr><td className="py-1 text-gray-500">奥行補正</td><td className="text-right font-medium">{s.land.depthCorrectionFactor.toFixed(2)}</td></tr>
                <tr><td className="py-1 text-gray-500">間口補正</td><td className="text-right font-medium">{s.land.frontageNarrownessFactor.toFixed(2)}</td></tr>
                {!r.canRebuild && <tr><td className="py-1 text-red-500">再建築不可補正</td><td className="text-right font-medium text-red-500">{s.land.nonRebuildFactor.toFixed(2)}</td></tr>}
                {r.setback && <tr><td className="py-1 text-yellow-600">セットバック補正</td><td className="text-right font-medium text-yellow-600">{s.land.setbackFactor.toFixed(2)}</td></tr>}
                <tr className="border-t-2 border-blue-200"><td className="py-1 font-bold text-blue-700">土地積算価格</td><td className="text-right font-bold text-blue-700">{formatManEn(s.land.totalLandValue)}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 mb-2">建物積算明細</h3>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-50">
                <tr><td className="py-1 text-gray-500">再調達単価</td><td className="text-right font-medium">{s.building.unitPrice.toLocaleString()} 円/㎡</td></tr>
                <tr><td className="py-1 text-gray-500">建物面積</td><td className="text-right font-medium">{s.building.buildingArea} ㎡</td></tr>
                <tr><td className="py-1 text-gray-500">法定耐用年数</td><td className="text-right font-medium">{s.building.usefulLife} 年</td></tr>
                <tr><td className="py-1 text-gray-500">経過年数</td><td className="text-right font-medium">{s.building.elapsedYears.toFixed(1)} 年</td></tr>
                <tr><td className="py-1 text-gray-500">残存価値率</td><td className="text-right font-medium">{formatRatio(s.building.residualYearsRatio)}</td></tr>
                <tr className="border-t-2 border-blue-200"><td className="py-1 font-bold text-blue-700">建物積算価格</td><td className="text-right font-bold text-blue-700">{formatManEn(s.building.totalBuildingValue)}</td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
