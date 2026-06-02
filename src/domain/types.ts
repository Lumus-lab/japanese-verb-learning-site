export type VerbGroup = "godan" | "ichidan" | "irregular";

export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type VerbFormId =
  | "dictionary"
  | "masu"
  | "nai"
  | "te"
  | "ta"
  | "ba"
  | "tara"
  | "volitional"
  | "imperative"
  | "prohibitive"
  | "potential"
  | "passive"
  | "causative"
  | "causativePassive";

export type VerbFormStatus = "standard" | "uncommon" | "not-applicable";

export type VerbFormValue =
  | {
      surface: string;
      reading: string;
      status: Exclude<VerbFormStatus, "not-applicable">;
      note?: string;
    }
  | {
      surface: null;
      reading: null;
      status: "not-applicable";
      note?: string;
    };

export type VerbFormOverride = VerbFormValue;

export interface VerbEntry {
  id: string;
  dictionaryForm: string;
  reading: string;
  meanings: string[];
  group: VerbGroup;
  isException: boolean;
  tags: string[];
  frequencyTier: "core" | "common";
  jlptLevel: JlptLevel;
  jlptLevelType: "reference";
  notes: string[];
  sourceRefs: string[];
  overrides?: Partial<Record<VerbFormId, VerbFormOverride>>;
}

export type ConjugationTable = Record<VerbFormId, VerbFormValue>;

export interface InferenceLexiconEntry {
  dictionaryForm: string;
  reading: string;
  group: VerbGroup;
  overrides?: Partial<Record<VerbFormId, VerbFormOverride>>;
  notes: string[];
  sourceRefs: string[];
}

export type InferenceStatus =
  | "lexicon-assisted"
  | "heuristic"
  | "ambiguous"
  | "unsupported";
