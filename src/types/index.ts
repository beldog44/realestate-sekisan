export * from "./property";

export interface ParsedCandidate {
  field: keyof import("./property").RawProperty;
  value: string | number | boolean;
  confidence: "high" | "medium" | "low";
  rawText: string;
}

export interface ParseResult {
  source: import("./property").PropertySource;
  candidates: Partial<import("./property").RawProperty>;
  confidence: Record<string, "high" | "medium" | "low">;
  warnings: string[];
}

export interface ExportRow {
  [key: string]: string | number | boolean | undefined;
}
