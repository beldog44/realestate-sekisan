import type { ParseResult, RawProperty, BuildingStructure } from "@/types";
import { parseGeneric } from "./generic";

export function parseKenbiya(document: Document, url: string): ParseResult {
  if (!url.includes("kenbiya.com")) return parseGeneric(document, url);

  const candidates: Partial<RawProperty> = {
    currentUrl: url,
    source: "kenbiya",
    fetchedAt: new Date().toISOString(),
    detailUrl: url,
  };
  const confidence: ParseResult["confidence"] = {};
  const warnings: string[] = [];

  function getByLabel(label: string): string | null {
    const allTh = document.querySelectorAll("th, dt, .label, .item-label");
    for (const el of allTh) {
      if (el.textContent?.trim().includes(label)) {
        const next = el.nextElementSibling as HTMLElement;
        return next?.textContent?.trim() ?? null;
      }
    }
    return null;
  }

  const h1 = document.querySelector("h1, .property-name");
  if (h1?.textContent) {
    candidates.name = h1.textContent.trim();
    confidence.name = "high";
  }

  const priceEl = document.querySelector(".price, .item-price, [class*='price']");
  if (priceEl?.textContent) {
    const m = priceEl.textContent.match(/(\d[\d,]+)\s*万円/);
    if (m) {
      candidates.price = parseInt(m[1].replace(/,/g, "")) * 10000;
      confidence.price = "high";
    }
  }

  const addr = getByLabel("所在地");
  if (addr) { candidates.address = addr; confidence.address = "high"; }

  const land = getByLabel("土地面積");
  if (land) {
    const m = land.match(/(\d+\.?\d*)/);
    if (m) { candidates.landArea = parseFloat(m[1]); confidence.landArea = "high"; }
  }

  const bldg = getByLabel("建物面積") ?? getByLabel("延床面積");
  if (bldg) {
    const m = bldg.match(/(\d+\.?\d*)/);
    if (m) { candidates.buildingArea = parseFloat(m[1]); confidence.buildingArea = "high"; }
  }

  const struct = getByLabel("構造");
  if (struct) {
    const map: Record<string, BuildingStructure> = {
      木造: "木造", 軽量鉄骨: "軽量鉄骨", 重量鉄骨: "重量鉄骨", RC: "RC", SRC: "SRC",
    };
    for (const [k, v] of Object.entries(map)) {
      if (struct.includes(k)) { candidates.structure = v; confidence.structure = "high"; break; }
    }
  }

  const built = getByLabel("築年月") ?? getByLabel("建築年");
  if (built) {
    const m = built.match(/(\d{4})年(\d{1,2})月?/);
    if (m) {
      candidates.builtYear = parseInt(m[1]);
      if (m[2]) candidates.builtMonth = parseInt(m[2]);
      confidence.builtYear = "high";
    }
  }

  const yieldEl = getByLabel("表面利回り") ?? getByLabel("利回り");
  if (yieldEl) {
    const m = yieldEl.match(/(\d+\.?\d*)\s*%/);
    if (m) { candidates.grossYield = parseFloat(m[1]) / 100; confidence.grossYield = "high"; }
  }

  const rebuild = getByLabel("再建築");
  if (rebuild) { candidates.canRebuild = !rebuild.includes("不可"); confidence.canRebuild = "high"; }

  if (Object.keys(candidates).length < 5) {
    warnings.push("健美家パーサーで取得項目が少ない");
  }

  return { source: "kenbiya", candidates, confidence, warnings };
}
