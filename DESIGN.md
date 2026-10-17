---
name: "Lumus · 日文動詞全解析"
description: "既有 Lumus 主題在日文查詢、活用、規則與練習工具的實作紀錄。"
colors:
  canvas: "#f5f2e9"
  surface: "#fffdf8"
  text: "#2d2b25"
  muted: "#696252"
  accent: "#87583a"
  on-accent: "#ffffff"
  rule: "#ccc5b8"
  control-line: "#696252"
  success: "#286342"
  success-surface: "#eef7f0"
  error: "#9c392b"
  error-surface: "#fff1ed"
  warning: "#785215"
  warning-surface: "#fff6e5"
typography:
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Hiragino Sans", "Noto Sans TC", "Noto Sans JP", sans-serif'
    fontSize: "17px"
    lineHeight: 1.9
  display:
    fontFamily: '"Iowan Old Style", "Songti TC", "Hiragino Mincho ProN", "Noto Serif TC", "Noto Serif JP", serif'
    fontSize: "clamp(36px, 3.8vw, 51px)"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "-0.025em"
  headline:
    fontFamily: '"Iowan Old Style", "Songti TC", "Hiragino Mincho ProN", "Noto Serif TC", "Noto Serif JP", serif'
    fontSize: "clamp(32px, 3.6vw, 44px)"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "-0.025em"
  verb:
    fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif'
    fontSize: "26px"
    fontWeight: 500
    lineHeight: 1.9
rounded:
  control: "13px"
  status: "6px"
spacing:
  step-1: "8px"
  step-2: "16px"
  step-3: "24px"
  step-4: "40px"
  step-5: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.text}"
    textColor: "{colors.on-accent}"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  status-confirmed:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success}"
    rounded: "{rounded.status}"
    padding: "4px 10px"
  status-inferred:
    backgroundColor: "{colors.warning-surface}"
    textColor: "{colors.warning}"
    rounded: "{rounded.status}"
    padding: "4px 10px"
---

# Design System: Lumus · 日文動詞全解析

## Overview

**Creative North Star: "暖紙色、細線、留白"**，沿用已確認的 Lumus 設計語言。此文件記錄日文工具接入現況，沒有建立新的品牌或主題。共用規範以 Lumus 整合工作區內的 `design-system/agent-handoff/2026-10-17/DESIGN.md`、`current.theme.json`、`tokens.css` 和 `lumus-shell.css` 為上游權威；本檔的 frontmatter 是實作快照，不能用來反向改寫上游。

Theme ID：`843103f9-320a-4649-bea9-41a6202dc9cb`。Fingerprint：`42983c1e41f2ee914fe1861baffaa22c976401c2772bcb46ac56179360fb7cd4`。日文站實際載入 `public/design/tokens.css`、`public/design/lumus-shell.css`，再套用 `src/styles.css`。同步及獨立建置方式見 README。本機接入完成；本次日文站改版尚未部署。

**Key Characteristics:**

- 角落小字 Lumus、清楚的工具入口與可返回總入口的導覽。
- 日文明朝體內容與黑體控制介面，依語言及用途分配。
- 由真實動詞資料與既有活用引擎組成的示例、列表與表格。

## Colors

Primary 使用共用棕色 accent，承擔主要操作、目前導覽、焦點與文字連結；on-accent 用於實底操作上的文字。Neutral 以 canvas、surface 建立紙色層次，text 與 muted 區分資訊強弱，rule 作內容細線，control-line 作可操作邊界。確切值見 frontmatter，均對應同名 `--lx-*` 變數。

success／error／warning 及各自 surface 是獨立語意色：已核對、答對、答錯與推測警告均保留可讀文字。棕色不取代正誤語意。

## Typography

一般說明、導覽、按鈕及輸入使用共用系統黑體；中文標題使用共用襯線 stack；動詞、讀音、活用與 `lang="ja"` 內容使用日文明朝體 stack。表格資料格也明確使用日文 stack。**實際字體依裝置可用字型及 fallback 而定，font stack 不保證裝置最後選中的字體。** 本站沒有新增遠端字型。

frontmatter 的 display 為首頁 H1、headline 為一般頁面 H1、verb 為活用結果。手機首頁 H1 為 34px，內頁 H1 為 32px，活用結果為 22px；字典詞條為桌機 27px／手機 24px。導覽為桌機 14px／手機 13px。保留 ruby 與讀音的額外空間；不要把所有日文內容改成 UI 字級。

## Layout

共用容器最大 1120px，桌機寬度為視窗減 72px；759px 以下為視窗減 36px。正文上下留白為桌機 48px／88px、手機 32px／56px。沿用 frontmatter 的共用間距，元件另有符合內容的局部數值。

首頁為查詢與活用示例雙欄（1.15:0.85），手機自然堆疊；下方入口採細線橫列。字典與活用區使用可伸縮網格，手機均為兩欄。練習內容最大 880px、答案兩欄。規則文章以段落與細線分節，主要段落最大 70ch。不同內容保留自己的構圖。

四個規則表格最小寬度為 44rem，僅表格容器水平捲動；手機顯示捲動提示。容器可用鍵盤聚焦並左右捲動。759px 以下調整頁首、篩選與字級，760–959px 另縮減導覽間距並隱藏重複站名。

## Elevation & Depth

本站沒有陰影系統。紙色表面、細線、留白與字級建立層次；字典詞條及活用區以分隔線組織內容，沒有浮起卡片。主要按鈕僅以共用 duration（160ms）轉換背景、文字與邊線色；減少動態偏好將 duration 設為 0ms。總入口的畫牆、捲動縮放及自動微動不延伸到學習內頁。

## Shapes

控制元件沿用 control 圓角；狀態標籤使用較小的 status 圓角。內容細線與控制邊界均為 1px，保留各自顏色用途。示例與文字清單保留平直分隔線。共用操作圖示使用 `LumusIcon` 內的 24×24 SVG、1.5 描邊，本站實際顯示為 20px。

## Components

- **導覽與頁框：** sticky 頁首保留小字 Lumus 與四個站內入口；目前頁面及 hover 使用 accent 與底線。手機導覽換到第二列。跳至內容連結在聚焦時顯示。路徑或查詢參數改變後捲至頂部，焦點移交 main；頁尾提供返回總入口連結。
- **查詢與欄位：** 查詢框由圖示、伸縮輸入與查詢按鈕組成；整框 focus-within 顯示焦點。提交非空查詢後進入 lookup。篩選欄保留文字、分類、參考級別、字尾、主題及例外條件，結果數使用 live region；沒有結果時提供文字說明。
- **操作：** 主要按鈕使用 frontmatter 的實底變體，hover 轉 text 色；主要控制最小高度 44px。共用 focus-visible 為 accent 的 2px outline、4px offset。詞條前後導覽為 48×44px，保留可讀的 aria-label。
- **詞條與活用：** 字典每列顯示動詞、讀音與意義／參考級別；hover 強調動詞。詳情依既有 `FORM_DEFINITIONS` 顯示 14 種形式，保留不適用說明與註記。首頁四種示例來自同一活用引擎。
- **資料狀態：** 標籤明示「已核對資料」、「例外庫輔助推測」或「規則推測」。推測結果同時保留警告正文；不把推測呈現為已核對結果。
- **練習：** 模式以 aria-pressed 呈現選取；範圍使用 checkbox，至少保留一項。選答後停用本題選項，以語意色及文字回報正誤，下一題重設選答。原有混合、變化形及分類模式與題目邏輯維持；不記錄學習進度。

## Do's and Don'ts

- **Do** 沿用上游主題與頁框，以真實內容安排各頁構圖。
- **Do** 保留語言標記、日文讀音、可見焦點、44px 主要控制及手機表格提示。
- **Do** 同時用文字與語意色表達推測及練習狀態。
- **Don't** 用通用視覺偏好覆蓋已確認的暖紙配色與逐頁字體方向。
- **Don't** 修改資料 ID、活用規則或既有學習行為來配合外觀。
- **Don't** 把本機設計接入或審查通過視為正式站已更新。
