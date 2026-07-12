import { describe, expect, test } from "bun:test";
import { access, readFile, readdir } from "node:fs/promises";

const sourceFiles = [
  "src/index.ts",
  "src/app.ts",
  "src/camera.ts",
  "src/display-audio.ts",
  "src/youtube.ts",
  "src/recorder.ts",
  "src/storage.ts",
  "src/config.ts",
  "src/types.ts",
  "src/utils.ts",
  "src/ui/view.ts",
  "src/ui/styles.ts",
];

describe("Pinstar build", () => {
  test("browser bundle is self-contained", async () => {
    const bundle = await readFile("dist/pinstar.js", "utf8");
    expect(bundle.length).toBeGreaterThan(8_000);
    expect(bundle).toContain("Pinstar");
    expect(bundle).toContain("MediaRecorder");
    expect(bundle).toContain("getDisplayMedia");
    expect(bundle).toContain("navigator.share");
    expect(bundle).toContain("localStorage");
    expect(bundle).not.toContain("createMediaStreamDestination");
    expect(bundle).not.toContain("captureStream");
    expect(bundle).not.toContain("jsdelivr");
    expect(bundle).not.toMatch(/\bimport\s/);
  });

  test("dist contains only pinstar.js", async () => {
    expect(await readdir("dist")).toEqual(["pinstar.js"]);
  });

  test("source is split by responsibility", async () => {
    for (const path of sourceFiles) await access(path);
    const entry = await readFile("src/index.ts", "utf8");
    expect(entry.split("\n").length).toBeLessThan(40);
  });

  test("bookmarklet is fixed directly in README", async () => {
    const readme = await readFile("README.md", "utf8");
    expect(readme).toContain("javascript:void(async()=>");
    expect(readme).toContain("raw.githubusercontent.com/AkaakuHub/Pinstar/js/pinstar.js");
    expect(readme).toContain('createPolicy("default"');
    expect(readme).not.toContain("jsdelivr");
    await expect(access("bookmarklet.txt")).rejects.toThrow();
  });
});
