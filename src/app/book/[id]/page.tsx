"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice, getPeriodLabel } from "@/lib/utils";
import { Calendar, Clock, DollarSign, User, Phone, MapPin, CheckCircle } from "lucide-react";

export default function BookPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const date = searchParams.get("date");
  const period = searchParams.get("period");
  const price = searchParams.get("price");

  const [form, setForm] = useState({
    guestName: session?.user?.name || "",
    guestPhone: "",
    guestAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !period || !price) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chaletId: params.id,
        date,
        period,
        totalPrice: parseFloat(price),
        ...form,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/profile"), 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تم إرسال طلب الحجز!</h2>
          <p className="text-gray-500 mb-4">
            سيتم مراجعة طلبك من قبل المضيف خلال 4 ساعات. ستجد تفاصيل الحجز في ملفك الشخصي.
          </p>
          <div className="bg-amber-50 text-amber-700 rounded-xl px-4 py-3 text-sm">
            إذا لم يؤكد المضيف خلال 4 ساعات، سيُلغى الحجز تلقائياً
          </div>
        </div>
      </div>
    );
  }

  if (!date || !period || !price) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">بيانات الحجز غير مكتملة</p>
        <Button onClick={() => router.back()} className="mt-4" variant="outline">رجوع</Button>
      </div>
    );
  }

  const bookingDate = new Date(date);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">إتمام الحجز</h1>
        <p className="text-gray-500 mt-1">أدخل بياناتك لإكمال عملية الحجز</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">تفاصيل الحجز</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-gray-500">التاريخ:</span>
            <span className="font-medium text-gray-900">
              {format(bookingDate, "EEEE، d MMMM yyyy", { locale: arSA })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-gray-500">الفترة:</span>
            <span className="font-medium text-gray-900">{getPeriodLabel(period)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-gray-500">السعر:</span>
            <span className="font-bold text-xl text-emerald-600">{formatPrice(parseFloat(price))}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-5">بياناتك</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>الاسم الكامل</Label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="اسمك الكامل" value={form.guestName} onChange={set("guestName")} className="pr-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input type="tel" placeholder="07XXXXXXXX" value={form.guestPhone} onChange={set("guestPhone")} className="pr-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>الموقع / العنوان</Label>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="مدينتك أو منطقتك" value={form.guestAddress} onChange={set("guestAddress")} className="pr-10" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">{error}</div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
            بعد الإرسال، سيتم حجز الموعد مؤقتاً لمدة 4 ساعات ريثما يؤكد المضيف.
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "جاري إرسال الطلب..." : "تأكيد الحجز"}
          </Button>
        </form>
      </div>
    </div>
  );
}
