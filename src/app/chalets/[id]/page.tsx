export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Phone, MessageCircle, Link2, ExternalLink } from "lucide-react";
import { getDayName, formatPrice } from "@/lib/utils";
import BookingCalendar from "@/components/booking/BookingCalendar";
import PricingTable from "@/components/chalet/PricingTable";

export default async function ChaletDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chalet = await prisma.chalet.findUnique({
    where: { id, isActive: true },
    include: {
      images: { orderBy: { order: "asc" } },
      amenities: true,
      pricingDays: { orderBy: { dayOfWeek: "asc" } },
      specialPrices: true,
      discounts: true,
      blockedSlots: true,
      bookings: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
        select: { date: true, period: true, status: true, expiresAt: true },
      },
      host: { select: { name: true, phone: true } },
    },
  });

  if (!chalet) notFound();

  const allImages = [chalet.coverImage, ...chalet.images.map((i: { url: string }) => i.url)].filter(Boolean) as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden mb-8">
        {allImages[0] ? (
          <Image src={allImages[0]} alt={chalet.name} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-6xl">🏡</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-6 right-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">{chalet.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <MapPin className="w-4 h-4" />
            <span>{chalet.location}، {chalet.city}</span>
          </div>
        </div>
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2">
          {allImages.slice(1).map((img, i) => (
            <div key={i} className="relative w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden">
              <Image src={img} alt={`صورة ${i + 2}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {chalet.mapUrl && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" /> الموقع
                </h2>
              </div>
              <iframe
                src={chalet.mapUrl.replace("/maps/place", "/maps/embed/v1/place").replace("google.com/maps", "google.com/maps/embed")}
                width="100%"
                height="250"
                allowFullScreen
                loading="lazy"
                className="border-0"
              />
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-3">وصف الشاليه</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{chalet.description}</p>
          </div>

          {chalet.amenities.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">المرفقات والخدمات</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {chalet.amenities.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 bg-emerald-50 rounded-xl px-4 py-3 text-emerald-700 font-medium text-sm">
                    <span>✓</span> {a.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <PricingTable pricingDays={chalet.pricingDays} />

          {(chalet.phone || chalet.whatsapp || chalet.instagram || chalet.facebook) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">التواصل مع المضيف</h2>
              <div className="flex flex-wrap gap-3">
                {chalet.phone && (
                  <a href={`tel:${chalet.phone}`} className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-blue-100 transition-colors">
                    <Phone className="w-4 h-4" /> {chalet.phone}
                  </a>
                )}
                {chalet.whatsapp && (
                  <a href={`https://wa.me/${chalet.whatsapp}`} target="_blank" className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-green-100 transition-colors">
                    <MessageCircle className="w-4 h-4" /> واتساب
                  </a>
                )}
                {chalet.instagram && (
                  <a href={`https://instagram.com/${chalet.instagram}`} target="_blank" className="flex items-center gap-2 bg-pink-50 text-pink-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-pink-100 transition-colors">
                    <Link2 className="w-4 h-4" /> {chalet.instagram}
                  </a>
                )}
                {chalet.facebook && (
                  <a href={chalet.facebook} target="_blank" className="flex items-center gap-2 bg-indigo-50 text-indigo-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-indigo-100 transition-colors">
                    <ExternalLink className="w-4 h-4" /> فيسبوك
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <BookingCalendar
              chaletId={chalet.id}
              pricingDays={chalet.pricingDays.map((p) => ({
                dayOfWeek: p.dayOfWeek,
                morningPrice: p.morningPrice,
                eveningPrice: p.eveningPrice,
                fullDayPrice: p.fullDayPrice,
              }))}
              specialPrices={chalet.specialPrices.map((s) => ({
                fromDate: s.fromDate.toISOString(),
                toDate: s.toDate.toISOString(),
                label: s.label,
                morningExtra: s.morningExtra,
                eveningExtra: s.eveningExtra,
                fullDayExtra: s.fullDayExtra,
              }))}
              discounts={chalet.discounts.map((d) => ({
                fromDate: d.fromDate.toISOString(),
                toDate: d.toDate.toISOString(),
                percentage: d.percentage,
              }))}
              bookedSlots={chalet.bookings.map((b) => ({
                date: b.date.toISOString(),
                period: b.period,
                status: b.status,
                expiresAt: b.expiresAt?.toISOString() ?? null,
              }))}
              blockedSlots={chalet.blockedSlots.map((b) => ({
                date: b.date.toISOString(),
                period: b.period,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
