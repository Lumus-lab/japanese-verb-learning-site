# Japanese Verb Core And Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the tested static-site foundation, 14-form conjugation engine, traceable 100-verb dataset, exception-assisted inference engine, and Chinese/Japanese search.

**Architecture:** Use React + Vite + TypeScript with framework-independent domain modules. Store curated verbs and inference-only exceptions separately so confirmed dictionary results, assisted inference, and heuristics remain visibly distinct. Generate forms from rules, then apply explicit overrides for irregular, uncommon, or non-applicable forms.

**Tech Stack:** React, Vite, TypeScript, Vitest, Testing Library, plain CSS

---

## Scope

This is phase 1 of 2. It creates a testable foundation and a minimal browser shell. The polished guide, dictionary browsing UI, lookup page, practice UI, responsive styling, README, and Cloudflare Pages preparation are covered in `docs/superpowers/plans/2026-06-02-japanese-verb-site-ui.md`.

## File Map

```text
package.json                         # scripts and dependency manifest
tsconfig.json                        # TypeScript project references
tsconfig.app.json                    # browser TypeScript settings
tsconfig.node.json                   # Vite TypeScript settings
vite.config.ts                       # Vite and Vitest configuration
index.html                           # Vite HTML entry
.gitignore                           # generated files
src/main.tsx                         # React entry point
src/App.tsx                          # minimal phase-1 shell
src/styles.css                       # minimal shared styling
src/test/setup.ts                    # jest-dom registration
src/domain/types.ts                  # shared domain contracts
src/domain/conjugate.ts              # 14-form rule engine
src/domain/conjugate.test.ts         # rule-engine tests
src/domain/infer.ts                  # exception-assisted inference
src/domain/infer.test.ts             # inference tests
src/domain/search.ts                 # Japanese and Traditional Chinese search
src/domain/search.test.ts            # search tests
src/data/forms.ts                    # form metadata
src/data/forms.test.ts               # form metadata tests
src/data/sourceRefs.ts               # traceable source registry
src/data/verbs.ts                    # 100 curated confirmed verbs
src/data/inferenceLexicon.ts         # inference-only common exceptions
src/data/validateData.ts             # dataset validation
src/data/validateData.test.ts        # dataset validation tests
docs/reference/original-prototype.tsx # archived initial UI prototype
日文動詞變化規則總整理.md               # original learning notes
```

## Task 1: Scaffold The Vite Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Create the dependency manifest**

```json
{
  "name": "japanese-verb-learning-site",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint:data": "vitest run src/data/validateData.test.ts"
  }
}
```

- [ ] **Step 2: Install runtime and test dependencies**

Run:

```bash
npm install react react-dom lucide-react
npm install --save-dev typescript vite @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @types/react @types/react-dom
```

Expected: `package-lock.json` is created and both commands exit `0`.

- [ ] **Step 3: Create Vite and TypeScript configuration**

```ts
// vite.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
```

```json
// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

```json
// tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create the minimal React shell and its failing test**

```ts
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
```

```tsx
// src/App.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("identifies the learning site", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "日文動詞全解析系統" })).toBeInTheDocument();
    expect(screen.getByText("規則、查詢與練習都從同一套已核對資料出發。")).toBeInTheDocument();
  });
});
```

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because `src/App.tsx` does not exist.

- [ ] **Step 5: Add the minimal implementation**

```html
<!-- index.html -->
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="以繁體中文整理日文動詞分類、變化、查詢與練習。" />
    <title>日文動詞全解析系統</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

```tsx
// src/App.tsx
export default function App() {
  return (
    <main className="app-shell">
      <h1>日文動詞全解析系統</h1>
      <p>規則、查詢與練習都從同一套已核對資料出發。</p>
    </main>
  );
}
```

```css
/* src/styles.css */
:root {
  color: #1e293b;
  background: #f8fafc;
  font-family: Inter, "Noto Sans TC", "Noto Sans JP", system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.app-shell {
  margin: 0 auto;
  max-width: 72rem;
  padding: 3rem 1.5rem;
}
```

```gitignore
# .gitignore
node_modules/
dist/
.DS_Store
coverage/
```

- [ ] **Step 6: Run tests and build**

Run:

```bash
npm test -- src/App.test.tsx
npm run build
```

Expected: both commands exit `0`.

- [ ] **Step 7: Commit the scaffold**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html .gitignore src
git commit -m "chore: scaffold Japanese verb learning site"
```

## Task 2: Define Domain Contracts And Form Metadata

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/data/forms.ts`
- Create: `src/data/forms.test.ts`

- [ ] **Step 1: Write the failing metadata test**

```ts
// src/data/forms.test.ts
import { describe, expect, it } from "vitest";
import { FORM_DEFINITIONS } from "./forms";

describe("FORM_DEFINITIONS", () => {
  it("lists the 14 practical forms in display order", () => {
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
```

Run:

```bash
npm test -- src/data/forms.test.ts
```

Expected: FAIL because `src/data/forms.ts` does not exist.

- [ ] **Step 2: Create the domain contracts**

```ts
// src/domain/types.ts
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

export type VerbFormValue = {
  surface: string | null;
  reading: string | null;
  status: VerbFormStatus;
  note?: string;
};

export type VerbFormOverride = VerbFormValue;

export type VerbEntry = {
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
};

export type ConjugationTable = Record<VerbFormId, VerbFormValue>;

export type InferenceLexiconEntry = {
  dictionaryForm: string;
  reading: string;
  group: VerbGroup;
  overrides?: Partial<Record<VerbFormId, VerbFormOverride>>;
  notes: string[];
  sourceRefs: string[];
};

export type InferenceStatus =
  | "lexicon-assisted"
  | "heuristic"
  | "ambiguous"
  | "unsupported";
```

- [ ] **Step 3: Add form metadata**

```ts
// src/data/forms.ts
import type { VerbFormId } from "../domain/types";

export type FormDefinition = {
  id: VerbFormId;
  label: string;
  description: string;
};

export const FORM_DEFINITIONS: FormDefinition[] = [
  { id: "dictionary", label: "辭書形", description: "字典中的基本形式" },
  { id: "masu", label: "ます形", description: "禮貌地敘述動作" },
  { id: "nai", label: "ない形", description: "表示否定" },
  { id: "te", label: "て形", description: "連接句子、請求或進行式" },
  { id: "ta", label: "た形", description: "表示過去或完成" },
  { id: "ba", label: "ば形", description: "表示條件" },
  { id: "tara", label: "たら形", description: "表示條件或事情完成後" },
  { id: "volitional", label: "意向形", description: "表示提議或意志" },
  { id: "imperative", label: "命令形", description: "直接命令，語氣較強" },
  { id: "prohibitive", label: "禁止形", description: "表示禁止做某事" },
  { id: "potential", label: "可能形", description: "表示能夠做某事" },
  { id: "passive", label: "被動形", description: "表示被動或受影響" },
  { id: "causative", label: "使役形", description: "表示使某人做某事" },
  { id: "causativePassive", label: "使役被動形", description: "表示被迫做某事" },
];
```

- [ ] **Step 4: Run the metadata test**

Run:

```bash
npm test -- src/data/forms.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit domain contracts**

```bash
git add src/domain/types.ts src/data/forms.ts src/data/forms.test.ts
git commit -m "feat: define verb domain contracts"
```

## Task 3: Implement The 14-Form Conjugation Engine

**Files:**
- Create: `src/domain/conjugate.ts`
- Create: `src/domain/conjugate.test.ts`

- [ ] **Step 1: Write failing tests for regular and irregular verbs**

```ts
// src/domain/conjugate.test.ts
import { describe, expect, it } from "vitest";
import { conjugate } from "./conjugate";
import type { VerbEntry } from "./types";

const entry = (
  dictionaryForm: string,
  reading: string,
  group: VerbEntry["group"],
  overrides?: VerbEntry["overrides"],
): VerbEntry => ({
  id: reading,
  dictionaryForm,
  reading,
  group,
  meanings: ["測試"],
  tags: ["test"],
  isException: false,
  frequencyTier: "core",
  jlptLevel: "N5",
  jlptLevelType: "reference",
  notes: [],
  sourceRefs: ["test"],
  overrides,
});

describe("conjugate", () => {
  it("generates all 14 godan forms", () => {
    const forms = conjugate(entry("書く", "かく", "godan"));
    expect(forms.masu.surface).toBe("書きます");
    expect(forms.nai.surface).toBe("書かない");
    expect(forms.te.surface).toBe("書いて");
    expect(forms.ta.surface).toBe("書いた");
    expect(forms.potential.surface).toBe("書ける");
    expect(forms.causativePassive.surface).toBe("書かせられる");
  });

  it("uses わ for godan verbs ending in う", () => {
    const forms = conjugate(entry("買う", "かう", "godan"));
    expect(forms.nai.surface).toBe("買わない");
    expect(forms.passive.surface).toBe("買われる");
  });

  it("generates ichidan forms", () => {
    const forms = conjugate(entry("食べる", "たべる", "ichidan"));
    expect(forms.masu.surface).toBe("食べます");
    expect(forms.ba.surface).toBe("食べれば");
    expect(forms.potential.surface).toBe("食べられる");
    expect(forms.causativePassive.surface).toBe("食べさせられる");
  });

  it("generates する and 来る forms", () => {
    expect(conjugate(entry("勉強する", "べんきょうする", "irregular")).potential.surface).toBe("勉強できる");
    expect(conjugate(entry("来る", "くる", "irregular")).nai.reading).toBe("こない");
    expect(conjugate(entry("来る", "くる", "irregular")).imperative.reading).toBe("こい");
  });

  it("applies explicit overrides after regular generation", () => {
    const forms = conjugate(
      entry("行く", "いく", "godan", {
        te: { surface: "行って", reading: "いって", status: "standard" },
        ta: { surface: "行った", reading: "いった", status: "standard" },
      }),
    );
    expect(forms.te.surface).toBe("行って");
    expect(forms.ta.surface).toBe("行った");
  });

  it("keeps a visible slot for a non-applicable form", () => {
    const forms = conjugate(
      entry("ある", "ある", "godan", {
        nai: { surface: "ない", reading: "ない", status: "standard" },
        potential: {
          surface: null,
          reading: null,
          status: "not-applicable",
          note: "存在を表す「ある」の可能形は通常使用しません。",
        },
      }),
    );
    expect(forms.nai.surface).toBe("ない");
    expect(forms.potential.status).toBe("not-applicable");
  });
});
```

Run:

```bash
npm test -- src/domain/conjugate.test.ts
```

Expected: FAIL because `src/domain/conjugate.ts` does not exist.

- [ ] **Step 2: Implement rule generation and override application**

Create `src/domain/conjugate.ts` with these exported contracts and rule tables:

```ts
import { FORM_DEFINITIONS } from "../data/forms";
import type {
  ConjugationTable,
  VerbEntry,
  VerbFormId,
  VerbFormValue,
} from "./types";

const GODAN_ROWS = {
  "う": { a: "わ", i: "い", e: "え", o: "お", te: "って", ta: "った" },
  "く": { a: "か", i: "き", e: "け", o: "こ", te: "いて", ta: "いた" },
  "ぐ": { a: "が", i: "ぎ", e: "げ", o: "ご", te: "いで", ta: "いだ" },
  "す": { a: "さ", i: "し", e: "せ", o: "そ", te: "して", ta: "した" },
  "つ": { a: "た", i: "ち", e: "て", o: "と", te: "って", ta: "った" },
  "ぬ": { a: "な", i: "に", e: "ね", o: "の", te: "んで", ta: "んだ" },
  "ぶ": { a: "ば", i: "び", e: "べ", o: "ぼ", te: "んで", ta: "んだ" },
  "む": { a: "ま", i: "み", e: "め", o: "も", te: "んで", ta: "んだ" },
  "る": { a: "ら", i: "り", e: "れ", o: "ろ", te: "って", ta: "った" },
} as const;

type GodanTail = keyof typeof GODAN_ROWS;

const standard = (surface: string, reading: string): VerbFormValue => ({
  surface,
  reading,
  status: "standard",
});

const splitTail = (value: string) => ({
  stem: value.slice(0, -1),
  tail: value.slice(-1) as GodanTail,
});

const godan = (surface: string, reading: string): ConjugationTable => {
  const word = splitTail(surface);
  const kana = splitTail(reading);
  const row = GODAN_ROWS[kana.tail];
  if (!row) throw new Error(`Unsupported godan tail: ${kana.tail}`);
  const pair = (ending: string) => standard(word.stem + ending, kana.stem + ending);
  const pairRows = (surfaceEnding: string, readingEnding = surfaceEnding) =>
    standard(word.stem + surfaceEnding, kana.stem + readingEnding);

  return {
    dictionary: standard(surface, reading),
    masu: pair(row.i + "ます"),
    nai: pair(row.a + "ない"),
    te: pairRows(row.te),
    ta: pairRows(row.ta),
    ba: pair(row.e + "ば"),
    tara: pairRows(row.ta + "ら"),
    volitional: pair(row.o + "う"),
    imperative: pair(row.e),
    prohibitive: standard(surface + "な", reading + "な"),
    potential: pair(row.e + "る"),
    passive: pair(row.a + "れる"),
    causative: pair(row.a + "せる"),
    causativePassive: pair(row.a + "せられる"),
  };
};

const ichidan = (surface: string, reading: string): ConjugationTable => {
  const stem = surface.slice(0, -1);
  const kana = reading.slice(0, -1);
  const pair = (ending: string) => standard(stem + ending, kana + ending);
  return {
    dictionary: standard(surface, reading),
    masu: pair("ます"),
    nai: pair("ない"),
    te: pair("て"),
    ta: pair("た"),
    ba: pair("れば"),
    tara: pair("たら"),
    volitional: pair("よう"),
    imperative: pair("ろ"),
    prohibitive: standard(surface + "な", reading + "な"),
    potential: pair("られる"),
    passive: pair("られる"),
    causative: pair("させる"),
    causativePassive: pair("させられる"),
  };
};

const suru = (surface: string, reading: string): ConjugationTable => {
  const stem = surface.slice(0, -"する".length);
  const kana = reading.slice(0, -"する".length);
  const pair = (ending: string) => standard(stem + ending, kana + ending);
  return {
    dictionary: standard(surface, reading),
    masu: pair("します"),
    nai: pair("しない"),
    te: pair("して"),
    ta: pair("した"),
    ba: pair("すれば"),
    tara: pair("したら"),
    volitional: pair("しよう"),
    imperative: pair("しろ"),
    prohibitive: pair("するな"),
    potential: pair("できる"),
    passive: pair("される"),
    causative: pair("させる"),
    causativePassive: pair("させられる"),
  };
};

const kuru = (): ConjugationTable => ({
  dictionary: standard("来る", "くる"),
  masu: standard("来ます", "きます"),
  nai: standard("来ない", "こない"),
  te: standard("来て", "きて"),
  ta: standard("来た", "きた"),
  ba: standard("来れば", "くれば"),
  tara: standard("来たら", "きたら"),
  volitional: standard("来よう", "こよう"),
  imperative: standard("来い", "こい"),
  prohibitive: standard("来るな", "くるな"),
  potential: standard("来られる", "こられる"),
  passive: standard("来られる", "こられる"),
  causative: standard("来させる", "こさせる"),
  causativePassive: standard("来させられる", "こさせられる"),
});

export const conjugate = (verb: Pick<VerbEntry, "dictionaryForm" | "reading" | "group" | "overrides">): ConjugationTable => {
  const forms =
    verb.group === "godan"
      ? godan(verb.dictionaryForm, verb.reading)
      : verb.group === "ichidan"
        ? ichidan(verb.dictionaryForm, verb.reading)
        : verb.reading === "くる"
          ? kuru()
          : suru(verb.dictionaryForm, verb.reading);

  for (const form of FORM_DEFINITIONS) {
    const override = verb.overrides?.[form.id as VerbFormId];
    if (override) forms[form.id] = override;
  }
  return forms;
};
```

- [ ] **Step 3: Run engine tests**

Run:

```bash
npm test -- src/domain/conjugate.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit the rule engine**

```bash
git add src/domain/conjugate.ts src/domain/conjugate.test.ts
git commit -m "feat: add tested Japanese verb conjugator"
```

## Task 4: Add Traceable Sources And The 100-Verb Dataset

**Files:**
- Create: `src/data/sourceRefs.ts`
- Create: `src/data/verbs.ts`
- Create: `src/data/validateData.ts`
- Create: `src/data/validateData.test.ts`

- [ ] **Step 1: Add the source registry**

```ts
// src/data/sourceRefs.ts
export const SOURCE_REFS = {
  "irodori-about": {
    label: "IRODORI: Japanese for Life in Japan",
    url: "https://www.irodori.jpf.go.jp/en/about.html",
  },
  "marugoto-a1": {
    label: "Marugoto Starter (A1) Rikai vocabulary index",
    url: "https://marugoto.jpf.go.jp/en/teacher/resource/starter_c/",
  },
  "marugoto-a2-1": {
    label: "Marugoto Elementary 1 (A2) Rikai vocabulary index",
    url: "https://marugoto.jpf.go.jp/en/teacher/resource/elementary1_c/",
  },
  "marugoto-a2-2": {
    label: "Marugoto Elementary 2 (A2) Rikai vocabulary index",
    url: "https://marugoto.jpf.go.jp/en/teacher/resource/elementary2_c/",
  },
  bccwj: {
    label: "NINJAL BCCWJ Word List",
    url: "https://clrd.ninjal.ac.jp/bccwj/en/freq-list.html",
  },
  "jlpt-guide": {
    label: "JLPT N1-N5 level summary",
    url: "https://www.jlpt.jp/tw/about/levelsummary.html",
  },
  "jpf-conjugation": {
    label: "The Japan Foundation: 動詞の活用 (1)",
    url: "https://www.kyozai.jpf.go.jp/kyozai/material/BTS00014/ja/render.do",
  },
  "jpf-te-form": {
    label: "The Japan Foundation: て形與常見例外",
    url: "https://ba.jpf.go.jp/wp-content/uploads/2022/03/Akiko3_bunpoo382002.pdf",
  },
  "jpf-honorific": {
    label: "The Japan Foundation: 尊敬の意味を持つ動詞",
    url: "https://www.kyozai.jpf.go.jp/kyozai/material/BMA00088/ja/render.do",
  },
  jmdict: {
    label: "EDRDG JMdictDB part-of-speech tags",
    url: "https://www.edrdg.org/jmwsgi/edhelp.py?svc=jmdict",
  },
} as const;

export type SourceRefId = keyof typeof SOURCE_REFS;
```

- [ ] **Step 2: Write failing dataset validation tests**

```ts
// src/data/validateData.test.ts
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
    expect(new Set(VERBS.filter((verb) => verb.group === "godan").map((verb) => verb.reading.slice(-1)))).toEqual(
      new Set(["う", "く", "ぐ", "す", "つ", "ぬ", "ぶ", "む", "る"]),
    );
  });
});
```

Run:

```bash
npm test -- src/data/validateData.test.ts
```

Expected: FAIL because data modules do not exist.

- [ ] **Step 3: Create `src/data/verbs.ts` from Appendix A**

Use the exact 100 rows in Appendix A. Keep `jlptLevelType: "reference"` on every entry. Use these shared helpers:

```ts
// src/data/verbs.ts
import type { VerbEntry } from "../domain/types";

const COMMON_SOURCE_REFS = ["irodori-about", "marugoto-a1", "marugoto-a2-1", "marugoto-a2-2", "bccwj", "jlpt-guide"];

const overrides = {
  iku: {
    te: { surface: "行って", reading: "いって", status: "standard" as const },
    ta: { surface: "行った", reading: "いった", status: "standard" as const },
  },
  aru: {
    nai: { surface: "ない", reading: "ない", status: "standard" as const },
    potential: {
      surface: null,
      reading: null,
      status: "not-applicable" as const,
      note: "存在を表す「ある」の可能形は通常使用しません。",
    },
    passive: {
      surface: null,
      reading: null,
      status: "not-applicable" as const,
      note: "存在を表す「ある」の受身形は初級では通常扱いません。",
    },
    causative: {
      surface: null,
      reading: null,
      status: "not-applicable" as const,
      note: "存在を表す「ある」の使役形は初級では通常扱いません。",
    },
    causativePassive: {
      surface: null,
      reading: null,
      status: "not-applicable" as const,
      note: "存在を表す「ある」の使役受身形は初級では通常扱いません。",
    },
  },
  dekiru: {
    potential: {
      surface: null,
      reading: null,
      status: "not-applicable" as const,
      note: "「できる」自体が可能を表すため、可能形は通常使用しません。",
    },
  },
  mieru: {
    potential: {
      surface: null,
      reading: null,
      status: "not-applicable" as const,
      note: "「見える」自体が自然に見えることを表すため、可能形は通常使用しません。",
    },
  },
};

```

Create `export const VERBS: VerbEntry[]` with the exact 100 Appendix A rows in their listed order. For every Appendix A row, create one object with this exact shape:

```ts
{
  id: "taberu",
  dictionaryForm: "食べる",
  reading: "たべる",
  meanings: ["吃"],
  group: "ichidan",
  isException: false,
  tags: ["飲食"],
  frequencyTier: "core",
  jlptLevel: "N5",
  jlptLevelType: "reference",
  notes: [],
  sourceRefs: COMMON_SOURCE_REFS,
}
```

Apply `overrides.iku` to `行く`, `overrides.aru` to `ある`, `overrides.dekiru` to `できる`, and `overrides.mieru` to `見える`.
Set `isException: true` for `ある`, `行く`, `帰る`, `入る`, `走る`, `知る`, `要る`, and `切る`. Set it to `false` for the other Appendix A entries.
Add `notes: ["「て形」と「た形」は行って／行ったになります。"]` to `行く`, `notes: ["否定形は「あらない」ではなく「ない」です。"]` to `ある`, and `notes: ["「-いる / -える」で終わりますが、五段動詞です。"]` to `帰る`, `入る`, `走る`, `知る`, `要る`, and `切る`. Keep `notes: []` on the remaining entries unless a row needs an explicit beginner-facing clarification.

- [ ] **Step 4: Add the dataset validator**

```ts
// src/data/validateData.ts
import { FORM_DEFINITIONS } from "./forms";
import { SOURCE_REFS } from "./sourceRefs";
import { conjugate } from "../domain/conjugate";
import type { InferenceLexiconEntry, VerbEntry } from "../domain/types";

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
    if (typeof verb.isException !== "boolean") errors.push(`missing exception flag: ${verb.id}`);
    if (verb.jlptLevelType !== "reference") errors.push(`JLPT level must be reference-only: ${verb.id}`);
    for (const sourceRef of verb.sourceRefs) {
      if (!(sourceRef in SOURCE_REFS)) errors.push(`unknown source ref: ${verb.id}:${sourceRef}`);
    }
    const forms = conjugate(verb);
    if (Object.keys(forms).length !== FORM_DEFINITIONS.length) errors.push(`missing form slot: ${verb.id}`);
  }

  for (const entry of inferenceLexicon) {
    if (entry.sourceRefs.length === 0) errors.push(`inference source missing: ${entry.dictionaryForm}`);
    for (const sourceRef of entry.sourceRefs) {
      if (!(sourceRef in SOURCE_REFS)) errors.push(`unknown inference source: ${entry.dictionaryForm}:${sourceRef}`);
    }
  }
  return errors;
};
```

- [ ] **Step 5: Temporarily create an empty inference lexicon**

```ts
// src/data/inferenceLexicon.ts
import type { InferenceLexiconEntry } from "../domain/types";

export const INFERENCE_LEXICON: InferenceLexiconEntry[] = [];
```

- [ ] **Step 6: Run validation**

Run:

```bash
npm test -- src/data/validateData.test.ts
```

Expected: PASS with exactly `100` confirmed verbs.

- [ ] **Step 7: Commit the curated dataset**

```bash
git add src/data/sourceRefs.ts src/data/verbs.ts src/data/inferenceLexicon.ts src/data/validateData.ts src/data/validateData.test.ts
git commit -m "feat: add traceable 100-verb dataset"
```

## Task 5: Add The Inference Exception Lexicon

**Files:**
- Modify: `src/data/inferenceLexicon.ts`
- Modify: `src/data/validateData.test.ts`

- [ ] **Step 1: Add a failing lexicon coverage test**

Append:

```ts
// src/data/validateData.test.ts
it("tracks common inference exceptions with sources", () => {
  expect(INFERENCE_LEXICON.map((entry) => entry.dictionaryForm)).toEqual(
    expect.arrayContaining(["行く", "ある", "帰る", "切る", "要る", "くださる", "なさる", "いらっしゃる", "おっしゃる"]),
  );
  expect(INFERENCE_LEXICON.every((entry) => entry.sourceRefs.length > 0)).toBe(true);
});
```

Run:

```bash
npm test -- src/data/validateData.test.ts
```

Expected: FAIL because the lexicon is empty.

- [ ] **Step 2: Populate the exception lexicon**

```ts
// src/data/inferenceLexicon.ts
import type { InferenceLexiconEntry } from "../domain/types";

const GODAN_RU_SOURCE = ["jpf-te-form", "jmdict"];
const HONORIFIC_SOURCE = ["jpf-honorific", "jmdict"];

export const INFERENCE_LEXICON: InferenceLexiconEntry[] = [
  {
    dictionaryForm: "行く",
    reading: "いく",
    group: "godan",
    overrides: {
      te: { surface: "行って", reading: "いって", status: "standard" },
      ta: { surface: "行った", reading: "いった", status: "standard" },
    },
    notes: ["「て形」と「た形」は促音便になります。"],
    sourceRefs: ["jpf-te-form", "jmdict"],
  },
  {
    dictionaryForm: "ある",
    reading: "ある",
    group: "godan",
    overrides: {
      nai: { surface: "ない", reading: "ない", status: "standard" },
      potential: {
        surface: null,
        reading: null,
        status: "not-applicable",
        note: "存在を表す「ある」の可能形は通常使用しません。",
      },
      passive: {
        surface: null,
        reading: null,
        status: "not-applicable",
        note: "存在を表す「ある」の受身形は初級では通常扱いません。",
      },
      causative: {
        surface: null,
        reading: null,
        status: "not-applicable",
        note: "存在を表す「ある」の使役形は初級では通常扱いません。",
      },
      causativePassive: {
        surface: null,
        reading: null,
        status: "not-applicable",
        note: "存在を表す「ある」の使役受身形は初級では通常扱いません。",
      },
    },
    notes: ["否定形は「あらない」ではなく「ない」です。"],
    sourceRefs: ["jpf-conjugation", "jmdict"],
  },
  ...[
    ["帰る", "かえる"],
    ["入る", "はいる"],
    ["走る", "はしる"],
    ["知る", "しる"],
    ["切る", "きる"],
    ["要る", "いる"],
    ["減る", "へる"],
    ["蹴る", "ける"],
    ["滑る", "すべる"],
    ["喋る", "しゃべる"],
    ["焦る", "あせる"],
    ["限る", "かぎる"],
    ["握る", "にぎる"],
  ].map(([dictionaryForm, reading]) => ({
    dictionaryForm,
    reading,
    group: "godan" as const,
    notes: ["「-いる / -える」で終わりますが、五段動詞です。"],
    sourceRefs: GODAN_RU_SOURCE,
  })),
  {
    dictionaryForm: "くださる",
    reading: "くださる",
    group: "godan",
    overrides: {
      masu: { surface: "くださいます", reading: "くださいます", status: "standard" },
      imperative: { surface: "ください", reading: "ください", status: "standard" },
    },
    notes: ["尊敬語として使われる特殊な五段動詞です。"],
    sourceRefs: HONORIFIC_SOURCE,
  },
  {
    dictionaryForm: "なさる",
    reading: "なさる",
    group: "godan",
    overrides: {
      masu: { surface: "なさいます", reading: "なさいます", status: "standard" },
      imperative: { surface: "なさい", reading: "なさい", status: "standard" },
    },
    notes: ["尊敬語として使われる特殊な五段動詞です。"],
    sourceRefs: HONORIFIC_SOURCE,
  },
  {
    dictionaryForm: "いらっしゃる",
    reading: "いらっしゃる",
    group: "godan",
    overrides: {
      masu: { surface: "いらっしゃいます", reading: "いらっしゃいます", status: "standard" },
      imperative: { surface: "いらっしゃい", reading: "いらっしゃい", status: "standard" },
    },
    notes: ["尊敬語として使われる特殊な五段動詞です。"],
    sourceRefs: HONORIFIC_SOURCE,
  },
  {
    dictionaryForm: "おっしゃる",
    reading: "おっしゃる",
    group: "godan",
    overrides: {
      masu: { surface: "おっしゃいます", reading: "おっしゃいます", status: "standard" },
      imperative: { surface: "おっしゃい", reading: "おっしゃい", status: "standard" },
    },
    notes: ["尊敬語として使われる特殊な五段動詞です。"],
    sourceRefs: HONORIFIC_SOURCE,
  },
];
```

- [ ] **Step 3: Run validation**

Run:

```bash
npm test -- src/data/validateData.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit the inference lexicon**

```bash
git add src/data/inferenceLexicon.ts src/data/validateData.test.ts
git commit -m "feat: add traceable inference exception lexicon"
```

## Task 6: Implement Exception-Assisted Inference

**Files:**
- Create: `src/domain/infer.ts`
- Create: `src/domain/infer.test.ts`

- [ ] **Step 1: Write failing inference tests**

```ts
// src/domain/infer.test.ts
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
```

Run:

```bash
npm test -- src/domain/infer.test.ts
```

Expected: FAIL because `src/domain/infer.ts` does not exist.

- [ ] **Step 2: Implement the two-layer inference flow**

Create `src/domain/infer.ts` with:

```ts
import { INFERENCE_LEXICON } from "../data/inferenceLexicon";
import { VERBS } from "../data/verbs";
import { conjugate } from "./conjugate";
import type { ConjugationTable, InferenceStatus, VerbEntry, VerbGroup } from "./types";

const WARNING = "推測結果，可能未涵蓋例外，請再查字典。";
const GODAN_TAILS = new Set(["う", "く", "ぐ", "す", "つ", "ぬ", "ぶ", "む"]);
const I_E_KANA = new Set("いきしちにひみりぎじぢびぴえけせてねへめれげぜでべぺ".split(""));
const hasKanji = (value: string) => /[\u3400-\u9fff]/u.test(value);

type InferredCandidate = {
  dictionaryForm: string;
  reading: string;
  group: VerbGroup;
  notes: string[];
  forms: ConjugationTable;
};

export type InferenceResult = {
  status: InferenceStatus;
  warning: string;
  message?: string;
  candidates: InferredCandidate[];
};

const candidateFrom = (
  value: Pick<VerbEntry, "dictionaryForm" | "reading" | "group" | "overrides"> & { notes?: string[] },
): InferredCandidate => ({
  dictionaryForm: value.dictionaryForm,
  reading: value.reading,
  group: value.group,
  notes: value.notes ?? [],
  forms: conjugate(value),
});

export const inferVerb = (input: string, suppliedReading?: string): InferenceResult => {
  const dictionaryForm = input.trim();
  const reading = suppliedReading?.trim() || dictionaryForm;

  const knownMatches = VERBS.filter(
    (verb) => verb.dictionaryForm === dictionaryForm || verb.reading === dictionaryForm,
  );
  const lexiconMatches = INFERENCE_LEXICON.filter(
    (verb) => verb.dictionaryForm === dictionaryForm || verb.reading === dictionaryForm,
  );
  const matches = knownMatches.length > 0 ? knownMatches : lexiconMatches;
  if (matches.length > 1) {
    return { status: "ambiguous", warning: WARNING, candidates: matches.map(candidateFrom) };
  }
  if (matches.length === 1) {
    return { status: "lexicon-assisted", warning: WARNING, candidates: matches.map(candidateFrom) };
  }

  if (!dictionaryForm) {
    return { status: "unsupported", warning: WARNING, message: "請輸入日文辭書形。", candidates: [] };
  }
  const dictionaryTail = dictionaryForm.slice(-1);
  const looksLikeDictionaryForm =
    dictionaryForm.endsWith("する") ||
    dictionaryForm === "来る" ||
    GODAN_TAILS.has(dictionaryTail) ||
    dictionaryTail === "る";
  if (!looksLikeDictionaryForm) {
    return { status: "unsupported", warning: WARNING, message: "目前只能推測日文動詞的辭書形。", candidates: [] };
  }
  if (hasKanji(dictionaryForm) && !suppliedReading) {
    return { status: "unsupported", warning: WARNING, message: "這個未收錄動詞需要補充完整假名，才能產生可靠的推測讀音。", candidates: [] };
  }
  if (dictionaryForm.endsWith("する")) {
    return { status: "heuristic", warning: WARNING, candidates: [candidateFrom({ dictionaryForm, reading, group: "irregular" })] };
  }
  if (dictionaryForm === "来る" || reading === "くる") {
    return { status: "heuristic", warning: WARNING, candidates: [candidateFrom({ dictionaryForm: "来る", reading: "くる", group: "irregular" })] };
  }
  const tail = reading.slice(-1);
  const previous = reading.slice(-2, -1);
  const group: VerbGroup =
    tail !== "る" && GODAN_TAILS.has(tail)
      ? "godan"
      : tail === "る" && I_E_KANA.has(previous)
        ? "ichidan"
        : tail === "る"
          ? "godan"
          : "godan";

  if (!GODAN_TAILS.has(tail) && tail !== "る") {
    return { status: "unsupported", warning: WARNING, message: "目前只能推測日文動詞的辭書形。", candidates: [] };
  }
  const notes = group === "ichidan"
    ? ["「る」前面的音位於い段或え段，因此暫時依一段動詞推測。"]
    : ["依辭書形字尾暫時套用五段動詞規則。"];
  return { status: "heuristic", warning: WARNING, candidates: [candidateFrom({ dictionaryForm, reading, group, notes })] };
};
```

- [ ] **Step 3: Run inference tests**

Run:

```bash
npm test -- src/domain/infer.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit inference**

```bash
git add src/domain/infer.ts src/domain/infer.test.ts
git commit -m "feat: infer unknown verbs with visible warnings"
```

## Task 7: Implement Japanese And Traditional Chinese Search

**Files:**
- Create: `src/domain/search.ts`
- Create: `src/domain/search.test.ts`

- [ ] **Step 1: Write failing search tests**

```ts
// src/domain/search.test.ts
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
```

Run:

```bash
npm test -- src/domain/search.test.ts
```

Expected: FAIL because `src/domain/search.ts` does not exist.

- [ ] **Step 2: Implement confirmed-data search**

```ts
// src/domain/search.ts
import { VERBS } from "../data/verbs";
import type { VerbEntry } from "./types";

const normalize = (value: string) => value.trim().toLocaleLowerCase("zh-Hant");

export const searchVerbs = (query: string): VerbEntry[] => {
  const normalized = normalize(query);
  if (!normalized) return [];

  return VERBS.filter((verb) => {
    if (normalize(verb.dictionaryForm).includes(normalized)) return true;
    if (normalize(verb.reading).includes(normalized)) return true;
    return verb.meanings.some((meaning) => normalize(meaning).includes(normalized));
  });
};
```

- [ ] **Step 3: Run search tests**

Run:

```bash
npm test -- src/domain/search.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit search**

```bash
git add src/domain/search.ts src/domain/search.test.ts
git commit -m "feat: search verbs by Japanese and Traditional Chinese"
```

## Task 8: Archive The Prototype And Add A Minimal Data-Aware Shell

**Files:**
- Move: `code_artifact.tsx` to `docs/reference/original-prototype.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Add: `日文動詞變化規則總整理.md`

- [ ] **Step 1: Archive the original prototype without rewriting it**

Use `apply_patch` with a move operation so the initial prototype remains available as a reference:

```text
code_artifact.tsx -> docs/reference/original-prototype.tsx
```

- [ ] **Step 2: Extend the shell test**

```tsx
// src/App.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("identifies the learning site and confirmed dataset", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "日文動詞全解析系統" })).toBeInTheDocument();
    expect(screen.getByText("100 個已核對常用動詞")).toBeInTheDocument();
    expect(screen.getByText("規則、查詢與練習都從同一套已核對資料出發。")).toBeInTheDocument();
  });
});
```

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because the dataset count is not rendered.

- [ ] **Step 3: Render the confirmed dataset count**

```tsx
// src/App.tsx
import { VERBS } from "./data/verbs";

export default function App() {
  return (
    <main className="app-shell">
      <p className="eyebrow">PUBLIC LEARNING RESOURCE</p>
      <h1>日文動詞全解析系統</h1>
      <p>規則、查詢與練習都從同一套已核對資料出發。</p>
      <strong>{VERBS.length} 個已核對常用動詞</strong>
    </main>
  );
}
```

- [ ] **Step 4: Run all tests and build**

Run:

```bash
npm test
npm run build
```

Expected: all tests PASS and production build exits `0`.

- [ ] **Step 5: Commit phase 1**

```bash
git add docs/reference/original-prototype.tsx 日文動詞變化規則總整理.md src/App.tsx src/App.test.tsx
git commit -m "feat: connect verified verb data to app shell"
```

## Phase 1 Verification

Run:

```bash
npm test
npm run build
git status --short
```

Expected:

- all Vitest tests pass;
- Vite production build succeeds;
- working tree contains no accidental generated files;
- `VERBS` contains exactly 100 confirmed entries;
- inference results always retain the warning;
- ambiguous kana input returns candidates instead of one forced answer.

## Appendix A: Exact Initial 100-Verb Dataset

`JLPT` values below are reference labels, not official per-word classifications.

| id | dictionaryForm | reading | group | meaning | tag | tier | JLPT |
|---|---|---|---|---|---|---|---|
| suru | する | する | irregular | 做 | 基礎 | core | N5 |
| kuru | 来る | くる | irregular | 來 | 移動 | core | N5 |
| aru | ある | ある | godan | 有（無生命） | 基礎 | core | N5 |
| iru-exist | いる | いる | ichidan | 有（生命） | 基礎 | core | N5 |
| iku | 行く | いく | godan | 去 | 移動 | core | N5 |
| kaeru | 帰る | かえる | godan | 回去、回家 | 移動 | core | N5 |
| taberu | 食べる | たべる | ichidan | 吃 | 飲食 | core | N5 |
| nomu | 飲む | のむ | godan | 喝 | 飲食 | core | N5 |
| miru | 見る | みる | ichidan | 看 | 溝通 | core | N5 |
| kiku | 聞く | きく | godan | 聽、詢問 | 溝通 | core | N5 |
| hanasu | 話す | はなす | godan | 說、交談 | 溝通 | core | N5 |
| iu | 言う | いう | godan | 說 | 溝通 | core | N5 |
| yomu | 読む | よむ | godan | 讀 | 學習 | core | N5 |
| kaku | 書く | かく | godan | 寫 | 學習 | core | N5 |
| kau | 買う | かう | godan | 買 | 購物 | core | N5 |
| uru | 売る | うる | godan | 賣 | 購物 | common | N4 |
| au | 会う | あう | godan | 見面 | 人際 | core | N5 |
| matsu | 待つ | まつ | godan | 等待 | 日常 | core | N5 |
| motsu | 持つ | もつ | godan | 拿、攜帶 | 日常 | core | N5 |
| toru | 取る | とる | godan | 拿、取得 | 日常 | core | N5 |
| tsukau | 使う | つかう | godan | 使用 | 日常 | core | N5 |
| tsukuru | 作る | つくる | godan | 做、製作 | 日常 | core | N5 |
| sumu | 住む | すむ | godan | 居住 | 居家 | core | N5 |
| hataraku | 働く | はたらく | godan | 工作 | 工作 | core | N5 |
| yasumu | 休む | やすむ | godan | 休息、請假 | 日常 | core | N5 |
| neru | 寝る | ねる | ichidan | 睡覺 | 日常 | core | N5 |
| okiru | 起きる | おきる | ichidan | 起床 | 日常 | core | N5 |
| hairu | 入る | はいる | godan | 進入 | 移動 | core | N5 |
| deru | 出る | でる | ichidan | 出去、出現 | 移動 | core | N5 |
| noru | 乗る | のる | godan | 搭乘 | 移動 | core | N5 |
| oriru | 降りる | おりる | ichidan | 下車 | 移動 | core | N5 |
| aruku | 歩く | あるく | godan | 步行 | 移動 | core | N5 |
| hashiru | 走る | はしる | godan | 跑 | 移動 | common | N4 |
| oyogu | 泳ぐ | およぐ | godan | 游泳 | 休閒 | common | N5 |
| asobu | 遊ぶ | あそぶ | godan | 玩 | 休閒 | core | N5 |
| utau | 歌う | うたう | godan | 唱歌 | 休閒 | common | N5 |
| narau | 習う | ならう | godan | 學習 | 學習 | core | N5 |
| oshieru | 教える | おしえる | ichidan | 教、告訴 | 學習 | core | N5 |
| wakaru | 分かる | わかる | godan | 理解 | 溝通 | core | N5 |
| shiru | 知る | しる | godan | 知道 | 溝通 | core | N5 |
| omou | 思う | おもう | godan | 想、認為 | 思考 | core | N5 |
| kangaeru | 考える | かんがえる | ichidan | 思考 | 思考 | common | N4 |
| oboeru | 覚える | おぼえる | ichidan | 記住 | 學習 | common | N4 |
| wasureru | 忘れる | わすれる | ichidan | 忘記 | 日常 | common | N4 |
| dekiru | できる | できる | ichidan | 能夠、完成 | 基礎 | core | N5 |
| akeru | 開ける | あける | ichidan | 打開 | 居家 | core | N5 |
| shimeru | 閉める | しめる | ichidan | 關上 | 居家 | core | N5 |
| aku | 開く | あく | godan | 打開、營業 | 居家 | common | N4 |
| shimaru | 閉まる | しまる | godan | 關閉 | 居家 | common | N4 |
| tsukeru | つける | つける | ichidan | 開啟、附上 | 居家 | core | N5 |
| kesu | 消す | けす | godan | 關閉、消除 | 居家 | core | N5 |
| oku | 置く | おく | godan | 放置 | 居家 | core | N5 |
| ireru | 入れる | いれる | ichidan | 放入 | 居家 | core | N5 |
| dasu | 出す | だす | godan | 拿出、提出 | 日常 | core | N5 |
| arau | 洗う | あらう | godan | 清洗 | 居家 | common | N5 |
| abiru | 浴びる | あびる | ichidan | 淋浴 | 居家 | common | N5 |
| kiru-wear | 着る | きる | ichidan | 穿上衣 | 衣著 | core | N5 |
| nugu | 脱ぐ | ぬぐ | godan | 脫下 | 衣著 | common | N5 |
| haku | 履く | はく | godan | 穿鞋、穿下身衣物 | 衣著 | common | N5 |
| kaburu | かぶる | かぶる | godan | 戴帽子 | 衣著 | common | N5 |
| kariru | 借りる | かりる | ichidan | 借入 | 日常 | core | N5 |
| kasu | 貸す | かす | godan | 借出 | 日常 | core | N5 |
| kaesu | 返す | かえす | godan | 歸還 | 日常 | common | N5 |
| ageru | あげる | あげる | ichidan | 給 | 人際 | core | N5 |
| morau | もらう | もらう | godan | 收到 | 人際 | core | N5 |
| kureru | くれる | くれる | ichidan | 給我方 | 人際 | common | N4 |
| tetsudau | 手伝う | てつだう | godan | 幫忙 | 人際 | common | N4 |
| okuru | 送る | おくる | godan | 寄送、接送 | 人際 | core | N5 |
| mukaeru | 迎える | むかえる | ichidan | 迎接 | 人際 | common | N4 |
| hajimeru | 始める | はじめる | ichidan | 開始某事 | 日常 | common | N4 |
| hajimaru | 始まる | はじまる | godan | 開始 | 日常 | common | N4 |
| owaru | 終わる | おわる | godan | 結束 | 日常 | core | N5 |
| tomaru | 止まる | とまる | godan | 停止 | 移動 | common | N4 |
| tomeru | 止める | とめる | ichidan | 停下、阻止 | 移動 | common | N4 |
| magaru | 曲がる | まがる | godan | 轉彎 | 移動 | core | N5 |
| wataru | 渡る | わたる | godan | 穿越 | 移動 | core | N5 |
| isogu | 急ぐ | いそぐ | godan | 趕快 | 日常 | common | N4 |
| okureru | 遅れる | おくれる | ichidan | 遲到 | 日常 | common | N4 |
| komaru | 困る | こまる | godan | 困擾 | 日常 | common | N4 |
| sagasu | 探す | さがす | godan | 尋找 | 日常 | common | N4 |
| erabu | 選ぶ | えらぶ | godan | 選擇 | 日常 | common | N4 |
| kimeru | 決める | きめる | ichidan | 決定 | 日常 | common | N4 |
| harau | 払う | はらう | godan | 支付 | 購物 | common | N4 |
| iru-need | 要る | いる | godan | 需要 | 日常 | common | N5 |
| kiru-cut | 切る | きる | godan | 切 | 日常 | common | N4 |
| naru | なる | なる | godan | 變成 | 基礎 | core | N5 |
| kakaru | かかる | かかる | godan | 花費、需要 | 日常 | core | N5 |
| mieru | 見える | みえる | ichidan | 看得見 | 溝通 | common | N4 |
| shinu | 死ぬ | しぬ | godan | 死 | 規則例詞 | common | N4 |
| benkyou-suru | 勉強する | べんきょうする | irregular | 學習 | 學習 | core | N5 |
| renshuu-suru | 練習する | れんしゅうする | irregular | 練習 | 學習 | common | N4 |
| ryouri-suru | 料理する | りょうりする | irregular | 做菜 | 居家 | common | N4 |
| souji-suru | 掃除する | そうじする | irregular | 打掃 | 居家 | common | N5 |
| sentaku-suru | 洗濯する | せんたくする | irregular | 洗衣服 | 居家 | common | N5 |
| yoyaku-suru | 予約する | よやくする | irregular | 預約 | 日常 | common | N4 |
| renraku-suru | 連絡する | れんらくする | irregular | 聯絡 | 人際 | common | N4 |
| shitsumon-suru | 質問する | しつもんする | irregular | 提問 | 學習 | common | N5 |
| kekkon-suru | 結婚する | けっこんする | irregular | 結婚 | 人際 | common | N5 |
| sanpo-suru | 散歩する | さんぽする | irregular | 散步 | 休閒 | common | N5 |
| undou-suru | 運動する | うんどうする | irregular | 運動 | 休閒 | common | N5 |
