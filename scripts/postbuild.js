import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const dist = "dist";

// Copy manifest
copyFileSync("manifest.json", join(dist, "manifest.json"));
console.log("✓ manifest.json");

// Copy HTML, fix script paths
for (const [src, dest, from, to] of [
  ["sidepanel.html", "sidepanel.html", "/src/app/sidepanel.tsx", "/sidepanel.js"],
  ["popup.html", "popup.html", "/src/app/popup.tsx", "/popup.js"],
]) {
  const content = readFileSync(src, "utf-8").replace(from, to);
  writeFileSync(join(dist, dest), content);
  console.log(`✓ ${dest}`);
}

// Copy icons
try {
  mkdirSync(join(dist, "icons"), { recursive: true });
  for (const f of readdirSync("icons")) {
    copyFileSync(join("icons", f), join(dist, "icons", f));
  }
  console.log("✓ icons");
} catch {
  console.warn("icons not found, skipping");
}

console.log("postbuild done");
