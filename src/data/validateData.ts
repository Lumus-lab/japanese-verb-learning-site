import { conjugate } from "../domain/conjugate";
import type { InferenceLexiconEntry, VerbEntry } from "../domain/types";
import { FORM_DEFINITIONS } from "./forms";
import { SOURCE_REFS } from "./sourceRefs";

type ConjugatableEntry = Pick<
  VerbEntry,
  "dictionaryForm" | "reading" | "group" | "overrides"
>;

type ConjugationErrorLabels = {
  missingSlot: string;
  invalidForm: string;
  conjugation: string;
};

const VERB_CONJUGATION_ERRORS: ConjugationErrorLabels = {
  missingSlot: "missing form slot",
  invalidForm: "invalid form value",
  conjugation: "conjugation error",
};

const INFERENCE_CONJUGATION_ERRORS: ConjugationErrorLabels = {
  missingSlot: "missing inference form slot",
  invalidForm: "invalid inference form value",
  conjugation: "inference conjugation error",
};

const SUPPORTED_GROUPS = ["godan", "ichidan", "irregular"] as const;

function isSupportedGroup(group: unknown): group is VerbEntry["group"] {
  return (
    typeof group === "string" &&
    SUPPORTED_GROUPS.includes(group as (typeof SUPPORTED_GROUPS)[number])
  );
}

function validateConjugationSlots(
  entry: ConjugatableEntry,
  identifier: string,
  labels: ConjugationErrorLabels,
): string[] {
  const errors: string[] = [];

  try {
    const forms = conjugate(entry);
    for (const { id } of FORM_DEFINITIONS) {
      if (!Object.hasOwn(forms, id)) {
        errors.push(`${labels.missingSlot}: ${identifier}:${id}`);
        continue;
      }

      const form = forms[id];
      const isInvalid =
        form.status === "not-applicable"
          ? form.surface !== null || form.reading !== null
          : (form.status !== "standard" && form.status !== "uncommon") ||
            !form.surface ||
            !form.reading;
      if (isInvalid) errors.push(`${labels.invalidForm}: ${identifier}:${id}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`${labels.conjugation}: ${identifier}: ${message}`);
  }

  return errors;
}

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

    errors.push(
      ...validateConjugationSlots(verb, verb.id, VERB_CONJUGATION_ERRORS),
    );
  }

  for (const entry of inferenceLexicon) {
    const inferenceId = entry.dictionaryForm || "(missing dictionaryForm)";
    const hasRequiredFields =
      Boolean(entry.dictionaryForm) &&
      Boolean(entry.reading) &&
      Array.isArray(entry.notes);
    const sourceRefs = Array.isArray(entry.sourceRefs) ? entry.sourceRefs : [];

    if (!hasRequiredFields) {
      errors.push(`missing inference required field: ${inferenceId}`);
    }
    if (sourceRefs.length === 0) {
      errors.push(`inference source missing: ${inferenceId}`);
    }
    for (const sourceRef of sourceRefs) {
      if (!Object.hasOwn(SOURCE_REFS, sourceRef)) {
        errors.push(`unknown inference source: ${inferenceId}:${sourceRef}`);
      }
    }

    if (!isSupportedGroup(entry.group)) {
      errors.push(`invalid inference group: ${inferenceId}:${entry.group}`);
      continue;
    }

    if (hasRequiredFields) {
      errors.push(
        ...validateConjugationSlots(
          entry,
          entry.dictionaryForm,
          INFERENCE_CONJUGATION_ERRORS,
        ),
      );
    }
  }
  return errors;
};
