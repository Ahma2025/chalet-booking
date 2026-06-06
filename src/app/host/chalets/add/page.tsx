"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDayName } from "@/lib/utils";
import { Plus, Trash2, Upload, Loader2, Check } from "lucide-react";

const DAYS = [0, 1, 2, 3, 4, 5, 6];
const AMENITY_SUGGESTIONS = ["واي فاي", "مسبح", "مواقف", "مطبخ", "مشبك", "غرفة أطفال", "ملعب", "أرجوحة", "كاميرات أمان", "مكيف", "مدفأة", "شواء"];

interface DayPricing {
  dayOfWeek: number;
  morningPrice: string;
  eveningPrice: string;
  fullDayPrice: string;
}

interface SpecialPrice {
  fromDate: string;
  toDate: string;
  label: string;
  morningExtra: string;
  eveningExtra: string;
  fullDayExtra: string;
}

interface Discount {
  fromDate: string;
  toDate: string;
  percentage: string;
}

export default function AddChaletPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState("");

  const [basicInfo, setBasicInfo] = useState({
    name: "", description: "", location: "", city: "",
    mapUrl: "", phone: "", instagram: "", facebook: "", whatsapp: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");

  const [pricingDays, setPricingDays] = useState<DayPricing[]>(
    DAYS.map((d) => ({ dayOfWeek: d, morningPrice: "", eveningPrice: "", fullDayPrice: "" }))
  );

  const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  const setBasic = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setBasicInfo((f) => ({ ...f, [field]: e.target.value }));

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || images.length >= 4) return;
    setUploadingImages(true);
    const remaining = 4 - images.length;
    const toUpload = Array.from(files).slice(0, remaining);

    const uploaded: string[] = [];
    for (const file of toUpload) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) uploaded.push(data.url);
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploadingImages(false);
  };

  const toggleAmenity = (a: string) => {
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
      setAmenities((prev) => [...prev, customAmenity.trim()]);
      setCustomAmenity("");
    }
  };

  const updateDayPrice = (day: number, field: keyof DayPricing, value: string) => {
    setPricingDays((prev) => prev.map((d) => d.dayOfWeek === day ? { ...d, [field]: value } : d));
  };

  const addSpecialPrice = () => {
    setSpecialPrices((prev) => [...prev, { fromDate: "", toDate: "", label: "", morningExtra: "", eveningExtra: "", fullDayExtra: "" }]);
  };

  const updateSpecial = (i: number, field: keyof SpecialPrice, value: string) => {
    setSpecialPrices((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const addDiscount = () => {
    setDiscounts((prev) => [...prev, { fromDate: "", toDate: "", percentage: "" }]);
  };

  const updateDiscount = (i: number, field: keyof Discount, value: string) => {
    setDiscounts((prev) => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...basicInfo,
      coverImage: images[0] || null,
      images: images.slice(1),
      videoUrl,
      amenities,
      pricingDays: pricingDays.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        morningPrice: d.morningPrice ? parseFloat(d.morningPrice) : null,
        eveningPrice: d.eveningPrice ? parseFloat(d.eveningPrice) : null,
        fullDayPrice: d.fullDayPrice ? parseFloat(d.fullDayPrice) : null,
      })),
      specialPrices: specialPrices.filter((s) => s.fromDate && s.toDate).map((s) => ({
        ...s,
        morningExtra: s.morningExtra ? parseFloat(s.morningExtra) : null,
        eveningExtra: s.eveningExtra ? parseFloat(s.eveningExtra) : null,
        fullDayExtra: s.fullDayExtra ? parseFloat(s.fullDayExtra) : null,
      })),
      discounts: discounts.filter((d) => d.fromDate && d.toDate && d.percentage).map((d) => ({
        ...d,
        percentage: parseFloat(d.percentage),
      })),
    };

    const res = await fetch("/api/chalets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "حدث خطأ");
      setLoading(false);
      return;
    }

    router.push("/host");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">إضافة شاليه جديد</h1>
        <p className="text-gray-500 mt-1">أضف تفاصيل شاليهك لبدء استقبال الحجوزات</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Section title="المعلومات الأساسية">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="اسم الشاليه *"><Input placeholder="شاليه الوادي" value={basicInfo.name} onChange={setBasic("name")} required /></Field>
            <Field label="المدينة *"><Input placeholder="إربد" value={basicInfo.city} onChange={setBasic("city")} required /></Field>
            <Field label="الموقع / المنطقة *"><Input placeholder="منطقة الأشجار" value={basicInfo.location} onChange={setBasic("location")} required /></Field>
            <Field label="رابط الخريطة"><Input placeholder="https://maps.google.com/..." value={basicInfo.mapUrl} onChange={setBasic("mapUrl")} /></Field>
          </div>
          <Field label="وصف الشاليه *">
            <Textarea placeholder="اكتب وصفاً جذاباً للشاليه..." value={basicInfo.description} onChange={setBasic("description")} className="min-h-[120px]" required />
          </Field>
        </Section>

        <Section title="بيانات التواصل">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="رقم الهاتف"><Input placeholder="07XXXXXXXX" value={basicInfo.phone} onChange={setBasic("phone")} /></Field>
            <Field label="واتساب"><Input placeholder="9627XXXXXXXX+" value={basicInfo.whatsapp} onChange={setBasic("whatsapp")} /></Field>
            <Field label="إنستغرام"><Input placeholder="@username" value={basicInfo.instagram} onChange={setBasic("instagram")} /></Field>
            <Field label="فيسبوك"><Input placeholder="رابط الصفحة" value={basicInfo.facebook} onChange={setBasic("facebook")} /></Field>
          </div>
        </Section>

        <Section title="الصور والفيديو">
          <div className="mb-3">
            <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${images.length >= 4 ? "border-gray-200 bg-gray-50" : "border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50"}`}>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} disabled={images.length >= 4 || uploadingImages} />
              {uploadingImages ? (
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
              ) : (
                <Upload className="w-8 h-8 text-emerald-500 mb-2" />
              )}
              <span className="text-sm text-gray-500">
                {images.length >= 4 ? "تم رفع الحد الأقصى (4 صور)" : `اضغط لرفع الصور (${images.length}/4) — الأولى ستكون الغلاف`}
              </span>
            </label>
          </div>

          {images.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {images.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="w-24 h-24 object-cover rounded-xl border-2 border-gray-100" />
                  {i === 0 && <span className="absolute top-1 right-1 bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded-md">غلاف</span>}
                  <button type="button" onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))} className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                </div>
              ))}
            </div>
          )}

          <Field label="رابط الفيديو (اختياري)">
            <Input placeholder="https://youtube.com/..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          </Field>
        </Section>

        <Section title="المرفقات والخدمات">
          <div className="flex flex-wrap gap-2 mb-3">
            {AMENITY_SUGGESTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  amenities.includes(a)
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {amenities.includes(a) && <Check className="inline w-3 h-3 ml-1" />}
                {a}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="مرفق مخصص..." value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomAmenity())} />
            <Button type="button" variant="outline" onClick={addCustomAmenity}><Plus className="w-4 h-4" /></Button>
          </div>
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {amenities.filter((a) => !AMENITY_SUGGESTIONS.includes(a)).map((a) => (
                <span key={a} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-sm flex items-center gap-1">
                  {a}
                  <button type="button" onClick={() => toggleAmenity(a)} className="text-emerald-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title="جدول الأسعار الأساسي">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 bg-gray-50">
                  <th className="text-right px-3 py-2 rounded-r-lg font-medium">اليوم</th>
                  <th className="text-center px-3 py-2 font-medium">صباحي (د.أ)</th>
                  <th className="text-center px-3 py-2 font-medium">مسائي (د.أ)</th>
                  <th className="text-center px-3 py-2 rounded-l-lg font-medium">يوم كامل (د.أ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pricingDays.map((day) => (
                  <tr key={day.dayOfWeek}>
                    <td className="px-3 py-2 font-medium text-gray-900">{getDayName(day.dayOfWeek)}</td>
                    {(["morningPrice", "eveningPrice", "fullDayPrice"] as const).map((field) => (
                      <td key={field} className="px-2 py-2">
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="0.5"
                          value={day[field]}
                          onChange={(e) => updateDayPrice(day.dayOfWeek, field, e.target.value)}
                          className="text-center h-9 text-sm"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="أسعار خاصة (اختياري)">
          <div className="space-y-4">
            {specialPrices.map((sp, i) => (
              <div key={i} className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-amber-800 text-sm">فترة خاصة #{i + 1}</span>
                  <button type="button" onClick={() => setSpecialPrices((p) => p.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Field label="التسمية"><Input placeholder="عيد الأضحى" value={sp.label} onChange={(e) => updateSpecial(i, "label", e.target.value)} /></Field>
                  <Field label="من تاريخ"><Input type="date" value={sp.fromDate} onChange={(e) => updateSpecial(i, "fromDate", e.target.value)} /></Field>
                  <Field label="إلى تاريخ"><Input type="date" value={sp.toDate} onChange={(e) => updateSpecial(i, "toDate", e.target.value)} /></Field>
                  <Field label="إضافة صباحي (د.أ)"><Input type="number" placeholder="0" value={sp.morningExtra} onChange={(e) => updateSpecial(i, "morningExtra", e.target.value)} /></Field>
                  <Field label="إضافة مسائي (د.أ)"><Input type="number" placeholder="0" value={sp.eveningExtra} onChange={(e) => updateSpecial(i, "eveningExtra", e.target.value)} /></Field>
                  <Field label="إضافة يوم كامل (د.أ)"><Input type="number" placeholder="0" value={sp.fullDayExtra} onChange={(e) => updateSpecial(i, "fullDayExtra", e.target.value)} /></Field>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addSpecialPrice} className="w-full">
              <Plus className="w-4 h-4" /> إضافة فترة خاصة
            </Button>
          </div>
        </Section>

        <Section title="فترات الخصم (اختياري)">
          <div className="space-y-4">
            {discounts.map((d, i) => (
              <div key={i} className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-green-800 text-sm">خصم #{i + 1}</span>
                  <button type="button" onClick={() => setDiscounts((p) => p.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="من تاريخ"><Input type="date" value={d.fromDate} onChange={(e) => updateDiscount(i, "fromDate", e.target.value)} /></Field>
                  <Field label="إلى تاريخ"><Input type="date" value={d.toDate} onChange={(e) => updateDiscount(i, "toDate", e.target.value)} /></Field>
                  <Field label="نسبة الخصم (%)"><Input type="number" placeholder="10" min="1" max="100" value={d.percentage} onChange={(e) => updateDiscount(i, "percentage", e.target.value)} /></Field>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addDiscount} className="w-full">
              <Plus className="w-4 h-4" /> إضافة فترة خصم
            </Button>
          </div>
        </Section>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">{error}</div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" size="lg" className="flex-1" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : "نشر الشاليه"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>إلغاء</Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-gray-700">{label}</Label>
      {children}
    </div>
  );
}
