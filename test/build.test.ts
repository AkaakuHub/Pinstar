import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("published files", () => {
  test("browser bundle is self-contained", async () => {
    const bundle = await readFile("dist/pinstar.js", "utf8");
    expect(bundle.length).toBeGreaterThan(5_000);
    expect(bundle).toContain("Pinstar");
    expect(bundle).not.toMatch(/\bimport\s/);
  });

  test("remote and inline bookmarklets are generated", async () => {
    const remote = await readFile("dist/bookmarklet.txt", "utf8");
    const inline = await readFile("dist/bookmarklet-inline.txt", "utf8");
    expect(remote.startsWith("javascript:")).toBe(true);
    expect(remote).toContain("raw.githubusercontent.com/AkaakuHub/Pinstar/js/pinstar.js");
    expect(inline.startsWith("javascript:")).toBe(true);
    expect(inline.length).toBeGreaterThan(5_000);
  });

  test("shortcut loader calls completion", async () => {
    const loader = await readFile("dist/shortcut-loader.js", "utf8");
    expect(loader).toContain("completion(");
  });
});
