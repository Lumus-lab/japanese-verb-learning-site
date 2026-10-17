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

## Lumus 外觀

採用共用主題 `843103f9-320a-4649-bea9-41a6202dc9cb`：暖紙色、細線、棕色操作、日文明朝體與系統黑體介面。頁首與頁尾都可回到 Lumus 總入口。查詢、字典、規則、活用表與練習沿用同一套外觀；動詞資料、變化規則與 ID 保持不變。

`public/design/` 是建置會使用的固定設計快照。`npm run design:sync` 會讀取相鄰的 `../design-system/`；獨立 checkout 或 Cloudflare Pages 沒有共用來源時，會驗證並沿用已保存的快照，因此可獨立建置。亦可指定來源：

```sh
LUMUS_DESIGN_DIR='/path/to/design-system' npm run design:sync
```

`predev`、`prebuild` 會自動執行同步／驗證。`version.json` 記錄 theme ID、fingerprint 與 CSS 校驗碼；公開資產不包含工作台草稿、備註及版本庫。改選共用主題後，仍須同步、建置及部署才會更新公開網站。

## 資料說明

- 第一批收錄 100 個日常常用動詞。
- JLPT 級別是參考標籤，不是 JLPT 官方逐字分類。
- 已核對資料與陌生動詞推測會在畫面上明確區分。
- 推測結果仍可能未涵蓋所有例外，請再查字典。
