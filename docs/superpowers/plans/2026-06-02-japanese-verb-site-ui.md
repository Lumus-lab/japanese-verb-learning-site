# Japanese Verb Learning Site UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the tested core modules into a polished public learning website with clear rules, lookup, dictionary filters, concise practice, responsive layout, and Cloudflare Pages-ready static output.

**Architecture:** Keep page components thin and reuse the confirmed dataset, conjugator, search, and inference modules from phase 1. Use React Router with a Cloudflare Pages SPA redirect. Present confirmed results, assisted inference, and heuristic inference with visibly different status messages.

**Tech Stack:** React, React Router, Vite, TypeScript, Vitest, Testing Library, plain CSS, Cloudflare Pages

---

## Prerequisite

Complete `docs/superpowers/plans/2026-06-02-japanese-verb-core-data.md` first. The phase-1 verification commands must pass before starting this plan.

## File Map

```text
public/_redirects                    # Cloudflare Pages SPA fallback
src/main.tsx                         # router provider
src/router.tsx                       # application routes
src/components/Layout.tsx            # shared header and navigation
src/components/SearchBox.tsx         # reusable lookup form
src/components/StatusBadge.tsx       # confirmed/inferred result badge
src/components/VerbDetail.tsx        # complete conjugation display
src/components/VerbCard.tsx          # dictionary result card
src/pages/HomePage.tsx               # landing page
src/pages/LookupPage.tsx             # confirmed lookup and inference
src/pages/DictionaryPage.tsx         # filterable 100-verb catalogue
src/pages/GuidePage.tsx              # structured rules
src/pages/PracticePage.tsx           # concise quiz experience
src/data/guideSections.ts            # guide content
src/domain/practice.ts               # generated quiz questions
src/domain/practice.test.ts          # quiz generation tests
src/router.test.tsx                  # route-level UI tests
src/styles.css                       # complete responsive theme
README.md                            # local use and Cloudflare deployment
```

## Task 1: Add Routing And Shared Layout

**Files:**
- Modify: `package.json`
- Modify: `src/main.tsx`
- Create: `src/router.tsx`
- Create: `src/components/Layout.tsx`
- Create: `src/router.test.tsx`

- [ ] **Step 1: Install router and UI test support**

Run:

```bash
npm install react-router-dom
npm install --save-dev @testing-library/user-event
```

Expected: dependency install exits `0` and updates `package-lock.json`.

- [ ] **Step 2: Write the failing route test**

```tsx
// src/router.test.tsx
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { routes } from "./router";

describe("router", () => {
  it("shows the four public learning sections", () => {
    render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/"] })} />);
    expect(screen.getByRole("link", { name: "首頁" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "規則整理" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "動詞字典" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "快速練習" })).toBeInTheDocument();
  });
});
```

Run:

```bash
npm test -- src/router.test.tsx
```

Expected: FAIL because `src/router.tsx` does not exist.

- [ ] **Step 3: Add the route table and layout**

```tsx
// src/components/Layout.tsx
import { Activity } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  ["/", "首頁"],
  ["/guide", "規則整理"],
  ["/dictionary", "動詞字典"],
  ["/practice", "快速練習"],
] as const;

export function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="content header-inner">
          <NavLink className="brand" to="/">
            <Activity aria-hidden="true" size={28} />
            <span>日文動詞全解析系統</span>
          </NavLink>
          <nav aria-label="主要導覽">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="content page-content">
        <Outlet />
      </main>
    </>
  );
}
```

```tsx
// src/router.tsx
import type { RouteObject } from "react-router-dom";
import { Layout } from "./components/Layout";

const StubPage = ({ title }: { title: string }) => <h1>{title}</h1>;

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: "/", element: <StubPage title="首頁" /> },
      { path: "/guide", element: <StubPage title="規則整理" /> },
      { path: "/dictionary", element: <StubPage title="動詞字典" /> },
      { path: "/lookup", element: <StubPage title="動詞查詢" /> },
      { path: "/verbs/:verbId", element: <StubPage title="動詞詳細資料" /> },
      { path: "/practice", element: <StubPage title="快速練習" /> },
    ],
  },
];
```

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./router";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={createBrowserRouter(routes)} />
  </StrictMode>,
);
```

- [ ] **Step 4: Run the route test**

Run:

```bash
npm test -- src/router.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit routing**

```bash
git add package.json package-lock.json src/main.tsx src/router.tsx src/components/Layout.tsx src/router.test.tsx
git commit -m "feat: add public learning site routes"
```

## Task 2: Build The Home Search Experience

**Files:**
- Create: `src/components/SearchBox.tsx`
- Create: `src/pages/HomePage.tsx`
- Modify: `src/router.tsx`
- Modify: `src/router.test.tsx`

- [ ] **Step 1: Add a failing home search test**

Append:

```tsx
// src/router.test.tsx
import userEvent from "@testing-library/user-event";

it("navigates a home lookup to the lookup page", async () => {
  const user = userEvent.setup();
  const router = createMemoryRouter(routes, { initialEntries: ["/"] });
  render(<RouterProvider router={router} />);
  await user.type(screen.getByRole("searchbox", { name: "搜尋動詞" }), "食べる");
  await user.click(screen.getByRole("button", { name: "查詢" }));
  expect(router.state.location.pathname).toBe("/lookup");
  expect(router.state.location.search).toBe("?q=%E9%A3%9F%E3%81%B9%E3%82%8B");
});
```

Run:

```bash
npm test -- src/router.test.tsx
```

Expected: FAIL because the initial home stub has no searchbox.

- [ ] **Step 2: Add the reusable search form**

```tsx
// src/components/SearchBox.tsx
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) navigate(`/lookup?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form className="search-box" onSubmit={submit}>
      <Search aria-hidden="true" size={20} />
      <input
        aria-label="搜尋動詞"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="輸入 食べる、たべる 或 吃"
        type="search"
        value={query}
      />
      <button type="submit">查詢</button>
    </form>
  );
}
```

- [ ] **Step 3: Build the home page**

```tsx
// src/pages/HomePage.tsx
import { BookOpen, ListFilter, SearchCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SearchBox } from "../components/SearchBox";
import { VERBS } from "../data/verbs";

export function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">JAPANESE VERB LEARNING LAB</p>
        <h1>從規則到查詢，真正看懂日文動詞變化。</h1>
        <p>用繁體中文整理分類規則、完整變化和常見例外。先查詢，再理解。</p>
        <SearchBox />
        <p className="muted">{VERBS.length} 個已核對常用動詞，陌生動詞也能提供帶警告的規則推測。</p>
      </section>
      <section className="feature-grid" aria-label="學習入口">
        <Link className="feature-card" to="/guide"><BookOpen />規則整理</Link>
        <Link className="feature-card" to="/dictionary"><ListFilter />動詞字典</Link>
        <Link className="feature-card" to="/practice"><SearchCheck />快速練習</Link>
      </section>
    </>
  );
}
```

Replace the home stub:

```tsx
// src/router.tsx
import { HomePage } from "./pages/HomePage";

// inside children:
{ path: "/", element: <HomePage /> },
```

- [ ] **Step 4: Run route tests**

Run:

```bash
npm test -- src/router.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the home page**

```bash
git add src/components/SearchBox.tsx src/pages/HomePage.tsx src/router.tsx src/router.test.tsx
git commit -m "feat: add home lookup experience"
```

## Task 3: Render Confirmed And Inferred Lookup Results

**Files:**
- Create: `src/components/StatusBadge.tsx`
- Create: `src/components/VerbDetail.tsx`
- Create: `src/pages/LookupPage.tsx`
- Modify: `src/router.tsx`
- Modify: `src/router.test.tsx`

- [ ] **Step 1: Write failing lookup tests**

Append:

```tsx
// src/router.test.tsx
it("renders a confirmed verb with a complete form table", () => {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/lookup?q=食べる"] })} />);
  expect(screen.getByText("已核對資料")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "食べる" })).toBeInTheDocument();
  expect(screen.getByText("食べられる")).toBeInTheDocument();
});

it("keeps a visible warning on inferred results", () => {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/lookup?q=まぜる"] })} />);
  expect(screen.getByText("規則推測")).toBeInTheDocument();
  expect(screen.getByText("推測結果，可能未涵蓋例外，請再查字典。")).toBeInTheDocument();
});

it("asks for kana before inferring an unrecorded kanji verb", async () => {
  const user = userEvent.setup();
  const router = createMemoryRouter(routes, { initialEntries: ["/lookup?q=混ぜる"] });
  render(<RouterProvider router={router} />);
  await user.type(screen.getByRole("textbox", { name: "補充完整假名" }), "まぜる");
  await user.click(screen.getByRole("button", { name: "使用假名推測" }));
  expect(router.state.location.search).toContain("reading=");
  expect(await screen.findByText("混ぜます")).toBeInTheDocument();
});
```

Run:

```bash
npm test -- src/router.test.tsx
```

Expected: FAIL because lookup is still a stub.

- [ ] **Step 2: Add result badges and the form table**

```tsx
// src/components/StatusBadge.tsx
export function StatusBadge({ kind }: { kind: "confirmed" | "assisted" | "heuristic" }) {
  const labels = {
    confirmed: "已核對資料",
    assisted: "例外庫輔助推測",
    heuristic: "規則推測",
  };
  return <span className={`status-badge ${kind}`}>{labels[kind]}</span>;
}
```

```tsx
// src/components/VerbDetail.tsx
import { FORM_DEFINITIONS } from "../data/forms";
import { conjugate } from "../domain/conjugate";
import type { VerbEntry } from "../domain/types";

export function VerbDetail({ verb }: { verb: Pick<VerbEntry, "dictionaryForm" | "reading" | "group" | "meanings" | "notes" | "overrides"> }) {
  const forms = conjugate(verb);
  return (
    <article className="verb-detail">
      <header>
        <h1>{verb.dictionaryForm}</h1>
        <p className="reading">{verb.reading}</p>
        {verb.meanings.length > 0 && <p>{verb.meanings.join("、")}</p>}
        {verb.notes.length > 0 && <ul className="notes">{verb.notes.map((note) => <li key={note}>{note}</li>)}</ul>}
      </header>
      <div className="form-grid">
        {FORM_DEFINITIONS.map((definition) => {
          const form = forms[definition.id];
          return (
            <section className={`form-card ${form.status}`} key={definition.id}>
              <h2>{definition.label}</h2>
              <p className="muted">{definition.description}</p>
              <strong>{form.surface ?? "通常不使用"}</strong>
              {form.reading && form.reading !== form.surface && <small>{form.reading}</small>}
              {form.note && <p className="note">{form.note}</p>}
            </section>
          );
        })}
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Build the lookup page**

```tsx
// src/pages/LookupPage.tsx
import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchBox } from "../components/SearchBox";
import { StatusBadge } from "../components/StatusBadge";
import { VerbDetail } from "../components/VerbDetail";
import { inferVerb } from "../domain/infer";
import { searchVerbs } from "../domain/search";

function ReadingPrompt({ dictionaryForm }: { dictionaryForm: string }) {
  const [reading, setReading] = useState("");
  const navigate = useNavigate();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (reading.trim()) navigate(`/lookup?q=${encodeURIComponent(dictionaryForm)}&reading=${encodeURIComponent(reading.trim())}`);
  };
  return (
    <form className="reading-prompt" onSubmit={submit}>
      <label>補充完整假名<input aria-label="補充完整假名" onChange={(event) => setReading(event.target.value)} value={reading} /></label>
      <button type="submit">使用假名推測</button>
    </form>
  );
}

export function LookupPage() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const suppliedReading = params.get("reading")?.trim() || undefined;
  const confirmed = searchVerbs(query);

  if (!query) return <><SearchBox /><p>請輸入日文動詞或繁體中文意思。</p></>;
  if (confirmed.length > 1) {
    return <><SearchBox initialQuery={query} /><h1>找到多個已核對結果</h1>{confirmed.map((verb) => <VerbDetail key={verb.id} verb={verb} />)}</>;
  }
  if (confirmed.length === 1) {
    return <><SearchBox initialQuery={query} /><StatusBadge kind="confirmed" /><VerbDetail verb={confirmed[0]} /></>;
  }

  const inferred = inferVerb(query, suppliedReading);
  if (inferred.status === "unsupported") {
    return <><SearchBox initialQuery={query} /><h1>尚未收錄</h1><p>{inferred.message}</p>{/補充完整假名/.test(inferred.message ?? "") && <ReadingPrompt dictionaryForm={query} />}</>;
  }
  if (inferred.status === "ambiguous") {
    return <><SearchBox initialQuery={query} /><h1>請選擇你要查詢的動詞</h1><p>{inferred.warning}</p>{inferred.candidates.map((verb) => <VerbDetail key={`${verb.dictionaryForm}-${verb.group}`} verb={{ ...verb, meanings: [], notes: verb.notes }} />)}</>;
  }
  const candidate = inferred.candidates[0];
  return (
    <>
      <SearchBox initialQuery={query} />
      <StatusBadge kind={inferred.status === "lexicon-assisted" ? "assisted" : "heuristic"} />
      <p className="warning">{inferred.warning}</p>
      <VerbDetail verb={{ ...candidate, meanings: [], notes: candidate.notes }} />
    </>
  );
}
```

Replace the lookup stub:

```tsx
// src/router.tsx
import { LookupPage } from "./pages/LookupPage";

// inside children:
{ path: "/lookup", element: <LookupPage /> },
```

- [ ] **Step 4: Run lookup tests**

Run:

```bash
npm test -- src/router.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit lookup UI**

```bash
git add src/components/StatusBadge.tsx src/components/VerbDetail.tsx src/pages/LookupPage.tsx src/router.tsx src/router.test.tsx
git commit -m "feat: show confirmed and inferred lookup results"
```

## Task 4: Add The Guide And Filterable Dictionary

**Files:**
- Create: `src/data/guideSections.ts`
- Create: `src/components/VerbCard.tsx`
- Create: `src/pages/GuidePage.tsx`
- Create: `src/pages/DictionaryPage.tsx`
- Modify: `src/router.tsx`
- Modify: `src/router.test.tsx`

- [ ] **Step 1: Write failing guide and dictionary tests**

Append:

```tsx
// src/router.test.tsx
it("shows the beginner rule sections", () => {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/guide"] })} />);
  expect(screen.getByRole("heading", { name: "先分類，再變化" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "て形與た形的音便" })).toBeInTheDocument();
});

it("filters the dictionary by group", async () => {
  const user = userEvent.setup();
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/dictionary"] })} />);
  await user.selectOptions(screen.getByLabelText("動詞分類"), "irregular");
  expect(screen.getByText("勉強する")).toBeInTheDocument();
  expect(screen.queryByText("食べる")).not.toBeInTheDocument();
});

it("filters the dictionary to known exceptions", async () => {
  const user = userEvent.setup();
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/dictionary"] })} />);
  await user.click(screen.getByRole("checkbox", { name: "只顯示常見例外" }));
  expect(screen.getByText("行く")).toBeInTheDocument();
  expect(screen.queryByText("食べる")).not.toBeInTheDocument();
});
```

Run:

```bash
npm test -- src/router.test.tsx
```

Expected: FAIL because guide and dictionary are still stubs.

- [ ] **Step 2: Create structured guide content**

```ts
// src/data/guideSections.ts
export const GROUP_RULES = [
  {
    title: "五段動詞",
    body: "依最後一個假名切換段落：あ段＋ない、い段＋ます、え段＋ば或可能形、お段＋う形成意向形。字尾是「う」時，否定形要使用「わ」，例如買わない。",
  },
  {
    title: "一段動詞",
    body: "通常去掉最後的「る」再加後綴，例如食べる → 食べない、食べます、食べれば、食べよう。",
  },
  {
    title: "不規則動詞",
    body: "する、名詞＋する和来る需要個別記憶，例如する → しない、来る → こない。",
  },
] as const;

export const TE_TA_RULES = [
  { tails: "う・つ・る", te: "って", ta: "った", example: "買う → 買って／買った" },
  { tails: "む・ぶ・ぬ", te: "んで", ta: "んだ", example: "飲む → 飲んで／飲んだ" },
  { tails: "く", te: "いて", ta: "いた", example: "書く → 書いて／書いた" },
  { tails: "ぐ", te: "いで", ta: "いだ", example: "泳ぐ → 泳いで／泳いだ" },
  { tails: "す", te: "して", ta: "した", example: "話す → 話して／話した" },
] as const;

export const GUIDE_SECTIONS = [
  {
    id: "classification",
    title: "先分類，再變化",
    paragraphs: [
      "日文動詞先分成五段動詞、一段動詞和不規則動詞。分類正確後，大多數變化都能依規則產生。",
      "以「る」結尾而且前一個音在い段或え段的動詞通常是一段動詞，但仍有帰る、入る、切る、知る等常見五段例外。",
    ],
  },
  {
    id: "core",
    title: "五段、一段與不規則動詞",
    paragraphs: [
      "五段動詞會依用途改變最後一個假名。一段動詞通常去掉「る」再接後綴。",
      "する、名詞＋する和来る需要依個別規則記憶。",
    ],
  },
  {
    id: "te-ta",
    title: "て形與た形的音便",
    paragraphs: [
      "う・つ・る變成って／った，む・ぶ・ぬ變成んで／んだ，く變成いて／いた，ぐ變成いで／いだ，す變成して／した。",
      "行く是重要例外：て形是行って，た形是行った。",
    ],
  },
  {
    id: "advanced",
    title: "完整實用變化",
    paragraphs: [
      "本站為每個已核對動詞列出14種形式，包含條件、意向、命令、禁止、可能、被動、使役與使役被動。",
      "某些動詞在語意上不適合直接套用全部形式時，欄位會標示通常不使用，避免顯示機械式答案。",
    ],
  },
] as const;
```

- [ ] **Step 3: Render the guide**

```tsx
// src/pages/GuidePage.tsx
import { FORM_DEFINITIONS } from "../data/forms";
import { GROUP_RULES, GUIDE_SECTIONS, TE_TA_RULES } from "../data/guideSections";

export function GuidePage() {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">GUIDE</p>
        <h1>規則整理</h1>
        <p>先掌握可靠的骨架，再用動詞字典核對例外。</p>
      </header>
      <div className="guide-stack">
        {GUIDE_SECTIONS.map((section) => (
          <section className="guide-card" id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
      </div>
      <section className="guide-card">
        <h2>三類動詞公式</h2>
        {GROUP_RULES.map((rule) => <article key={rule.title}><h3>{rule.title}</h3><p>{rule.body}</p></article>)}
      </section>
      <section className="guide-card">
        <h2>て形與た形對照表</h2>
        {TE_TA_RULES.map((rule) => <p key={rule.tails}><strong>{rule.tails}</strong>：{rule.te}／{rule.ta}，{rule.example}</p>)}
        <p className="warning">重要例外：行く → 行って／行った。</p>
      </section>
      <section className="guide-card">
        <h2>14 種形式一覽</h2>
        {FORM_DEFINITIONS.map((form) => <p key={form.id}><strong>{form.label}</strong>：{form.description}</p>)}
      </section>
    </>
  );
}
```

- [ ] **Step 4: Add dictionary cards and filters**

```tsx
// src/components/VerbCard.tsx
import { Link } from "react-router-dom";
import type { VerbEntry } from "../domain/types";

export function VerbCard({ verb }: { verb: VerbEntry }) {
  return (
    <Link className="verb-card" to={`/verbs/${verb.id}`}>
      <strong>{verb.dictionaryForm}</strong>
      <span>{verb.reading}</span>
      <small>{verb.meanings.join("、")} · {verb.jlptLevel} 參考</small>
    </Link>
  );
}
```

```tsx
// src/pages/DictionaryPage.tsx
import { useMemo, useState } from "react";
import { VerbCard } from "../components/VerbCard";
import { VERBS } from "../data/verbs";
import type { JlptLevel, VerbGroup } from "../domain/types";

export function DictionaryPage() {
  const [group, setGroup] = useState<VerbGroup | "all">("all");
  const [jlpt, setJlpt] = useState<JlptLevel | "all">("all");
  const [tail, setTail] = useState("all");
  const [tag, setTag] = useState("all");
  const [exceptionsOnly, setExceptionsOnly] = useState(false);
  const [query, setQuery] = useState("");
  const tags = [...new Set(VERBS.flatMap((verb) => verb.tags))].sort();
  const verbs = useMemo(() => VERBS.filter((verb) =>
    (group === "all" || verb.group === group) &&
    (jlpt === "all" || verb.jlptLevel === jlpt) &&
    (tail === "all" || verb.reading.endsWith(tail)) &&
    (tag === "all" || verb.tags.includes(tag)) &&
    (!exceptionsOnly || verb.isException) &&
    (!query || [verb.dictionaryForm, verb.reading, ...verb.meanings].some((value) => value.includes(query.trim())))
  ), [exceptionsOnly, group, jlpt, query, tag, tail]);

  return (
    <>
      <header className="page-heading"><p className="eyebrow">DICTIONARY</p><h1>動詞字典</h1><p>{verbs.length} 個結果</p></header>
      <section className="filter-bar" aria-label="字典篩選">
        <input aria-label="篩選關鍵字" onChange={(event) => setQuery(event.target.value)} placeholder="漢字、假名或繁中意思" value={query} />
        <select aria-label="動詞分類" onChange={(event) => setGroup(event.target.value as VerbGroup | "all")} value={group}>
          <option value="all">全部分類</option><option value="godan">五段動詞</option><option value="ichidan">一段動詞</option><option value="irregular">不規則動詞</option>
        </select>
        <select aria-label="JLPT 參考級別" onChange={(event) => setJlpt(event.target.value as JlptLevel | "all")} value={jlpt}>
          <option value="all">全部級別</option><option value="N5">N5 參考</option><option value="N4">N4 參考</option><option value="N3">N3 參考</option><option value="N2">N2 參考</option><option value="N1">N1 參考</option>
        </select>
        <select aria-label="辭書形字尾" onChange={(event) => setTail(event.target.value)} value={tail}>
          <option value="all">全部字尾</option>{["う", "く", "ぐ", "す", "つ", "ぬ", "ぶ", "む", "る"].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select aria-label="主題標籤" onChange={(event) => setTag(event.target.value)} value={tag}>
          <option value="all">全部主題</option>{tags.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <label><input checked={exceptionsOnly} onChange={(event) => setExceptionsOnly(event.target.checked)} type="checkbox" />只顯示常見例外</label>
      </section>
      <div className="verb-grid">{verbs.map((verb) => <VerbCard key={verb.id} verb={verb} />)}</div>
    </>
  );
}
```

- [ ] **Step 5: Add the confirmed detail route**

Append to `src/pages/LookupPage.tsx`:

```tsx
import { useParams } from "react-router-dom";
import { VERBS } from "../data/verbs";

export function VerbPage() {
  const { verbId } = useParams();
  const verb = VERBS.find((entry) => entry.id === verbId);
  if (!verb) return <><h1>找不到這個動詞</h1><p>請回到動詞字典重新選擇。</p></>;
  return <><StatusBadge kind="confirmed" /><VerbDetail verb={verb} /></>;
}
```

Replace the guide and dictionary stubs:

```tsx
// src/router.tsx
import { DictionaryPage } from "./pages/DictionaryPage";
import { GuidePage } from "./pages/GuidePage";
import { LookupPage, VerbPage } from "./pages/LookupPage";

// inside children:
{ path: "/guide", element: <GuidePage /> },
{ path: "/dictionary", element: <DictionaryPage /> },
{ path: "/lookup", element: <LookupPage /> },
{ path: "/verbs/:verbId", element: <VerbPage /> },
```

- [ ] **Step 6: Run route tests**

Run:

```bash
npm test -- src/router.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit guide and dictionary**

```bash
git add src/data/guideSections.ts src/components/VerbCard.tsx src/pages/GuidePage.tsx src/pages/DictionaryPage.tsx src/pages/LookupPage.tsx src/router.tsx src/router.test.tsx
git commit -m "feat: add guide and filterable verb dictionary"
```

## Task 5: Generate Concise Practice Questions

**Files:**
- Create: `src/domain/practice.ts`
- Create: `src/domain/practice.test.ts`

- [ ] **Step 1: Write failing practice tests**

```ts
// src/domain/practice.test.ts
import { describe, expect, it } from "vitest";
import { buildPracticeQuestion } from "./practice";

describe("buildPracticeQuestion", () => {
  it("generates a group question from confirmed data", () => {
    const question = buildPracticeQuestion(() => 0, "group");
    expect(question.kind).toBe("group");
    expect(question.options).toContain(question.answer);
    expect(question.source).toBe("confirmed");
  });

  it("generates a form question with four distinct options", () => {
    const question = buildPracticeQuestion(() => 0.4, "form");
    expect(question.kind).toBe("form");
    expect(new Set(question.options)).toHaveLength(4);
    expect(question.options).toContain(question.answer);
  });

  it("never asks for a non-applicable form", () => {
    for (let index = 0; index < 100; index += 1) {
      expect(buildPracticeQuestion(() => index / 100, "form").answer).not.toBe("通常不使用");
    }
  });
});
```

Run:

```bash
npm test -- src/domain/practice.test.ts
```

Expected: FAIL because `src/domain/practice.ts` does not exist.

- [ ] **Step 2: Implement deterministic quiz generation**

```ts
// src/domain/practice.ts
import { FORM_DEFINITIONS } from "../data/forms";
import { VERBS } from "../data/verbs";
import { conjugate } from "./conjugate";

export type PracticeQuestion = {
  kind: "group" | "form";
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  source: "confirmed";
};

const groupLabels = { godan: "五段動詞", ichidan: "一段動詞", irregular: "不規則動詞" };
const pick = <T,>(items: T[], random: () => number) => items[Math.floor(random() * items.length) % items.length];
const unique = (items: string[]) => [...new Set(items)];
const rotate = <T,>(items: T[], random: () => number) => {
  const offset = Math.floor(random() * items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
};

export const buildPracticeQuestion = (
  random: () => number = Math.random,
  requestedKind?: PracticeQuestion["kind"],
): PracticeQuestion => {
  const verb = pick(VERBS, random);
  const kind = requestedKind ?? (random() < 0.5 ? "group" : "form");
  if (kind === "group") {
    const answer = groupLabels[verb.group];
    return {
      kind,
      prompt: `${verb.dictionaryForm}（${verb.reading}）屬於哪一類動詞？`,
      options: rotate(Object.values(groupLabels), random),
      answer,
      explanation: `${verb.dictionaryForm} 是${answer}。`,
      source: "confirmed",
    };
  }

  const availableForms = FORM_DEFINITIONS.filter((form) => !["dictionary", "prohibitive"].includes(form.id))
    .filter((form) => conjugate(verb)[form.id].status !== "not-applicable");
  const form = pick(availableForms, random);
  const answer = conjugate(verb)[form.id].surface!;
  const distractors = unique(VERBS.flatMap((entry) => {
    const candidate = conjugate(entry)[form.id];
    return candidate.status === "not-applicable" || !candidate.surface ? [] : [candidate.surface];
  }).filter((value) => value !== answer)).slice(0, 3);
  return {
    kind,
    prompt: `${verb.dictionaryForm} 的${form.label}是哪一個？`,
    options: rotate([answer, ...distractors], random),
    answer,
    explanation: `${verb.dictionaryForm} 的${form.label}是 ${answer}。`,
    source: "confirmed",
  };
};
```

- [ ] **Step 3: Run practice tests**

Run:

```bash
npm test -- src/domain/practice.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit question generation**

```bash
git add src/domain/practice.ts src/domain/practice.test.ts
git commit -m "feat: generate concise practice questions"
```

## Task 6: Add The Practice Page

**Files:**
- Create: `src/pages/PracticePage.tsx`
- Modify: `src/router.tsx`
- Modify: `src/router.test.tsx`

- [ ] **Step 1: Write a failing practice interaction test**

Append:

```tsx
// src/router.test.tsx
it("shows immediate feedback after answering a practice question", async () => {
  const user = userEvent.setup();
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/practice"] })} />);
  expect(screen.getByRole("heading", { name: "快速練習" })).toBeInTheDocument();
  await user.click(screen.getAllByRole("button", { name: /五段動詞|一段動詞|不規則動詞|.+/ })[0]);
  expect(screen.getByText(/正確答案/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "下一題" })).toBeInTheDocument();
});
```

Run:

```bash
npm test -- src/router.test.tsx
```

Expected: FAIL because practice is still a stub.

- [ ] **Step 2: Build the stateless practice page**

```tsx
// src/pages/PracticePage.tsx
import { useState } from "react";
import { buildPracticeQuestion } from "../domain/practice";

export function PracticePage() {
  const [question, setQuestion] = useState(() => buildPracticeQuestion());
  const [selected, setSelected] = useState<string | null>(null);

  const next = () => {
    setQuestion(buildPracticeQuestion());
    setSelected(null);
  };

  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">PRACTICE</p>
        <h1>快速練習</h1>
        <p>題目只使用已核對資料，不記錄進度，隨時都能重新開始。</p>
      </header>
      <section className="practice-card">
        <h2>{question.prompt}</h2>
        <div className="option-grid">
          {question.options.map((option) => (
            <button disabled={selected !== null} key={option} onClick={() => setSelected(option)}>
              {option}
            </button>
          ))}
        </div>
        {selected && (
          <div className={selected === question.answer ? "feedback correct" : "feedback incorrect"}>
            <strong>{selected === question.answer ? "答對了" : `正確答案：${question.answer}`}</strong>
            <p>{question.explanation}</p>
            <button onClick={next}>下一題</button>
          </div>
        )}
      </section>
    </>
  );
}
```

Replace the practice stub:

```tsx
// src/router.tsx
import { PracticePage } from "./pages/PracticePage";

// inside children:
{ path: "/practice", element: <PracticePage /> },
```

- [ ] **Step 3: Run route tests**

Run:

```bash
npm test -- src/router.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit practice UI**

```bash
git add src/pages/PracticePage.tsx src/router.tsx src/router.test.tsx
git commit -m "feat: add stateless quick practice page"
```

## Task 7: Add Responsive Styling And Cloudflare Pages Fallback

**Files:**
- Modify: `src/styles.css`
- Create: `public/_redirects`
- Modify: `index.html`

- [ ] **Step 1: Add the static SPA redirect**

```text
# public/_redirects
/* /index.html 200
```

- [ ] **Step 2: Add complete responsive styles**

Replace `src/styles.css` with a cohesive style sheet that defines these existing classes:

```css
:root { color: #172033; background: #f6f8fc; font-family: Inter, "Noto Sans TC", "Noto Sans JP", system-ui, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; }
a { color: inherit; text-decoration: none; }
button, input, select { font: inherit; }
.content { width: min(72rem, calc(100% - 2rem)); margin: 0 auto; }
.site-header { position: sticky; top: 0; z-index: 10; background: #111827; color: white; box-shadow: 0 1px 12px #0f172a22; }
.header-inner, nav, .brand, .search-box, .filter-bar, .reading-prompt { display: flex; align-items: center; gap: .8rem; }
.header-inner { justify-content: space-between; min-height: 4.5rem; }
nav a { padding: .45rem .55rem; color: #cbd5e1; }
nav a.active { color: white; border-bottom: 2px solid #818cf8; }
.brand { font-weight: 800; }
.page-content { padding: 3rem 0 5rem; }
.hero { padding: 3rem 0; max-width: 52rem; }
.hero h1, .page-heading h1, .verb-detail h1 { margin: .25rem 0 .75rem; color: #111827; font-size: clamp(2rem, 6vw, 4.4rem); line-height: 1.08; }
.eyebrow { color: #4f46e5; font-size: .75rem; font-weight: 800; letter-spacing: .16em; }
.muted, .reading { color: #64748b; }
.search-box { margin: 1.5rem 0 .8rem; padding: .65rem; background: white; border: 1px solid #dbe2ee; border-radius: 1rem; box-shadow: 0 10px 28px #33415512; }
.search-box input { min-width: 0; flex: 1; border: 0; outline: 0; }
button, .search-box button { cursor: pointer; border: 0; border-radius: .7rem; padding: .7rem 1rem; background: #4f46e5; color: white; font-weight: 700; }
button:disabled { cursor: default; opacity: .65; }
.feature-grid, .verb-grid, .form-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); }
.feature-card, .verb-card, .guide-card, .form-card, .practice-card { padding: 1.1rem; background: white; border: 1px solid #e2e8f0; border-radius: 1rem; box-shadow: 0 8px 20px #3341550d; }
.feature-card, .verb-card { display: grid; gap: .4rem; }
.guide-stack { display: grid; gap: 1rem; }
.filter-bar { flex-wrap: wrap; margin: 1rem 0; }
.filter-bar input, .filter-bar select { min-height: 2.7rem; padding: .55rem .7rem; border: 1px solid #cbd5e1; border-radius: .65rem; background: white; }
.reading-prompt { flex-wrap: wrap; margin: 1rem 0; }
.reading-prompt label { display: grid; gap: .35rem; }
.reading-prompt input { min-height: 2.7rem; padding: .55rem .7rem; border: 1px solid #cbd5e1; border-radius: .65rem; background: white; }
.status-badge { display: inline-block; padding: .35rem .6rem; border-radius: 999px; font-size: .78rem; font-weight: 800; }
.status-badge.confirmed { color: #166534; background: #dcfce7; }
.status-badge.assisted { color: #92400e; background: #fef3c7; }
.status-badge.heuristic { color: #9a3412; background: #ffedd5; }
.warning, .note { color: #9a3412; }
.verb-detail header { margin: 1rem 0 1.4rem; }
.form-card { display: grid; gap: .35rem; }
.form-card h2, .form-card p { margin: 0; }
.form-card.not-applicable { background: #fff7ed; }
.option-grid { display: grid; gap: .7rem; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); margin: 1rem 0; }
.feedback { margin-top: 1rem; padding: 1rem; border-radius: .8rem; }
.feedback.correct { background: #dcfce7; }
.feedback.incorrect { background: #fee2e2; }
@media (max-width: 44rem) { .header-inner { align-items: flex-start; flex-direction: column; padding: .8rem 0; } nav { width: 100%; overflow-x: auto; } .page-content { padding-top: 2rem; } }
```

- [ ] **Step 3: Verify build output includes `_redirects`**

Run:

```bash
npm run build
test -f dist/_redirects
```

Expected: both commands exit `0`.

- [ ] **Step 4: Commit deployment-ready styling**

```bash
git add src/styles.css public/_redirects index.html
git commit -m "feat: add responsive theme and Pages fallback"
```

## Task 8: Document Local Use And Cloudflare Pages Deployment

**Files:**
- Create: `README.md`

- [ ] **Step 1: Add the README**

````md
# 日文動詞全解析系統

以繁體中文整理日文動詞分類、14 種實用變化、常見例外、查詢與快速練習。

## 本機執行

```bash
npm install
npm run dev
```

## 驗證

```bash
npm test
npm run build
```

## Cloudflare Pages

1. 將 repository push 到 GitHub。
2. 在 Cloudflare Pages 建立專案並連接 GitHub repository。
3. Build command 設為 `npm run build`。
4. Build output directory 設為 `dist`。
5. 部署成功後，在 Pages 專案中設定自訂網域。

每次 push 後，Cloudflare Pages 會自動重新建置與發布。

## 資料說明

- 第一批收錄 100 個日常常用動詞。
- JLPT 級別是參考標籤，不是 JLPT 官方逐字分類。
- 已核對資料與陌生動詞推測會在畫面上明確區分。
- 推測結果仍可能未涵蓋所有例外，請再查字典。
````

- [ ] **Step 2: Run verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: tests PASS, production build succeeds, and diff check exits `0`.

- [ ] **Step 3: Commit documentation**

```bash
git add README.md
git commit -m "docs: explain local use and Cloudflare Pages deploy"
```

## Task 9: Browser QA

**Files:**
- Modify only files implicated by observed defects.

- [ ] **Step 1: Start the development server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite reports a local URL such as `http://127.0.0.1:5173`.

- [ ] **Step 2: Use the Browser plugin to verify desktop flow**

Check:

1. Open the home page.
2. Search `食べる`; verify the confirmed badge and 14 form cards.
3. Search `まぜる`; verify the inference warning remains visible.
4. Search `きる`; verify multiple confirmed candidates appear.
5. Open the dictionary; filter `不規則動詞`; verify `勉強する`.
6. Open the guide; verify classification and `て形 / た形` sections.
7. Answer one practice question and advance to the next.

Expected: all flows work without console errors.

- [ ] **Step 3: Use the Browser plugin to verify narrow viewport flow**

Check the same site at a mobile-sized viewport:

1. navigation remains usable;
2. search input and button fit without horizontal overflow;
3. form cards stack cleanly;
4. dictionary filters remain operable;
5. practice choices remain tappable.

Expected: no clipped text or inaccessible controls.

- [ ] **Step 4: Fix observed defects with a focused commit**

Run after any fix:

```bash
npm test
npm run build
git diff --check
```

Expected: all commands exit `0`.

Commit only if fixes were needed:

```bash
git add src public index.html
git commit -m "fix: resolve browser QA findings"
```

## Final Verification

Run:

```bash
npm test
npm run build
git status --short
```

Expected:

- all tests pass;
- Vite production build succeeds;
- `dist/_redirects` exists;
- browser QA passed on desktop and mobile-sized viewport;
- no generated output is staged;
- the working tree contains only intentional changes.

## Publish Handoff

After both plans pass verification:

1. Create or connect the GitHub repository.
2. Push the current branch.
3. Connect the repository to Cloudflare Pages.
4. Set build command to `npm run build`.
5. Set output directory to `dist`.
6. Add the user's custom domain in Cloudflare Pages.

Use the GitHub and Cloudflare tools during this handoff. Authentication and the chosen repository name must be confirmed with the user immediately before publishing.
