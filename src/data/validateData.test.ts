import { describe, expect, it } from "vitest";

import { INFERENCE_LEXICON } from "./inferenceLexicon";
import { VERBS } from "./verbs";
import { validateData } from "./validateData";

describe("validateData", () => {
  it("accepts the curated application data", () => {
    expect(validateData(VERBS, INFERENCE_LEXICON)).toEqual([]);
  });

  it("contains exactly 100 confirmed verbs", () => {
    expect(VERBS).toHaveLength(100);
  });

  it("covers all three groups and every godan ending", () => {
    expect(new Set(VERBS.map((verb) => verb.group))).toEqual(
      new Set(["godan", "ichidan", "irregular"]),
    );
    expect(
      new Set(
        VERBS.filter((verb) => verb.group === "godan").map((verb) =>
          verb.reading.slice(-1),
        ),
      ),
    ).toEqual(new Set(["う", "く", "ぐ", "す", "つ", "ぬ", "ぶ", "む", "る"]));
  });
});
