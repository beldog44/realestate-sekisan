import type { ParseResult, RawProperty, BuildingStructure } from "@/types";
import { parseGeneric } from "./generic";

export function parseSuumo(document: Document, url: string): ParseResult {
  if (!url.includes("suumo.jp")) return parseGeneric(document, url);

  const candidates: Partial<RawProperty> = {
    currentUrl: url,
    source: "suumo",
    fetchedAt: new Date().toISOString(),
    detailUrl: url,
  };
  const confidence: ParseResult["confidence"] = {};
  const warnings: string[] = [];

  function getByLabel(label: string): string | null {
    const ths = document.querySelectorAll("th");
    for (const th of ths) {
      if (th.textContent?.trim() === label) {
        const td = th.nextElementSibling as HTMLElement;
        return td?.textContent?.trim() ?? null;
      }
    }
    return null;
  }

  const h1 = document.querySelector("h1.section_h1-header-title, h1");
  if (h1?.textContent) { candidates.name = h1.textContent.trim(); confidence.name = "high"; }

  const priceEl = document.querySelector(".property_view_notes-emphasis, .dottable-value");
  if (priceEl?.textContent) {
    const m = priceEl.textContent.match(/(\d[\d,]+)\s*万円/);
    if (m) { candidates.price = parseInt(m[1].replace(/,/g, "")) * 10000; confidence.price = "high"; }
  }

  const addr = getByLabel("所在地");
  if (addr) { candidates.address = addr; confidence.address = "high"; }

  const land = getByLabel("土地面積");
  if (land) {
    const m = land.match(/(\d+\.?\d*)\s*(?:㎡|m)/);
    if (m) { candidates.landArea = parseFloat(m[1]); confidence.landArea = "high"; }
  }

  const bldg = getByLabel("建物面積");
  if (bldg) {
    const m = bldg.match(/(\d+\.?\d*)\s*(?:㎡|m)/);
    if (m) { candidates.buildingArea = parseFloat(m[1]); confidence.buildingArea = "high"; }
  }

  const struct = getByLabel("構造") ?? getByLabel("建物構造");
  if (struct) {
    const map: Record<string, BuildingStructure> = {
      木造: "木造", 軽量鉄骨: "軽量鉄骨", 重量鉄骨: "重量鉄骨",
      鉄骨造: "重量鉄骨", RC: "RC", "鉄筋コン": "RC", SRC: "SRC",
    };
    for (const [k, v] of Object.entries(map)) {
      if (struct.includes(k)) { candidates.structure = v; confidence.structure = "high"; break; }
    }
  }

  const built = getByLabel("建築年月") ?? getByLabel("築年月");
  if (built) {
    const m = built.match(/(\d{4})年(\d{1,2})月/);
    if (m) {
      candidates.builtYear = parseInt(m[1]);
      candidates.builtMonth = parseInt(m[2]);
      confidence.builtYear = "high";
    }
  }

  const floorPlan = getByLabel("間取り");
  if (floorPlan) { candidates.floorPlan = floorPlan.trim(); confidence.floorPlan = "high"; }

  const station = getByLabel("交通") ?? getByLabel("最寄駅");
  if (station) {
    candidates.nearestStation = station.split(/[\/\\]/)[0].trim();
    const walkM = station.match(/徒歩(\d+)分/);
    if (walkM) candidates.walkMinutes = parseInt(walkM[1]);
    confidence.nearestStation = "high";
  }

  if (Object.keys(candidates).length < 5) warnings.push("SUUMOパーサーで取得項目が少ない");

  return { source: "suumo", candidates, confidence, warnings };
}
