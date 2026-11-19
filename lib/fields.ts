export type Field = {
  name: string;
  label: string;
  description?: string;
  required: boolean;
  inputMode?: "text" | "numeric";
};

export const FORM_TITLE = "新客  刺青預約諮詢  申請表";
export const FORM_ICON = "👹";

export const FIELDS: Field[] = [
  { name: "name", label: "姓名", required: true },
  { name: "age", label: "年紀", description: "(需年滿20歲)", required: true, inputMode: "numeric" },
  { name: "occupation", label: "職業", required: true },
  { name: "theme", label: "刺青主題", required: true },
  { name: "placement", label: "刺青部位", required: true },
  { name: "size", label: "預估尺寸", required: true },
  { name: "budget", label: "心理預算", required: true },
];

export const UPLOAD = {
  name: "references",
  label: "參考圖片連結",
  maxFileSize: 5 * 1024 * 1024,
  maxFiles: 20,
};

export const MIN_AGE = 20;

/** Shared validation used by both the browser and the API route. */
export function validate(values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of FIELDS) {
    if (f.required && !values[f.name]?.trim()) errors[f.name] = "此為必填欄位";
  }
  const age = values.age?.trim();
  if (age && !errors.age) {
    const n = Number(age);
    if (!/^\d+$/.test(age)) errors.age = "請輸入數字";
    else if (n < MIN_AGE) errors.age = `需年滿 ${MIN_AGE} 歲才能預約`;
  }
  return errors;
}
