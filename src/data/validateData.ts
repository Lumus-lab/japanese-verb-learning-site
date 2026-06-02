import { conjugate } from "../domain/conjugate";
import type { InferenceLexiconEntry, VerbEntry } from "../domain/types";
import { FORM_DEFINITIONS } from "./forms";
import { SOURCE_REFS } from "./sourceRefs";

export const validateData = (
  verbs: VerbEntry[],
  inferenceLexicon: InferenceLexiconEntry[],
): string[] => {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const verb of verbs) {
    if (ids.has(verb.id)) errors.push(`duplicate verb id: ${verb.id}`);
    ids.add(verb.id);
    if (!verb.dictionaryForm || !verb.reading || verb.meanings.length === 0) {
      errors.push(`missing required field: ${verb.id}`);
    }
    if (typeof verb.isException !== "boolean") {
      errors.push(`missing exception flag: ${verb.id}`);
    }
    if (verb.jlptLevelType !== "reference") {
      errors.push(`JLPT level must be reference-only: ${verb.id}`);
    }
    for (const sourceRef of verb.sourceRefs) {
      if (!(sourceRef in SOURCE_REFS)) {
        errors.push(`unknown source ref: ${verb.id}:${sourceRef}`);
      }
    }
    const forms = conjugate(verb);
    if (Object.keys(forms).length !== FORM_DEFINITIONS.length) {
      errors.push(`missing form slot: ${verb.id}`);
    }
  }

  for (const entry of inferenceLexicon) {
    if (entry.sourceRefs.length === 0) {
      errors.push(`inference source missing: ${entry.dictionaryForm}`);
    }
    for (const sourceRef of entry.sourceRefs) {
      if (!(sourceRef in SOURCE_REFS)) {
        errors.push(
          `unknown inference source: ${entry.dictionaryForm}:${sourceRef}`,
        );
      }
    }
  }
  return errors;
};
