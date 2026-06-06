import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chalet = await prisma.chalet.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      amenities: true,
      pricingDays: { orderBy: { dayOfWeek: "asc" } },
      specialPrices: true,
      discounts: true,
      blockedSlots: true,
      bookings: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
        select: { id: true, date: true, period: true, status: true, expiresAt: true, guestName: true, guestPhone: true, guestAddress: true, totalPrice: true, user: { select: { name: true, phone: true } } },
      },
      host: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!chalet) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  return NextResponse.json(chalet);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const chalet = await prisma.chalet.findUnique({ where: { id } });
  if (!chalet || chalet.hostId !== (session.user as any).id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const data = await req.json();

  await prisma.chalet.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      location: data.location,
      city: data.city,
      mapUrl: data.mapUrl,
      phone: data.phone,
      instagram: data.instagram,
      facebook: data.facebook,
      whatsapp: data.whatsapp,
      coverImage: data.coverImage,
      videoUrl: data.videoUrl,
    },
  });

  return NextResponse.json({ success: true });
}
