import type { Property } from "@/types";
import { formatManEn, formatRatio } from "@/lib";

const HEADERS = [
  "物件名", "販売価格", "所在地", "土地面積(㎡)", "建物面積(㎡)",
  "間取り", "構造", "築年", "築月", "用途地域",
  "建ぺい率(%)", "容積率(%)", "再建築", "セットバック",
  "最寄駅", "徒歩(分)", "想定賃料(月)", "表面利回り(%)",
  "積算価格", "土地積算", "建物積算", "積算比率", "土地値割合",
  "民泊スコア", "民泊法的形態",
  "積算スコア", "融資スコア", "出口スコア", "収益スコア", "リスクスコア", "総合スコア", "グレード",
  "ステータス", "メモ", "詳細URL", "取得日時",
];

function propertyToRow(p: Property): string[] {
  const r = p.raw;
  return [
    r.name ?? "",
    r.price ? formatManEn(r.price) : "",
    r.address ?? "",
    r.landArea?.toString() ?? "",
    r.buildingArea?.toString() ?? "",
    r.floorPlan ?? "",
    r.structure ?? "",
    r.builtYear?.toString() ?? "",
    r.builtMonth?.toString() ?? "",
    r.zoning ?? "",
    r.buildingCoverageRatio?.toString() ?? "",
    r.floorAreaRatio?.toString() ?? "",
    r.canRebuild === undefined ? "" : r.canRebuild ? "可" : "不可",
    r.setback === undefined ? "" : r.setback ? "あり" : "なし",
    r.nearestStation ?? "",
    r.walkMinutes?.toString() ?? "",
    r.assumedRent ? formatManEn(r.assumedRent) : "",
    r.grossYield ? (r.grossYield * 100).toFixed(1) : "",
    p.sekisan ? formatManEn(p.sekisan.totalSekisan) : "",
    p.sekisan ? formatManEn(p.sekisan.land.totalLandValue) : "",
    p.sekisan ? formatManEn(p.sekisan.building.totalBuildingValue) : "",
    p.sekisan ? formatRatio(p.sekisan.priceToSekisanRatio) : "",
    p.sekisan ? formatRatio(p.sekisan.landValueRatio) : "",
    p.airbnb?.totalScore?.toString() ?? "",
    p.airbnb?.legalType ?? "",
    p.score?.sekisanScore?.toString() ?? "",
    p.score?.loanScore?.toString() ?? "",
    p.score?.exitScore?.toString() ?? "",
    p.score?.profitabilityScore?.toString() ?? "",
    p.score?.riskScore?.toString() ?? "",
    p.score?.totalScore?.toString() ?? "",
    p.score?.grade ?? "",
    p.status,
    p.memo,
    r.detailUrl ?? r.currentUrl ?? "",
    r.fetchedAt,
  ];
}

export function exportToTSV(properties: Property[]): string {
  const rows = [HEADERS, ...properties.map(propertyToRow)];
  return rows.map((row) => row.map((cell) => cell.replace(/\t/g, " ")).join("\t")).join("\n");
}

export function exportToCSV(properties: Property[]): string {
  const rows = [HEADERS, ...properties.map(propertyToRow)];
  return rows
    .map((row) =>
      row
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
}

export function exportToJSON(properties: Property[]): string {
  return JSON.stringify(properties, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(["﻿" + content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
