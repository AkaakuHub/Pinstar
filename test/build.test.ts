import { describe, expect, test } from "bun:test";
import { access, readFile } from "node:fs/promises";

describe("published files", () => {
  test("browser bundle is self-contained", async () => {
    const bundle = await readFile("dist/pinstar.js", "utf8");
    expect(bundle.length).toBeGreaterThan(5_000);
    expect(bundle).toContain("Pinstar");
    expect(bundle).not.toMatch(/\bimport\s/);
  });

  test("bookmarklet uses only GitHub raw", async () => {
    const remote = await readFile("dist/bookmarklet.txt", "utf8");
    expect(remote.startsWith("javascript:")).toBe(true);
    expect(remote).toContain("raw.githubusercontent.com/AkaakuHub/Pinstar/js/pinstar.js");
    expect(remote).toContain("Pinstarを読み込んでいます");
    expect(remote).not.toContain("jsdelivr");
    expect(remote).not.toContain("bookmarklet-inline");
    await expect(access("dist/bookmarklet-inline.txt")).rejects.toThrow();
  });

  test("shortcut loader calls completion", async () => {
    const loader = await readFile("dist/shortcut-loader.js", "utf8");
    expect(loader).toContain("completion(");
    expect(loader).toContain("Pinstarの読み込みに失敗しました");
    expect(loader).not.toContain("jsdelivr");
  });
});
