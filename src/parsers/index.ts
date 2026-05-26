import type { ParseResult } from "@/types";
import { parseRakumachi } from "./rakumachi";
import { parseKenbiya } from "./kenbiya";
import { parseSuumo } from "./suumo";
import { parseAthome } from "./athome";
import { parseHomes } from "./homes";
import { parseGeneric } from "./generic";

export function detectSiteAndParse(document: Document, url: string): ParseResult {
  if (url.includes("rakumachi.jp")) return parseRakumachi(document, url);
  if (url.includes("kenbiya.com")) return parseKenbiya(document, url);
  if (url.includes("suumo.jp")) return parseSuumo(document, url);
  if (url.includes("athome.co.jp")) return parseAthome(document, url);
  if (url.includes("homes.co.jp")) return parseHomes(document, url);
  return parseGeneric(document, url);
}

export { parseRakumachi, parseKenbiya, parseSuumo, parseAthome, parseHomes, parseGeneric };
