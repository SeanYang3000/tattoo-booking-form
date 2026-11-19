"use client";

import { useRef, useState } from "react";
import { FIELDS, UPLOAD, validate } from "@/lib/fields";

type Status = "idle" | "submitting" | "done";

export default function BookingForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function update(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFileError("");
    const incoming = Array.from(list);
    const tooBig = incoming.filter((f) => f.size > UPLOAD.maxFileSize);
    const ok = incoming.filter((f) => f.size <= UPLOAD.maxFileSize);
    const merged = [...files, ...ok].slice(0, UPLOAD.maxFiles);
    if (tooBig.length) setFileError(`有 ${tooBig.length} 個檔案超過 5 MB，已略過。`);
    else if (files.length + ok.length > UPLOAD.maxFiles) setFileError(`最多只能上傳 ${UPLOAD.maxFiles} 個檔案。`);
    setFiles(merged);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      const first = FIELDS.find((f) => errs[f.name]);
      if (first) document.getElementById(first.name)?.focus();
      return;
    }

    setStatus("submitting");
    setSubmitError("");
    const body = new FormData();
    for (const f of FIELDS) body.append(f.name, values[f.name] ?? "");
    for (const file of files) body.append(UPLOAD.name, file);

    try {
      const res = await fetch("/api/submit", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message || "提交失敗，請稍後再試。");
      }
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError((err as Error).message);
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="done">
        <p className="done-title">已收到你的回覆 🙏</p>
        <p className="done-text">我們會盡快與你聯繫，討論刺青細節與預約時間。</p>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => {
            setValues({});
            setFiles([]);
            setStatus("idle");
          }}
        >
          再填寫一份
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {FIELDS.map((f) => (
        <div className="field" key={f.name}>
          <label htmlFor={f.name} className="label">
            {f.label}
            {f.required && <span className="required">*</span>}
          </label>
          {f.description && <div className="description">{f.description}</div>}
          <input
            id={f.name}
            name={f.name}
            className={`input${errors[f.name] ? " input-error" : ""}`}
            placeholder="你的回答"
            inputMode={f.inputMode}
            value={values[f.name] ?? ""}
            onChange={(e) => update(f.name, e.target.value)}
            aria-invalid={!!errors[f.name]}
          />
          {errors[f.name] && <div className="error">{errors[f.name]}</div>}
        </div>
      ))}

      <div className="field">
        <div className="label">{UPLOAD.label}</div>
        <div className="upload-box">
          <button type="button" className="upload-btn" onClick={() => fileInput.current?.click()}>
            <UploadIcon />
            上傳
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => addFiles(e.target.files)}
          />
          {files.length > 0 && (
            <ul className="file-list">
              {files.map((file, i) => (
                <li key={`${file.name}-${i}`}>
                  <span className="file-name">{file.name}</span>
                  <button
                    type="button"
                    className="file-remove"
                    aria-label={`移除 ${file.name}`}
                    onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="upload-hint">大小限制：5 MB。檔案限制：20。</div>
          {fileError && <div className="error">{fileError}</div>}
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={status === "submitting"}>
        {status === "submitting" ? "提交中…" : "提交"}
      </button>
      {submitError && <div className="error">{submitError}</div>}

      <p className="footer-note">切勿透過此表單提供敏感個人資訊，例如密碼。</p>
    </form>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M12 17v-6" />
      <path d="m9.5 13.5 2.5-2.5 2.5 2.5" />
    </svg>
  );
}
