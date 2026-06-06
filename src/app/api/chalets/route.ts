import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || "";
  const location = searchParams.get("location") || "";

  const chalets = await prisma.chalet.findMany({
    where: {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { city: { contains: search } },
          { location: { contains: search } },
        ],
      }),
      ...(city && { city: { contains: city } }),
      ...(location && { location: { contains: location } }),
    },
    include: {
      images: { orderBy: { order: "asc" } },
      amenities: true,
      host: { select: { name: true, email: true } },
      pricingDays: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(chalets);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "HOST") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const userId = (session.user as any).id;

    const chalet = await prisma.chalet.create({
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
        hostId: userId,
        images: {
          create: data.images?.map((url: string, i: number) => ({ url, order: i })) || [],
        },
        amenities: {
          create: data.amenities?.map((name: string) => ({ name })) || [],
        },
        pricingDays: {
          create: data.pricingDays || [],
        },
        specialPrices: {
          create: data.specialPrices?.map((sp: any) => ({
            ...sp,
            fromDate: new Date(sp.fromDate),
            toDate: new Date(sp.toDate),
          })) || [],
        },
        discounts: {
          create: data.discounts?.map((d: any) => ({
            ...d,
            fromDate: new Date(d.fromDate),
            toDate: new Date(d.toDate),
          })) || [],
        },
      },
      include: { images: true, amenities: true, pricingDays: true },
    });

    return NextResponse.json(chalet);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
