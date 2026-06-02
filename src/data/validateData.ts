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
    if (verb.sourceRefs.length === 0) {
      errors.push(`verb source missing: ${verb.id}`);
    }
    for (const sourceRef of verb.sourceRefs) {
      if (!Object.hasOwn(SOURCE_REFS, sourceRef)) {
        errors.push(`unknown source ref: ${verb.id}:${sourceRef}`);
      }
    }

    try {
      const forms = conjugate(verb);
      for (const { id } of FORM_DEFINITIONS) {
        if (!Object.hasOwn(forms, id)) {
          errors.push(`missing form slot: ${verb.id}:${id}`);
          continue;
        }

        const form = forms[id];
        const isInvalid =
          form.status === "not-applicable"
            ? form.surface !== null || form.reading !== null
            : (form.status !== "standard" && form.status !== "uncommon") ||
              !form.surface ||
              !form.reading;
        if (isInvalid) errors.push(`invalid form value: ${verb.id}:${id}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`conjugation error: ${verb.id}: ${message}`);
    }
  }

  for (const entry of inferenceLexicon) {
    if (entry.sourceRefs.length === 0) {
      errors.push(`inference source missing: ${entry.dictionaryForm}`);
    }
    for (const sourceRef of entry.sourceRefs) {
      if (!Object.hasOwn(SOURCE_REFS, sourceRef)) {
        errors.push(
          `unknown inference source: ${entry.dictionaryForm}:${sourceRef}`,
        );
      }
    }
  }
  return errors;
};
