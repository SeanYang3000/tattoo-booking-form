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
- `app/api/submit/route.ts`：接收提交，存到 `data/submissions.json`，圖片存到 `data/uploads/`
- `public/cover.jpg`：放一張封面圖就會自動套用（沒放則顯示漸層）
