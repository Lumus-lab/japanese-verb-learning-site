import { describe, expect, it } from "vitest";

import { searchVerbs } from "./search";

describe("searchVerbs", () => {
  it("finds a verb by kanji", () => {
    expect(searchVerbs("食べる")[0].id).toBe("taberu");
  });

  it("finds a verb by kana", () => {
    expect(searchVerbs("たべる")[0].id).toBe("taberu");
  });

  it("finds verbs by Traditional Chinese meaning", () => {
    expect(searchVerbs("吃").map((verb) => verb.id)).toContain("taberu");
  });

  it("returns multiple confirmed matches instead of guessing", () => {
    expect(searchVerbs("きる").map((verb) => verb.id)).toEqual(
      expect.arrayContaining(["kiru-cut", "kiru-wear"]),
    );
  });
});
