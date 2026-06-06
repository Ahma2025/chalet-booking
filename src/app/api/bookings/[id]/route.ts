import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { chalet: true },
  });

  if (!booking) return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 });

  const userId = (session.user as any).id;
  const isHost = booking.chalet.hostId === userId;

  if (!isHost) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  if (action === "CONFIRM") {
    await prisma.booking.update({
      where: { id },
      data: { status: "CONFIRMED", expiresAt: null },
    });
    return NextResponse.json({ success: true, status: "CONFIRMED" });
  }

  if (action === "REJECT") {
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ success: true, status: "REJECTED" });
  }

  return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
}
