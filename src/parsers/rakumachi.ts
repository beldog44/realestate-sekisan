import type { ParseResult, RawProperty, BuildingStructure, Zoning } from "@/types";
import { parseGeneric } from "./generic";

export function parseRakumachi(document: Document, url: string): ParseResult {
  if (!url.includes("rakumachi.jp")) return parseGeneric(document, url);

  const candidates: Partial<RawProperty> = {
    currentUrl: url,
    source: "rakumachi",
    fetchedAt: new Date().toISOString(),
    detailUrl: url,
  };
  const confidence: ParseResult["confidence"] = {};
  const warnings: string[] = [];

  function getTableValue(label: string): string | null {
    const ths = document.querySelectorAll("th");
    for (const th of ths) {
      if (th.textContent?.includes(label)) {
        const td = th.nextElementSibling as HTMLElement;
        return td?.textContent?.trim() ?? null;
      }
    }
    const dts = document.querySelectorAll("dt");
    for (const dt of dts) {
      if (dt.textContent?.includes(label)) {
        const dd = dt.nextElementSibling as HTMLElement;
        return dd?.textContent?.trim() ?? null;
      }
    }
    return null;
  }

  // 物件名
  const h1 = document.querySelector("h1");
  if (h1?.textContent) {
    candidates.name = h1.textContent.trim();
    confidence.name = "high";
  }

  // 販売価格
  const priceEl = document.querySelector(".price, .selling-price, [class*='price']");
  if (priceEl?.textContent) {
    const m = priceEl.textContent.match(/(\d[\d,]+)\s*万円/);
    if (m) {
      candidates.price = parseInt(m[1].replace(/,/g, "")) * 10000;
      confidence.price = "high";
    }
  }

  // 所在地
  const addr = getTableValue("所在地");
  if (addr) {
    candidates.address = addr;
    confidence.address = "high";
  }

  // 土地面積
  const land = getTableValue("土地面積");
  if (land) {
    const m = land.match(/(\d+\.?\d*)\s*(?:㎡|m²)/);
    if (m) {
      candidates.landArea = parseFloat(m[1]);
      confidence.landArea = "high";
    }
  }

  // 建物面積
  const building = getTableValue("建物面積") ?? getTableValue("延床面積");
  if (building) {
    const m = building.match(/(\d+\.?\d*)\s*(?:㎡|m²)/);
    if (m) {
      candidates.buildingArea = parseFloat(m[1]);
      confidence.buildingArea = "high";
    }
  }

  // 構造
  const struct = getTableValue("構造");
  if (struct) {
    const structMap: Record<string, BuildingStructure> = {
      木造: "木造", 軽量鉄骨: "軽量鉄骨", 重量鉄骨: "重量鉄骨",
      鉄骨造: "重量鉄骨", RC: "RC", SRC: "SRC",
    };
    for (const [k, v] of Object.entries(structMap)) {
      if (struct.includes(k)) {
        candidates.structure = v;
        confidence.structure = "high";
        break;
      }
    }
  }

  // 築年月
  const built = getTableValue("築年月") ?? getTableValue("建築年月");
  if (built) {
    const m = built.match(/(\d{4})年(\d{1,2})月/);
    if (m) {
      candidates.builtYear = parseInt(m[1]);
      candidates.builtMonth = parseInt(m[2]);
      confidence.builtYear = "high";
    }
  }

  // 用途地域
  const zoning = getTableValue("用途地域");
  if (zoning) {
    candidates.zoning = zoning as Zoning;
    confidence.zoning = "medium";
  }

  // 建ぺい率
  const coverage = getTableValue("建ぺい率");
  if (coverage) {
    const m = coverage.match(/(\d+)\s*%/);
    if (m) {
      candidates.buildingCoverageRatio = parseInt(m[1]);
      confidence.buildingCoverageRatio = "high";
    }
  }

  // 容積率
  const far = getTableValue("容積率");
  if (far) {
    const m = far.match(/(\d+)\s*%/);
    if (m) {
      candidates.floorAreaRatio = parseInt(m[1]);
      confidence.floorAreaRatio = "high";
    }
  }

  // 再建築
  const rebuild = getTableValue("再建築");
  if (rebuild) {
    candidates.canRebuild = !rebuild.includes("不可");
    confidence.canRebuild = "high";
  }

  // 想定賃料
  const rent = getTableValue("想定賃料") ?? getTableValue("賃料");
  if (rent) {
    const m = rent.match(/(\d+\.?\d*)\s*万円/);
    if (m) {
      candidates.assumedRent = parseFloat(m[1]) * 10000;
      confidence.assumedRent = "medium";
    }
  }

  // 利回り
  const yield_ = getTableValue("表面利回り") ?? getTableValue("利回り");
  if (yield_) {
    const m = yield_.match(/(\d+\.?\d*)\s*%/);
    if (m) {
      candidates.grossYield = parseFloat(m[1]) / 100;
      confidence.grossYield = "high";
    }
  }

  // 最寄駅
  const station = getTableValue("最寄駅") ?? getTableValue("交通");
  if (station) {
    candidates.nearestStation = station.split(/[\/\\|]/)[0].trim();
    const walkM = station.match(/徒歩(\d+)分/);
    if (walkM) candidates.walkMinutes = parseInt(walkM[1]);
    confidence.nearestStation = "high";
  }

  if (Object.keys(candidates).length < 5) {
    warnings.push("楽待パーサーで取得項目が少ない - ページ構造が変わった可能性あり");
  }

  return { source: "rakumachi", candidates, confidence, warnings };
}
