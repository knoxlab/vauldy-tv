/**
 * Copy pdf.js UMD build into app assets for offline document viewing.
 * Run automatically via npm postinstall.
 */
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "pdfjs-dist", "build", "pdf.min.js");
const destDir = join(root, "assets", "pdfjs");
const dest = join(destDir, "pdf.min.bundle");

if (!existsSync(src)) {
  console.error("embed-pdfjs: pdfjs-dist not installed — run npm install first");
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`embed-pdfjs: copied ${src} → ${dest}`);
