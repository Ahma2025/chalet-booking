import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const chalets = await prisma.chalet.findMany({
    where: { hostId: (session.user as any).id },
    include: {
      images: { orderBy: { order: "asc" } },
      amenities: true,
      pricingDays: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(chalets);
}
