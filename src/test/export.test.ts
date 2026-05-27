import { describe, it, expect } from "vitest";
import { exportToTSV, exportToCSV, exportToJSON } from "@/services/export";
import type { Property } from "@/types";

const MOCK_PROPERTY: Property = {
  id: "test_001",
  raw: {
    name: "テスト物件",
    price: 30_000_000,
    address: "東京都渋谷区",
    landArea: 80,
    buildingArea: 120,
    structure: "RC",
    builtYear: 2005,
    builtMonth: 6,
    zoning: "商業地域",
    grossYield: 0.08,
    canRebuild: true,
    source: "manual",
    currentUrl: "https://example.com",
    fetchedAt: "2026-01-01T00:00:00.000Z",
  },
  status: "買付候補",
  memo: "テスト用メモ",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("exportToTSV", () => {
  it("ヘッダー行が含まれる", () => {
    const tsv = exportToTSV([MOCK_PROPERTY]);
    const lines = tsv.split("\n");
    expect(lines[0]).toContain("物件名");
    expect(lines[0]).toContain("販売価格");
  });

  it("データ行が含まれる", () => {
    const tsv = exportToTSV([MOCK_PROPERTY]);
    const lines = tsv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("テスト物件");
  });

  it("タブ区切り", () => {
    const tsv = exportToTSV([MOCK_PROPERTY]);
    const firstLine = tsv.split("\n")[0];
    expect(firstLine.split("\t").length).toBeGreaterThan(10);
  });

  it("タブ文字はスペースにエスケープ", () => {
    const propWithTab: Property = {
      ...MOCK_PROPERTY,
      raw: { ...MOCK_PROPERTY.raw, name: "物件\tタブあり" },
    };
    const tsv = exportToTSV([propWithTab]);
    expect(tsv).not.toContain("物件\tタブあり");
    expect(tsv).toContain("物件 タブあり");
  });

  it("空配列は1行（ヘッダーのみ）", () => {
    const tsv = exportToTSV([]);
    const lines = tsv.split("\n");
    expect(lines).toHaveLength(1);
  });
});

describe("exportToCSV", () => {
  it("ダブルクォートで囲まれる", () => {
    const csv = exportToCSV([MOCK_PROPERTY]);
    const firstLine = csv.split("\n")[0];
    expect(firstLine.startsWith('"')).toBe(true);
  });

  it("カンマ区切り", () => {
    const csv = exportToCSV([MOCK_PROPERTY]);
    const firstLine = csv.split("\n")[0];
    expect(firstLine.split('","').length).toBeGreaterThan(10);
  });

  it('ダブルクォートは""にエスケープ', () => {
    const propWithQuote: Property = {
      ...MOCK_PROPERTY,
      memo: '「テスト"メモ」',
    };
    const csv = exportToCSV([propWithQuote]);
    expect(csv).toContain('""');
  });
});

describe("exportToJSON", () => {
  it("有効なJSONを返す", () => {
    const json = exportToJSON([MOCK_PROPERTY]);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("物件データが含まれる", () => {
    const json = exportToJSON([MOCK_PROPERTY]);
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].id).toBe("test_001");
  });
});
