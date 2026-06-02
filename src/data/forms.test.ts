import { describe, expect, it } from "vitest";

import { FORM_DEFINITIONS } from "./forms";

describe("FORM_DEFINITIONS", () => {
  it("lists verb forms in the learning table order", () => {
    expect(FORM_DEFINITIONS.map((form) => form.id)).toEqual([
      "dictionary",
      "masu",
      "nai",
      "te",
      "ta",
      "ba",
      "tara",
      "volitional",
      "imperative",
      "prohibitive",
      "potential",
      "passive",
      "causative",
      "causativePassive",
    ]);
  });
});
