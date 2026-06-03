import { describe, expect, it } from "vitest";

import { inferVerb } from "./infer";

describe("inferVerb", () => {
  it("uses the exception lexicon before heuristics", () => {
    const result = inferVerb("帰る");

    expect(result.status).toBe("lexicon-assisted");
    expect(result.candidates[0].group).toBe("godan");
  });

  it("keeps the warning even for lexicon-assisted results", () => {
    const result = inferVerb("行く");

    expect(result.warning).toContain("推測結果");
    expect(result.candidates[0].forms.te.surface).toBe("行って");
  });

  it("infers an unknown kana ichidan verb heuristically", () => {
    const result = inferVerb("まぜる");

    expect(result.status).toBe("heuristic");
    expect(result.candidates[0].group).toBe("ichidan");
  });

  it("returns candidates for ambiguous kana", () => {
    const result = inferVerb("きる");

    expect(result.status).toBe("ambiguous");
    expect(result.candidates.map((candidate) => candidate.dictionaryForm)).toEqual(
      expect.arrayContaining(["切る", "着る"]),
    );
  });

  it("does not guess an unknown kanji plus る without a reading", () => {
    const result = inferVerb("覆る");

    expect(result.status).toBe("unsupported");
    expect(result.message).toContain("假名");
  });

  it("uses a supplied reading for an unknown kanji verb", () => {
    const result = inferVerb("混ぜる", "まぜる");

    expect(result.status).toBe("heuristic");
    expect(result.candidates[0].forms.masu.reading).toBe("まぜます");
  });

  it("does not treat an unmatched Chinese query as a Japanese verb", () => {
    const result = inferVerb("吃");

    expect(result.status).toBe("unsupported");
    expect(result.message).toBe("目前只能推測日文動詞的辭書形。");
  });
});
