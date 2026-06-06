import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "لا يوجد ملف" }, { status: 400 });

    // إذا في Cloudinary مضبوط استخدمه
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== "your_api_key") {
      const cloudinary = (await import("@/lib/cloudinary")).default;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64, {
        folder: "chalets",
        resource_type: "auto",
      });
      return NextResponse.json({ url: result.secure_url });
    }

    // وإلا احفظ الصورة محلياً في public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "فشل الرفع" }, { status: 500 });
  }
}
