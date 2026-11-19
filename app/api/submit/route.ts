import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { FIELDS, UPLOAD, validate } from "@/lib/fields";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const DB_FILE = path.join(DATA_DIR, "submissions.json");

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ message: "表單格式錯誤" }, { status: 400 });
  }

  const values: Record<string, string> = {};
  for (const f of FIELDS) values[f.name] = String(form.get(f.name) ?? "").trim().slice(0, 1000);

  const errors = validate(values);
  if (Object.keys(errors).length) {
    return NextResponse.json({ message: "請檢查必填欄位", errors }, { status: 400 });
  }

  const files = form.getAll(UPLOAD.name).filter((v): v is File => v instanceof File && v.size > 0);
  if (files.length > UPLOAD.maxFiles) {
    return NextResponse.json({ message: `最多只能上傳 ${UPLOAD.maxFiles} 個檔案` }, { status: 400 });
  }
  for (const file of files) {
    if (file.size > UPLOAD.maxFileSize) {
      return NextResponse.json({ message: `「${file.name}」超過 5 MB` }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: `「${file.name}」不是圖片檔` }, { status: 400 });
    }
  }

  const id = randomUUID();
  await mkdir(UPLOAD_DIR, { recursive: true });
  const savedFiles: string[] = [];
  for (const [i, file] of files.entries()) {
    const ext = path.extname(file.name).replace(/[^.a-zA-Z0-9]/g, "").slice(0, 8) || ".bin";
    const stored = `${id}-${i + 1}${ext}`;
    await writeFile(path.join(UPLOAD_DIR, stored), Buffer.from(await file.arrayBuffer()));
    savedFiles.push(stored);
  }

  const submissions = await readFile(DB_FILE, "utf8").then(JSON.parse).catch(() => []);
  submissions.push({ id, createdAt: new Date().toISOString(), ...values, references: savedFiles });
  await writeFile(DB_FILE, JSON.stringify(submissions, null, 2));

  return NextResponse.json({ ok: true, id });
}
