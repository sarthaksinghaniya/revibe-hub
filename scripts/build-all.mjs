#!/usr/bin/env node
// Build every desktop variant × platform.
// Run locally: node scripts/build-all.mjs
import { execSync } from "node:child_process";

const VARIANTS = ["individual", "student", "company", "school"];
const PLATFORMS = ["linux", "darwin", "win32"];

for (const v of VARIANTS) {
  for (const p of PLATFORMS) {
    console.log(`\n=== ${v} / ${p} ===`);
    try {
      execSync(`node scripts/build-variant.mjs ${v} ${p}`, { stdio: "inherit" });
    } catch (e) {
      console.error(`✗ Failed ${v}/${p}:`, e.message);
    }
  }
}

console.log("\n✓ All builds complete. Archives in /mnt/documents/releases/");
