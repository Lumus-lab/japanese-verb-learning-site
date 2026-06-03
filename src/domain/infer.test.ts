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

  it("treats a blank supplied reading as missing for unknown kanji verbs", () => {
    const result = inferVerb("覆る", "   ");

    expect(result.status).toBe("unsupported");
    expect(result.message).toContain("假名");
    expect(result.candidates).toEqual([]);
  });

  it("uses a supplied reading for an unknown kanji verb", () => {
    const result = inferVerb("混ぜる", "まぜる");

    expect(result.status).toBe("heuristic");
    expect(result.candidates[0].forms.masu.reading).toBe("まぜます");
  });

  it("does not throw when the supplied godan reading tail mismatches", () => {
    let result: ReturnType<typeof inferVerb> | undefined;

    expect(() => {
      result = inferVerb("描く", "えがぐ");
    }).not.toThrow();
    expect(result?.status).toBe("unsupported");
    expect(result?.message).toBe(
      "補充的假名和辭書形字尾不一致，請確認讀音。",
    );
  });

  it("uses a compatible supplied godan reading for an unknown kanji verb", () => {
    const result = inferVerb("描く", "えがく");

    expect(result.status).toBe("heuristic");
    expect(result.candidates[0].forms.masu).toEqual({
      surface: "描きます",
      reading: "えがきます",
      status: "standard",
    });
  });

  it("does not rewrite unknown godan る verbs with くる readings to 来る", () => {
    const result = inferVerb("繰る", "くる");

    expect(result.status).toBe("heuristic");
    expect(result.candidates[0].dictionaryForm).toBe("繰る");
    expect(result.candidates[0].group).toBe("godan");
    expect(result.candidates[0].forms.masu).toEqual({
      surface: "繰ります",
      reading: "くります",
      status: "standard",
    });
  });

  it("does not let a supplied くる reading bypass tail mismatch checks", () => {
    const result = inferVerb("架空く", "くる");

    expect(result.status).toBe("unsupported");
    expect(result.message).toBe(
      "補充的假名和辭書形字尾不一致，請確認讀音。",
    );
  });

  it("keeps confirmed 来る inference irregular", () => {
    const result = inferVerb("来る", "くる");

    expect(result.status).toBe("lexicon-assisted");
    expect(result.candidates[0].group).toBe("irregular");
    expect(result.candidates[0].forms.masu.reading).toBe("きます");
  });

  it("does not throw for an incomplete supplied する reading", () => {
    let result: ReturnType<typeof inferVerb> | undefined;

    expect(() => {
      result = inferVerb("架空語する", "かくうごす");
    }).not.toThrow();
    expect(result?.status).toBe("unsupported");
  });

  it("does not treat an unmatched Chinese query as a Japanese verb", () => {
    const result = inferVerb("吃");

    expect(result.status).toBe("unsupported");
    expect(result.message).toBe("目前只能推測日文動詞的辭書形。");
  });
});
