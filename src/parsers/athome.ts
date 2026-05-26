import type { ParseResult, RawProperty } from "@/types";
import { parseGeneric } from "./generic";

export function parseAthome(document: Document, url: string): ParseResult {
  if (!url.includes("athome.co.jp")) return parseGeneric(document, url);

  const candidates: Partial<RawProperty> = {
    currentUrl: url,
    source: "athome",
    fetchedAt: new Date().toISOString(),
    detailUrl: url,
  };
  const confidence: ParseResult["confidence"] = {};
  const warnings: string[] = [];

  function getByLabel(label: string): string | null {
    const ths = document.querySelectorAll("th, dt");
    for (const th of ths) {
      if (th.textContent?.trim().includes(label)) {
        const next = th.nextElementSibling as HTMLElement;
        return next?.textContent?.trim() ?? null;
      }
    }
    return null;
  }

  const h1 = document.querySelector("h1");
  if (h1?.textContent) { candidates.name = h1.textContent.trim(); confidence.name = "high"; }

  const priceEl = document.querySelector("[class*='price'], .price");
  if (priceEl?.textContent) {
    const m = priceEl.textContent.match(/(\d[\d,]+)\s*万円/);
    if (m) { candidates.price = parseInt(m[1].replace(/,/g, "")) * 10000; confidence.price = "high"; }
  }

  const addr = getByLabel("所在地");
  if (addr) { candidates.address = addr; confidence.address = "high"; }

  const land = getByLabel("土地面積");
  if (land) {
    const m = land.match(/(\d+\.?\d*)/);
    if (m) { candidates.landArea = parseFloat(m[1]); confidence.landArea = "high"; }
  }

  const bldg = getByLabel("建物面積");
  if (bldg) {
    const m = bldg.match(/(\d+\.?\d*)/);
    if (m) { candidates.buildingArea = parseFloat(m[1]); confidence.buildingArea = "high"; }
  }

  if (Object.keys(candidates).length < 5) warnings.push("アットホームパーサーで取得項目が少ない");

  return { source: "athome", candidates, confidence, warnings };
}
