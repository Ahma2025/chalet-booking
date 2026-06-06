import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const chalet = await prisma.chalet.findUnique({ where: { id } });
  if (!chalet || chalet.hostId !== (session.user as any).id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { pricingDays, specialPrices, discounts } = await req.json();

  await prisma.$transaction([
    prisma.dayPricing.deleteMany({ where: { chaletId: id } }),
    prisma.specialPrice.deleteMany({ where: { chaletId: id } }),
    prisma.discount.deleteMany({ where: { chaletId: id } }),
    prisma.dayPricing.createMany({
      data: pricingDays.map((d: any) => ({ ...d, chaletId: id })),
    }),
    ...(specialPrices?.length
      ? [prisma.specialPrice.createMany({
          data: specialPrices.map((s: any) => ({
            ...s,
            fromDate: new Date(s.fromDate),
            toDate: new Date(s.toDate),
            chaletId: id,
          })),
        })]
      : []),
    ...(discounts?.length
      ? [prisma.discount.createMany({
          data: discounts.map((d: any) => ({
            ...d,
            fromDate: new Date(d.fromDate),
            toDate: new Date(d.toDate),
            chaletId: id,
          })),
        })]
      : []),
  ]);

  return NextResponse.json({ success: true });
}
