import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });

  try {
    const { chaletId, date, period, totalPrice, guestName, guestPhone, guestAddress } =
      await req.json();

    const bookingDate = new Date(date);
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);

    const existingBooking = await prisma.booking.findFirst({
      where: {
        chaletId,
        date: bookingDate,
        period,
        status: { in: ["PENDING", "CONFIRMED"] },
        expiresAt: { gt: new Date() },
      },
    });

    if (existingBooking) {
      return NextResponse.json({ error: "هذا الموعد محجوز بالفعل" }, { status: 400 });
    }

    const blockedSlot = await prisma.blockedSlot.findFirst({
      where: {
        chaletId,
        date: bookingDate,
        OR: [{ period }, { period: "FULL_DAY" }],
      },
    });

    if (blockedSlot) {
      return NextResponse.json({ error: "هذا الموعد غير متاح" }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        chaletId,
        userId: (session.user as any).id,
        date: bookingDate,
        period,
        totalPrice,
        guestName,
        guestPhone,
        guestAddress,
        status: "PENDING",
        expiresAt,
      },
      include: {
        chalet: { select: { name: true, coverImage: true, location: true } },
      },
    });

    return NextResponse.json(booking);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role === "HOST") {
    const chalets = await prisma.chalet.findMany({ where: { hostId: userId }, select: { id: true } });
    const chaletIds = chalets.map((c) => c.id);

    const bookings = await prisma.booking.findMany({
      where: { chaletId: { in: chaletIds } },
      include: {
        chalet: { select: { name: true, coverImage: true } },
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  }

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { chalet: { select: { name: true, coverImage: true, location: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}
