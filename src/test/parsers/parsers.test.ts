import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  detectSiteAndParse,
  parseRakumachi,
  parseKenbiya,
  parseSuumo,
  parseAthome,
  parseHomes,
  parseGeneric,
} from "@/parsers";

const FIXTURE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "fixtures");

/**
 * 各サイトの実ページ構造を模した HTML フィクスチャに対して
 * パーサーの抽出結果を固定値で検証する「回帰テスト」。
 *
 * サイト側の DOM 変更でパーサーが静かに壊れる事故を検知するのが目的。
 * 実ページが変わったら fixtures/*.html と本ファイルの期待値を更新すること。
 */

function loadDoc(fixture: string): Document {
  const html = readFileSync(resolve(FIXTURE_DIR, fixture), "utf-8");
  return new DOMParser().parseFromString(html, "text/html");
}

describe("parseRakumachi (楽待)", () => {
  const url = "https://www.rakumachi.jp/property/12345";
  const result = parseRakumachi(loadDoc("rakumachi.html"), url);

  it("サイト判定が rakumachi になる", () => {
    expect(result.source).toBe("rakumachi");
  });

  it("主要項目を正しく抽出する", () => {
    expect(result.candidates).toMatchObject({
      name: "経堂サンライズマンション",
      price: 49_800_000,
      address: "東京都世田谷区経堂1-2-3",
      landArea: 120.5,
      buildingArea: 200.3,
      structure: "RC",
      builtYear: 1995,
      builtMonth: 3,
      zoning: "第一種住居地域",
      buildingCoverageRatio: 60,
      floorAreaRatio: 200,
      canRebuild: true,
      assumedRent: 350_000,
      walkMinutes: 8,
    });
    expect(result.candidates.grossYield).toBeCloseTo(0.084, 5);
    expect(result.candidates.nearestStation).toContain("経堂駅");
  });

  it("項目が十分に取れているため警告を出さない", () => {
    expect(result.warnings).toHaveLength(0);
  });

  it("detectSiteAndParse 経由でも同じ結果になる", () => {
    const viaDetect = detectSiteAndParse(loadDoc("rakumachi.html"), url);
    expect(viaDetect.source).toBe("rakumachi");
    expect(viaDetect.candidates.price).toBe(49_800_000);
  });
});

describe("parseKenbiya (健美家)", () => {
  const url = "https://www.kenbiya.com/buy/ar/67890";
  const result = parseKenbiya(loadDoc("kenbiya.html"), url);

  it("主要項目を正しく抽出する", () => {
    expect(result.candidates).toMatchObject({
      source: "kenbiya",
      name: "梅田レジデンス一棟",
      price: 35_000_000,
      address: "大阪府大阪市北区梅田1-1",
      landArea: 90.12,
      buildingArea: 150.5,
      structure: "重量鉄骨",
      builtYear: 2001,
      builtMonth: 6,
      canRebuild: true,
    });
    expect(result.candidates.grossYield).toBeCloseTo(0.072, 5);
  });

  it("警告を出さない", () => {
    expect(result.warnings).toHaveLength(0);
  });
});

describe("parseSuumo (SUUMO)", () => {
  const url = "https://suumo.jp/ms/chuko/detail/abc123/";
  const result = parseSuumo(loadDoc("suumo.html"), url);

  it("th 完全一致ラベルから主要項目を抽出する", () => {
    expect(result.candidates).toMatchObject({
      source: "suumo",
      name: "横浜中古一戸建て",
      price: 29_800_000,
      address: "神奈川県横浜市西区みなとみらい1-1",
      landArea: 110.25,
      buildingArea: 95.5,
      structure: "木造",
      builtYear: 2010,
      builtMonth: 4,
      floorPlan: "4LDK",
      walkMinutes: 12,
    });
    expect(result.candidates.nearestStation).toContain("横浜駅");
  });

  it("警告を出さない", () => {
    expect(result.warnings).toHaveLength(0);
  });
});

describe("parseAthome (アットホーム)", () => {
  const result = parseAthome(loadDoc("athome.html"), "https://www.athome.co.jp/kodate/1234567890/");

  it("dt/dd ラベルから主要項目を抽出する", () => {
    expect(result.candidates).toMatchObject({
      source: "athome",
      name: "船橋アパート一棟",
      price: 19_800_000,
      address: "千葉県船橋市本町2-3-4",
      landArea: 80,
      buildingArea: 70.5,
    });
  });

  it("警告を出さない", () => {
    expect(result.warnings).toHaveLength(0);
  });
});

describe("parseHomes (LIFULL HOME'S)", () => {
  const result = parseHomes(loadDoc("homes.html"), "https://www.homes.co.jp/mansion/b-1234/");

  it(".priceLabel と th ラベルから主要項目を抽出する", () => {
    expect(result.candidates).toMatchObject({
      source: "homes",
      name: "名古屋中古マンション",
      price: 24_800_000,
      address: "愛知県名古屋市中区栄3-4-5",
      landArea: 65.8,
      buildingArea: 55.2,
    });
  });

  it("警告を出さない", () => {
    expect(result.warnings).toHaveLength(0);
  });
});

describe("parseGeneric (汎用フォールバック)", () => {
  const result = parseGeneric(loadDoc("generic.html"), "https://example.com/listing/1");

  it("innerText のテキストマッチで数値・住所を抽出する", () => {
    expect(result.candidates).toMatchObject({
      source: "generic",
      price: 50_000_000,
      landArea: 150.5,
      buildingArea: 120.0,
      address: "東京都港区芝公園4-2-8",
    });
  });

  it("精度が低い旨の警告を必ず出す", () => {
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe("detectSiteAndParse のサイト振り分け", () => {
  it("未対応 URL は generic にフォールバックする", () => {
    const result = detectSiteAndParse(loadDoc("generic.html"), "https://example.com/listing/1");
    expect(result.source).toBe("generic");
  });

  it.each([
    ["rakumachi.html", "https://www.rakumachi.jp/x", "rakumachi"],
    ["kenbiya.html", "https://www.kenbiya.com/x", "kenbiya"],
    ["suumo.html", "https://suumo.jp/x", "suumo"],
    ["athome.html", "https://www.athome.co.jp/x", "athome"],
    ["homes.html", "https://www.homes.co.jp/x", "homes"],
  ])("%s + %s → %s パーサー", (fixture, url, source) => {
    expect(detectSiteAndParse(loadDoc(fixture), url).source).toBe(source);
  });
});
