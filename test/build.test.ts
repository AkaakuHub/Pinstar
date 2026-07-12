import { describe, expect, test } from "bun:test";
import { readFile, readdir } from "node:fs/promises";

describe("published files", () => {
  test("browser bundle is self-contained", async () => {
    const bundle = await readFile("dist/pinstar.js", "utf8");
    expect(bundle.length).toBeGreaterThan(5_000);
    expect(bundle).toContain("Pinstar");
    expect(bundle).not.toMatch(/\bimport\s/);
  });

  test("dist contains only pinstar.js", async () => {
    expect(await readdir("dist")).toEqual(["pinstar.js"]);
  });

  test("bookmarklet is fixed on main and uses only GitHub raw", async () => {
    const bookmarklet = await readFile("bookmarklet.txt", "utf8");
    expect(bookmarklet.startsWith("javascript:")).toBe(true);
    expect(bookmarklet).toContain("raw.githubusercontent.com/AkaakuHub/Pinstar/js/pinstar.js");
    expect(bookmarklet).toContain("createPolicy(\"default\"");
    expect(bookmarklet).toContain("createScript:v=>v");
    expect(bookmarklet).not.toContain("jsdelivr");
    expect(bookmarklet).not.toContain("bookmarklet-inline");
    expect(bookmarklet).not.toContain("createElement(\"script\")");
  });
});
