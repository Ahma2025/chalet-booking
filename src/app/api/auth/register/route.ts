import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, phone } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقاً" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role === "HOST" ? "HOST" : "GUEST",
        phone,
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch {
    return NextResponse.json({ error: "حدث خطأ، حاول مجدداً" }, { status: 500 });
  }
}
