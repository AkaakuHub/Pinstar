import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const outdir = resolve(root, "dist");
await mkdir(outdir, { recursive: true });

const result = await Bun.build({
  entrypoints: [resolve(root, "src/index.ts")],
  outdir,
  target: "browser",
  format: "iife",
  minify: true,
  sourcemap: "none",
  naming: "pinstar.js",
});

if (!result.success) {
  for (const item of result.logs) console.error(item);
  process.exit(1);
}

const bundlePath = resolve(outdir, "pinstar.js");
const bundle = await readFile(bundlePath, "utf8");
const rawUrl = "https://raw.githubusercontent.com/AkaakuHub/Pinstar/js/pinstar.js";
const cdnUrl = "https://cdn.jsdelivr.net/gh/AkaakuHub/Pinstar@js/pinstar.js";

const loaderCore = `(async()=>{const t=Date.now(),r=${JSON.stringify(rawUrl)}+"?v="+t;try{const e=await fetch(r,{cache:"no-store",credentials:"omit"});if(!e.ok)throw new Error("HTTP "+e.status);const n=await e.text();(0,eval)(n)}catch(e){console.error("[Pinstar loader] raw/eval failed",e);await new Promise((o,a)=>{const s=document.createElement("script");s.src=${JSON.stringify(cdnUrl)}+"?v="+t;s.onload=()=>o();s.onerror=()=>a(new Error("CDN script load failed"));(document.head||document.documentElement).appendChild(s)})}})()`;
const bookmarklet = `javascript:void(${loaderCore})`;
const shortcutLoader = `${loaderCore}.then(()=>completion({ok:true,version:"latest"})).catch(e=>{alert("Pinstarの読み込みに失敗しました。\\n"+(e&&e.message?e.message:String(e)));completion({ok:false,error:String(e)})});`;
const inlineBookmarklet = `javascript:void(${bundle.trim().replace(/;$/, "")})`;

await writeFile(resolve(outdir, "bookmarklet.txt"), bookmarklet, "utf8");
await writeFile(resolve(outdir, "shortcut-loader.js"), shortcutLoader, "utf8");
await writeFile(resolve(outdir, "bookmarklet-inline.txt"), inlineBookmarklet, "utf8");
await writeFile(resolve(outdir, ".nojekyll"), "", "utf8");

const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Pinstar Installer</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#020617;color:#e2e8f0;margin:0;padding:24px}main{max-width:720px;margin:auto}section{background:#0f172a;border:1px solid #334155;border-radius:16px;padding:18px;margin:14px 0}button,a{display:inline-block;border:0;border-radius:12px;padding:12px 15px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700}code,textarea{font-family:ui-monospace,monospace}textarea{width:100%;height:150px;background:#020617;color:#cbd5e1;border:1px solid #334155;border-radius:10px;padding:10px;box-sizing:border-box}small{color:#94a3b8}</style></head>
<body><main><h1>Pinstar</h1><p>YouTubeの通常ページへカメラUIを追加するiPhone Safari向けツールです。</p>
<section><h2>ブックマークレット</h2><p>下の内容をSafariのブックマークURLへ貼り付けます。</p><button data-copy="bookmarklet">コピー</button><textarea id="bookmarklet" readonly>${bookmarklet.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</textarea></section>
<section><h2>ショートカット</h2><p>「WebページでJavaScriptを実行」アクションへ貼り付けます。</p><button data-copy="shortcut">コピー</button><textarea id="shortcut" readonly>${shortcutLoader.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</textarea></section>
<section><h2>直接ファイル</h2><p><a href="pinstar.js">pinstar.js</a> <a href="bookmarklet-inline.txt">インライン版</a></p><small>通常は自動更新されるブックマークレット版を使用します。</small></section>
</main><script>document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{const e=document.getElementById(b.dataset.copy);await navigator.clipboard.writeText(e.value);b.textContent='コピー済み'})</script></body></html>`;
await writeFile(resolve(outdir, "index.html"), html, "utf8");
console.log(`Built ${bundle.length} byte bundle`);
