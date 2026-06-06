"use client";
import { useState, useMemo } from "react";
import { format, isBefore, startOfDay, addMonths } from "date-fns";
import { arSA } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { formatPrice, getDayName, getPeriodLabel } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sun, Moon, Calendar, AlertCircle } from "lucide-react";

interface DayPricing {
  dayOfWeek: number;
  morningPrice: number | null;
  eveningPrice: number | null;
  fullDayPrice: number | null;
}

interface SpecialPrice {
  fromDate: string;
  toDate: string;
  label: string | null;
  morningExtra: number | null;
  eveningExtra: number | null;
  fullDayExtra: number | null;
}

interface Discount {
  fromDate: string;
  toDate: string;
  percentage: number;
}

interface BookedSlot {
  date: string;
  period: string;
  status: string;
  expiresAt: string | null;
}

interface BlockedSlot {
  date: string;
  period: string;
}

interface Props {
  chaletId: string;
  pricingDays: DayPricing[];
  specialPrices: SpecialPrice[];
  discounts: Discount[];
  bookedSlots: BookedSlot[];
  blockedSlots: BlockedSlot[];
}

const PERIODS = [
  { id: "MORNING", label: "الفترة الصباحية", icon: <Sun className="w-4 h-4" /> },
  { id: "EVENING", label: "الفترة المسائية", icon: <Moon className="w-4 h-4" /> },
  { id: "FULL_DAY", label: "يوم كامل", icon: <Calendar className="w-4 h-4" /> },
];

function isSlotBooked(date: Date, period: string, slots: { date: string; period: string; status: string; expiresAt: string | null }[]) {
  return slots.some((s) => {
    if (s.status === "PENDING" && s.expiresAt && new Date(s.expiresAt) < new Date()) return false;
    const d = new Date(s.date);
    return (
      d.toDateString() === date.toDateString() &&
      (s.period === period || s.period === "FULL_DAY" || period === "FULL_DAY")
    );
  });
}

function isSlotBlocked(date: Date, period: string, slots: { date: string; period: string }[]) {
  return slots.some((s) => {
    const d = new Date(s.date);
    return (
      d.toDateString() === date.toDateString() &&
      (s.period === period || s.period === "FULL_DAY" || period === "FULL_DAY")
    );
  });
}

function getSpecialPrice(date: Date, specials: SpecialPrice[]) {
  return specials.find((s) => {
    const from = new Date(s.fromDate);
    const to = new Date(s.toDate);
    return date >= from && date <= to;
  });
}

function getDiscount(date: Date, discounts: Discount[]) {
  return discounts.find((d) => {
    const from = new Date(d.fromDate);
    const to = new Date(d.toDate);
    return date >= from && date <= to;
  });
}

function calculatePrice(date: Date, period: string, pricingDays: DayPricing[], specials: SpecialPrice[], discounts: Discount[]) {
  const dayOfWeek = date.getDay();
  const pricing = pricingDays.find((p) => p.dayOfWeek === dayOfWeek);
  if (!pricing) return null;

  let base = 0;
  if (period === "MORNING") base = pricing.morningPrice ?? 0;
  else if (period === "EVENING") base = pricing.eveningPrice ?? 0;
  else base = pricing.fullDayPrice ?? 0;

  const special = getSpecialPrice(date, specials);
  if (special) {
    if (period === "MORNING" && special.morningExtra) base += special.morningExtra;
    else if (period === "EVENING" && special.eveningExtra) base += special.eveningExtra;
    else if (period === "FULL_DAY" && special.fullDayExtra) base += special.fullDayExtra;
  }

  const discount = getDiscount(date, discounts);
  if (discount) {
    base = base * (1 - discount.percentage / 100);
  }

  return { price: base, special, discount };
}

export default function BookingCalendar({ chaletId, pricingDays, specialPrices, discounts, bookedSlots, blockedSlots }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  const today = startOfDay(new Date());

  const disabledDays = [{ before: today }];

  const priceInfo = useMemo(() => {
    if (!selectedDay || !selectedPeriod) return null;
    return calculatePrice(selectedDay, selectedPeriod, pricingDays, specialPrices, discounts);
  }, [selectedDay, selectedPeriod, pricingDays, specialPrices, discounts]);

  const handleBook = () => {
    if (!session) { router.push("/login"); return; }
    if (!selectedDay || !selectedPeriod) return;
    const params = new URLSearchParams({
      date: selectedDay.toISOString(),
      period: selectedPeriod,
      price: String(priceInfo?.price ?? 0),
    });
    router.push(`/book/${chaletId}?${params}`);
  };

  const isUnavailable = (date: Date, period: string) =>
    isSlotBooked(date, period, bookedSlots) || isSlotBlocked(date, period, blockedSlots);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 text-lg mb-4">اختر موعد الحجز</h3>

      <DayPicker
        mode="single"
        selected={selectedDay}
        onSelect={(day) => { setSelectedDay(day); setSelectedPeriod(null); }}
        disabled={disabledDays}
        startMonth={today}
        endMonth={addMonths(today, 6)}
        className="!font-cairo"
        classNames={{
          selected: "!bg-emerald-600 !text-white",
          today: "!font-bold !text-emerald-600",
          disabled: "!text-gray-300 !cursor-not-allowed",
        }}
      />

      {selectedDay && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            اختر الفترة ليوم{" "}
            <span className="text-emerald-600">
              {format(selectedDay, "EEEE d MMMM", { locale: arSA })}
            </span>
          </p>

          <div className="space-y-2">
            {PERIODS.map((p) => {
              const unavailable = isUnavailable(selectedDay, p.id);
              const calc = calculatePrice(selectedDay, p.id, pricingDays, specialPrices, discounts);
              const hasPrice = calc && calc.price > 0;

              return (
                <button
                  key={p.id}
                  disabled={unavailable || !hasPrice}
                  onClick={() => setSelectedPeriod(p.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-sm transition-all ${
                    unavailable
                      ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                      : !hasPrice
                      ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                      : selectedPeriod === p.id
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 hover:border-emerald-300 text-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {p.icon} {p.label}
                  </span>
                  <span>
                    {unavailable ? (
                      <span className="text-red-400 text-xs">محجوز</span>
                    ) : hasPrice ? (
                      <span className="font-bold text-emerald-600">{formatPrice(calc!.price)}</span>
                    ) : (
                      <span className="text-gray-300 text-xs">غير متاح</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedPeriod && priceInfo && (
            <div className="mt-4 space-y-2">
              {priceInfo.special && (
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 rounded-xl px-3 py-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {priceInfo.special.label || "فترة خاصة"} — سعر خاص مطبق
                </div>
              )}
              {priceInfo.discount && (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-3 py-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  خصم {priceInfo.discount.percentage}% مطبق على هذا الموعد
                </div>
              )}
              <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-gray-700 font-medium text-sm">الإجمالي</span>
                <span className="font-bold text-xl text-emerald-600">{formatPrice(priceInfo.price)}</span>
              </div>
              <Button onClick={handleBook} className="w-full" size="lg">
                إتمام الحجز
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
