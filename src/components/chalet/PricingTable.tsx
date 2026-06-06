import { getDayName, formatPrice } from "@/lib/utils";

interface DayPricing {
  dayOfWeek: number;
  morningPrice: number | null;
  eveningPrice: number | null;
  fullDayPrice: number | null;
}

export default function PricingTable({ pricingDays }: { pricingDays: DayPricing[] }) {
  if (pricingDays.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-lg">جدول الأسعار</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">اليوم</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">صباحي</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">مسائي</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">يوم كامل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pricingDays.map((day) => (
              <tr key={day.dayOfWeek} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{getDayName(day.dayOfWeek)}</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-medium">
                  {day.morningPrice ? formatPrice(day.morningPrice) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center text-emerald-600 font-medium">
                  {day.eveningPrice ? formatPrice(day.eveningPrice) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center text-emerald-600 font-medium">
                  {day.fullDayPrice ? formatPrice(day.fullDayPrice) : <span className="text-gray-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
