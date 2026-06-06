import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("ar-JO", {
    style: "currency",
    currency: "JOD",
    minimumFractionDigits: 0,
  }).format(price);
}

export function getDayName(dayIndex: number) {
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  return days[dayIndex];
}

export function getPeriodLabel(period: string) {
  const labels: Record<string, string> = {
    MORNING: "الفترة الصباحية",
    EVENING: "الفترة المسائية",
    FULL_DAY: "يوم كامل",
  };
  return labels[period] || period;
}
