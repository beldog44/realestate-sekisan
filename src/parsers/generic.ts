import type { ParseResult, RawProperty } from "@/types";

export function parseGeneric(document: Document, url: string): ParseResult {
  const text = document.body?.innerText ?? "";
  const warnings: string[] = ["汎用パーサーを使用中 - 精度が低い可能性があります"];
  const candidates: Partial<RawProperty> = {
    currentUrl: url,
    source: "generic",
    fetchedAt: new Date().toISOString(),
  };
  const confidence: ParseResult["confidence"] = {};

  // 販売価格
  const priceMatch = text.match(/(?:販売価格|売出価格|物件価格)[^\d]*(\d[\d,]+)(?:\s*万円)/);
  if (priceMatch) {
    candidates.price = parseInt(priceMatch[1].replace(/,/g, "")) * 10000;
    confidence.price = "medium";
  } else {
    const priceMatch2 = text.match(/(\d[\d,]+)\s*万円/);
    if (priceMatch2) {
      const val = parseInt(priceMatch2[1].replace(/,/g, ""));
      if (val >= 100 && val <= 100000) {
        candidates.price = val * 10000;
        confidence.price = "low";
      }
    }
  }

  // 土地面積
  const landMatch = text.match(/土地面積[^\d]*(\d+\.?\d*)\s*(?:㎡|m²|m2)/);
  if (landMatch) {
    candidates.landArea = parseFloat(landMatch[1]);
    confidence.landArea = "medium";
  }

  // 建物面積
  const buildMatch = text.match(/建物面積[^\d]*(\d+\.?\d*)\s*(?:㎡|m²|m2)/);
  if (buildMatch) {
    candidates.buildingArea = parseFloat(buildMatch[1]);
    confidence.buildingArea = "medium";
  }

  // 住所
  const addressMatch = text.match(/所在地[^\n]*\n?([^\n]{5,40})/);
  if (addressMatch) {
    candidates.address = addressMatch[1].trim();
    confidence.address = "low";
  }

  return { source: "generic", candidates, confidence, warnings };
}
