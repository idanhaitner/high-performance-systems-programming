// Zips every study/content/labs/<id>/ (without solution/) into public/labs/<id>.zip.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync } from "fflate";

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, "..");
const labsDir = path.resolve(webRoot, "..", "content", "labs");
const outDir = path.join(webRoot, "public", "labs");

fs.rmSync(outDir, { recursive: true, force: true });

function collect(dir, prefix, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (prefix === "" && entry.name === "solution") continue;
    const rel = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, rel, files);
    else if (entry.isFile()) files[rel] = new Uint8Array(fs.readFileSync(full));
  }
}

let count = 0;
if (fs.existsSync(labsDir)) {
  for (const entry of fs.readdirSync(labsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const files = {};
    collect(path.join(labsDir, entry.name), "", files);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `${entry.name}.zip`), zipSync(files));
    count += 1;
  }
}
console.log(`build-labs: ${count} lab zip(s) written to public/labs`);
