import { FORM_ICON, FORM_TITLE, BASE_PATH } from "@/lib/fields";

export default function Thanks() {
  return (
    <main>
      <div className="cover" style={{ backgroundImage: `url(${BASE_PATH}/cover.jpg), var(--cover-gradient)` }} />
      <div className="page">
        <div className="icon" aria-hidden>{FORM_ICON}</div>
        <h1 className="title">{FORM_TITLE}</h1>
        <div className="done">
          <p className="done-title">已收到你的回覆 🙏</p>
          <p className="done-text">我們會盡快與你聯繫，討論刺青細節與預約時間。</p>
          <a className="secondary-btn" href={`${BASE_PATH}/`}>再填寫一份</a>
        </div>
      </div>
    </main>
  );
}
