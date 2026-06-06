import { prisma } from "@/lib/prisma";
import HeroSlider from "@/components/shared/HeroSlider";
import ChaletCard from "@/components/chalet/ChaletCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Shield, Clock } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const chalets = await prisma.chalet.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { order: "asc" } },
      amenities: true,
      pricingDays: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const sliderChalets = chalets.slice(0, 6).map((c) => ({
    id: c.id,
    name: c.name,
    location: c.location,
    city: c.city,
    coverImage: c.coverImage,
  }));

  return (
    <div>
      <HeroSlider chalets={sliderChalets} />

      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: <Building2 className="w-7 h-7 text-emerald-600" />, title: "شاليهات مميزة", desc: "أفضل الشاليهات والفلل في المنطقة" },
            { icon: <Shield className="w-7 h-7 text-emerald-600" />, title: "حجز آمن", desc: "نظام حجز موثوق ومضمون 100%" },
            { icon: <Clock className="w-7 h-7 text-emerald-600" />, title: "تأكيد سريع", desc: "احصل على تأكيد حجزك خلال ساعات" },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">أحدث الشاليهات</h2>
            <p className="text-gray-500 mt-1">اكتشف أجمل الوجهات لإقامتك المثالية</p>
          </div>
          <Link href="/chalets">
            <Button variant="outline">عرض الكل</Button>
          </Link>
        </div>

        {chalets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏡</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد شاليهات بعد</h3>
            <p className="text-gray-500 mb-6">كن أول من يضيف شاليهه على المنصة!</p>
            <Link href="/register">
              <Button>أضف شاليهك الآن</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {chalets.slice(0, 8).map((chalet) => (
              <ChaletCard key={chalet.id} chalet={chalet} />
            ))}
          </div>
        )}

        {chalets.length > 0 && (
          <div className="text-center mt-10">
            <Link href="/chalets">
              <Button size="lg" className="px-10">استعرض كل الشاليهات</Button>
            </Link>
          </div>
        )}
      </section>

      <section className="bg-emerald-600 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">هل تملك شاليهاً؟</h2>
          <p className="text-emerald-100 text-lg mb-8">
            انضم إلى مئات المضيفين وابدأ بتحقيق دخل إضافي من شاليهك
          </p>
          <Link href="/register">
            <Button variant="outline" size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 border-0 font-bold px-10">
              أضف شاليهك مجاناً
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
