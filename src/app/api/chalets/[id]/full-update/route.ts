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

  const data = await req.json();

  // حذف القديم وإعادة الإنشاء
  await prisma.chaletImage.deleteMany({ where: { chaletId: id } });
  await prisma.amenity.deleteMany({ where: { chaletId: id } });
  await prisma.dayPricing.deleteMany({ where: { chaletId: id } });
  await prisma.specialPrice.deleteMany({ where: { chaletId: id } });
  await prisma.discount.deleteMany({ where: { chaletId: id } });

  // إنشاء الجديد
  await prisma.chalet.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      location: data.location,
      city: data.city,
      mapUrl: data.mapUrl || null,
      phone: data.phone || null,
      instagram: data.instagram || null,
      facebook: data.facebook || null,
      whatsapp: data.whatsapp || null,
      coverImage: data.coverImage || null,
      videoUrl: data.videoUrl || null,
      images: {
        create: (data.images || []).map((url: string, i: number) => ({ url, order: i + 1 })),
      },
      amenities: {
        create: (data.amenities || []).map((name: string) => ({ name })),
      },
      pricingDays: {
        create: (data.pricingDays || []).map((d: any) => ({
          dayOfWeek: d.dayOfWeek,
          morningPrice: d.morningPrice,
          eveningPrice: d.eveningPrice,
          fullDayPrice: d.fullDayPrice,
        })),
      },
      specialPrices: {
        create: (data.specialPrices || []).map((s: any) => ({
          fromDate: new Date(s.fromDate),
          toDate: new Date(s.toDate),
          label: s.label || null,
          morningExtra: s.morningExtra || null,
          eveningExtra: s.eveningExtra || null,
          fullDayExtra: s.fullDayExtra || null,
        })),
      },
      discounts: {
        create: (data.discounts || []).map((d: any) => ({
          fromDate: new Date(d.fromDate),
          toDate: new Date(d.toDate),
          percentage: d.percentage,
        })),
      },
    },
  });

  return NextResponse.json({ success: true });
}
