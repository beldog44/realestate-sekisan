export * from "./buildingUnitPrices";
export * from "./usefulLife";
export * from "./corrections";

export const APP_VERSION = "0.1.0";

export const STORAGE_KEYS = {
  PROPERTIES: "sekisan_properties",
  SETTINGS: "sekisan_settings",
  LAST_SYNC: "sekisan_last_sync",
} as const;

export const ZONING_AIRBNB_RESTRICTION: Record<string, "可" | "条件付き" | "不可"> = {
  第一種低層住居専用地域: "不可",
  第二種低層住居専用地域: "不可",
  第一種中高層住居専用地域: "条件付き",
  第二種中高層住居専用地域: "条件付き",
  第一種住居地域: "条件付き",
  第二種住居地域: "条件付き",
  準住居地域: "可",
  田園住居地域: "不可",
  近隣商業地域: "可",
  商業地域: "可",
  準工業地域: "可",
  工業地域: "条件付き",
  工業専用地域: "不可",
  市街化調整区域: "不可",
  不明: "条件付き",
};
