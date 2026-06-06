import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const chalet = await prisma.chalet.findUnique({ where: { id } });
  if (!chalet || chalet.hostId !== (session.user as any).id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { date, period } = await req.json();

  const blocked = await prisma.blockedSlot.create({
    data: { date: new Date(date), period, chaletId: id },
  });

  return NextResponse.json(blocked);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const { slotId } = await req.json();

  await prisma.blockedSlot.deleteMany({ where: { id: slotId, chaletId: id } });

  return NextResponse.json({ success: true });
}
