const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const fs = require("fs");

// Variant baked at package time (electron/variant.json) or via env at dev time
let variant = process.env.W2W_VARIANT || "full";
try {
  const f = path.join(__dirname, "variant.json");
  if (fs.existsSync(f)) variant = JSON.parse(fs.readFileSync(f, "utf-8")).variant || variant;
} catch {}

const isDev = !!process.env.W2W_DEV_URL;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#f5f7f4",
    title: `W2W — ${variant.charAt(0).toUpperCase() + variant.slice(1)} Edition`,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    win.loadURL(process.env.W2W_DEV_URL);
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
