import type { ExternalLinks } from "@/types";

export function generateExternalLinks(address: string): ExternalLinks {
  const encoded = encodeURIComponent(address);

  return {
    rosen: `https://www.rosenka.nta.go.jp/`,
    googleMaps: `https://www.google.com/maps/search/${encoded}`,
    gsi: `https://maps.gsi.go.jp/#14/${encoded}`,
    zoning: `https://yoto.mlit.go.jp/yoto/`,
    hazardMap: `https://disaportal.gsi.go.jp/hazardmap/compass/openmap.html?address=${encoded}`,
  };
}
