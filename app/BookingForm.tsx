"use client";

import { useRef, useState } from "react";
import { FIELDS, UPLOAD, validate, FORMSUBMIT_TARGET, SITE_URL, BASE_PATH } from "@/lib/fields";

type Status = "idle" | "submitting";

export default function BookingForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [nextUrl, setNextUrl] = useState("");

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

    // 把選好的圖片放回檔案欄位，交給瀏覽器以 multipart 原生送出（FormSubmit 會當附件寄出）
    if (fileInput.current) {
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));
      fileInput.current.files = dt.files;
    }
    setNextUrl((SITE_URL || window.location.origin + BASE_PATH) + "/thanks/");
    setStatus("submitting");
    setSubmitError("");
    // 等 nextUrl 寫入 DOM 後再送出
    setTimeout(() => formRef.current?.submit(), 0);
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      action={`https://formsubmit.co/${FORMSUBMIT_TARGET}`}
      method="POST"
      encType="multipart/form-data"
    >
      <input type="hidden" name="_subject" value={`刺青預約諮詢：${values.name ?? ""}`} />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_next" value={nextUrl} />
      <input type="text" name="_honey" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
      {FIELDS.map((f) => (
        <div className="field" key={f.name}>
          <label htmlFor={f.name} className="label">
            {f.label}
            {f.required && <span className="required">*</span>}
          </label>
          {f.description && <div className="description">{f.description}</div>}
          <input
            id={f.name}
            name={f.label}
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
            name="attachment"
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
