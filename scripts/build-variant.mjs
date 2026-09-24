#!/usr/bin/env node
// Build one (variant, platform) Electron package.
// Usage: node scripts/build-variant.mjs <variant> <platform>
//   variant  : individual | student | company | school | full
//   platform : linux | darwin | win32

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";

const VARIANTS = ["individual", "student", "company", "school", "full"];
const PLATFORMS = ["linux", "darwin", "win32"];

const variant = process.argv[2];
const platform = process.argv[3] || "linux";

if (!VARIANTS.includes(variant)) {
  console.error(`Invalid variant. Use one of: ${VARIANTS.join(", ")}`);
  process.exit(1);
}
if (!PLATFORMS.includes(platform)) {
  console.error(`Invalid platform. Use one of: ${PLATFORMS.join(", ")}`);
  process.exit(1);
}

const root = process.cwd();
const outDir = path.join(root, "releases", variant, platform);
const label = variant[0].toUpperCase() + variant.slice(1);
const appName = `W2W-${label}`;

console.log(`\n▶ Building ${appName} for ${platform}...`);

// 1. Bake variant.json so Electron main reads it at runtime
mkdirSync(path.join(root, "electron"), { recursive: true });
writeFileSync(
  path.join(root, "electron", "variant.json"),
  JSON.stringify({ variant }, null, 2)
);

// 2. Vite build with variant env
execSync(`VITE_W2W_VARIANT=${variant} npx vite build`, {
  stdio: "inherit",
  env: { ...process.env, VITE_W2W_VARIANT: variant },
});

// 3. Clean out dir
if (existsSync(outDir)) rmSync(outDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

// 4. Package
const ignores = [
  "^/src",
  "^/public",
  "^/releases",
  "^/scripts",
  "^/supabase",
  "^/tests",
  "^/test-results",
  "^/\\.git",
  "^/\\.lovable",
];
const ignoreFlags = ignores.map((p) => `--ignore="${p}"`).join(" ");

execSync(
  `npx @electron/packager . "${appName}" --platform=${platform} --arch=x64 --out="${outDir}" --overwrite ${ignoreFlags}`,
  { stdio: "inherit" }
);

// 5. Archive into /mnt/documents/releases
const docsDir = "/mnt/documents/releases";
mkdirSync(docsDir, { recursive: true });
const packedDir = path.join(outDir, `${appName}-${platform}-x64`);

if (platform === "linux") {
  const tarPath = path.join(docsDir, `${appName}-linux-x64.tar.gz`);
  execSync(`tar czf "${tarPath}" -C "${outDir}" "${appName}-${platform}-x64"`, {
    stdio: "inherit",
  });
  console.log(`✓ ${tarPath}`);
} else {
  const zipPath = path.join(docsDir, `${appName}-${platform}-x64.zip`);
  execSync(
    `cd "${outDir}" && nix run nixpkgs#zip -- -r "${zipPath}" "${appName}-${platform}-x64"`,
    { stdio: "inherit", shell: "/bin/bash" }
  );
  console.log(`✓ ${zipPath}`);
}

console.log(`\n✓ Built ${appName} for ${platform}\n`);
