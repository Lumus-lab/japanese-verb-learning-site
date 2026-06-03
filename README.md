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
