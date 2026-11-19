# 新客 刺青預約諮詢 申請表

仿 Notion 表單樣式的刺青預約諮詢表單（Next.js）。

## 啟動

```bash
npm install
npm run dev      # http://localhost:3000
```

## 結構

- `lib/fields.ts`：表單標題、圖示、欄位、上傳限制（改這裡就能增減題目）
- `app/BookingForm.tsx`：表單畫面
- 送出：透過 FormSubmit 把申請內容與參考圖寄到 `lib/fields.ts` 的 `FORMSUBMIT_TARGET`
- 部署：push 到 main 後由 GitHub Actions 自動發佈到 GitHub Pages
- `public/cover.jpg`：放一張封面圖就會自動套用（沒放則顯示漸層）
