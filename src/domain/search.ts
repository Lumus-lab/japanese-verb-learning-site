import { VERBS } from "../data/verbs";
import type { VerbEntry } from "./types";

const normalize = (value: string) => value.trim().toLocaleLowerCase("zh-Hant");

export const searchVerbs = (query: string): VerbEntry[] => {
  const normalized = normalize(query);
  if (!normalized) return [];

  return VERBS.filter((verb) => {
    if (normalize(verb.dictionaryForm).includes(normalized)) return true;
    if (normalize(verb.reading).includes(normalized)) return true;

    return verb.meanings.some((meaning) =>
      normalize(meaning).includes(normalized),
    );
  });
};
