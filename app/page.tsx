import BookingForm from "./BookingForm";
import { FORM_ICON, FORM_TITLE, BASE_PATH } from "@/lib/fields";

export default function Page() {
  return (
    <main>
      {/* 封面：放一張 public/cover.jpg 就會自動套用，沒有則顯示漸層 */}
      <div className="cover" style={{ backgroundImage: `url(${BASE_PATH}/cover.jpg), var(--cover-gradient)` }} />
      <div className="page">
        <div className="icon" aria-hidden>{FORM_ICON}</div>
        <h1 className="title">{FORM_TITLE}</h1>
        <BookingForm />
      </div>
    </main>
  );
}
