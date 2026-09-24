const { contextBridge } = require("electron");
const path = require("path");
const fs = require("fs");

let variant = process.env.W2W_VARIANT || "full";
try {
  const f = path.join(__dirname, "variant.json");
  if (fs.existsSync(f)) variant = JSON.parse(fs.readFileSync(f, "utf-8")).variant || variant;
} catch {}

contextBridge.exposeInMainWorld("w2w", {
  variant,
  platform: process.platform,
  isElectron: true,
  appVersion: process.env.npm_package_version || "0.0.0",
});
