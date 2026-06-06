"use client";
import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format, startOfDay, addMonths } from "date-fns";
import { arSA } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPeriodLabel, formatPrice } from "@/lib/utils";
import { Calendar, Lock, Unlock, CheckCircle, XCircle, Loader2, Clock, User, DollarSign } from "lucide-react";

const PERIODS = [
  { id: "MORNING", label: "صباحي" },
  { id: "EVENING", label: "مسائي" },
  { id: "FULL_DAY", label: "يوم كامل" },
];

export default function ManageChaletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chalet, setChalet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [blocking, setBlocking] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendar" | "bookings">("calendar");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
  }, [status, router]);

  useEffect(() => {
    fetch(`/api/chalets/${id}`).then((r) => r.json()).then((data) => {
      setChalet(data);
      setLoading(false);
    });
  }, [id]);

  const handleBlock = async (period: string) => {
    if (!selectedDay) return;
    setBlocking(true);
    await fetch(`/api/chalets/${id}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDay.toISOString(), period }),
    });
    const res = await fetch(`/api/chalets/${id}`);
    const data = await res.json();
    setChalet(data);
    setBlocking(false);
  };

  const handleUnblock = async (slotId: string) => {
    await fetch(`/api/chalets/${id}/block`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId }),
    });
    setChalet((prev: any) => ({
      ...prev,
      blockedSlots: prev.blockedSlots.filter((s: any) => s.id !== slotId),
    }));
  };

  const handleBookingAction = async (bookingId: string, action: "CONFIRM" | "REJECT") => {
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setChalet((prev: any) => ({
      ...prev,
      bookings: action === "REJECT"
        ? prev.bookings.filter((b: any) => b.id !== bookingId)
        : prev.bookings.map((b: any) => b.id === bookingId ? { ...b, status: "CONFIRMED" } : b),
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  if (!chalet) return <div className="text-center py-20 text-gray-500">الشاليه غير موجود</div>;

  const today = startOfDay(new Date());

  const blockedDates = (chalet.blockedSlots || []).map((s: any) => new Date(s.date));
  const bookedDates = (chalet.bookings || [])
    .filter((b: any) => b.status === "CONFIRMED" || (b.status === "PENDING" && b.expiresAt && new Date(b.expiresAt) > new Date()))
    .map((b: any) => new Date(b.date));

  const selectedDayBlocked = selectedDay
    ? chalet.blockedSlots.filter((s: any) => new Date(s.date).toDateString() === selectedDay.toDateString())
    : [];

  const selectedDayBooked = selectedDay
    ? chalet.bookings.filter(
        (b: any) =>
          new Date(b.date).toDateString() === selectedDay?.toDateString() &&
          (b.status === "CONFIRMED" || (b.status === "PENDING" && (!b.expiresAt || new Date(b.expiresAt) > new Date())))
      )
    : [];

  const pendingBookings = (chalet.bookings || []).filter(
    (b: any) => b.status === "PENDING" && (!b.expiresAt || new Date(b.expiresAt) > new Date())
  );
  const confirmedBookings = (chalet.bookings || []).filter((b: any) => b.status === "CONFIRMED");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{chalet.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{chalet.city} — إدارة الشاليه</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/host/chalets/${id}/edit`)}>
            ✏️ تعديل الشاليه
          </Button>
          <Button variant="ghost" onClick={() => router.push(`/chalets/${id}`)}>
            عرض الصفحة
          </Button>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { id: "calendar", label: "التقويم" },
          { id: "bookings", label: `الحجوزات (${pendingBookings.length} معلق)` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "calendar" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" /> تقويم المواعيد
            </h3>
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDay}
              disabled={[{ before: today }]}
              startMonth={today}
              endMonth={addMonths(today, 6)}
              modifiers={{
                blocked: blockedDates,
                booked: bookedDates,
              }}
              modifiersClassNames={{
                blocked: "!bg-red-100 !text-red-600 !rounded-full",
                booked: "!bg-amber-100 !text-amber-700 !rounded-full",
              }}
              classNames={{
                selected: "!bg-emerald-600 !text-white",
                today: "!font-bold !text-emerald-600",
              }}
            />
            <div className="flex gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-100 inline-block" /> محجوز (أنت)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-100 inline-block" /> حجز زبون</span>
            </div>
          </div>

          <div className="space-y-4">
            {selectedDay ? (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-3">
                    {format(selectedDay, "EEEE، d MMMM yyyy", { locale: arSA })}
                  </h3>

                  <div className="space-y-2 mb-4">
                    {PERIODS.map((p) => {
                      const isBlocked = selectedDayBlocked.some((s: any) => s.period === p.id || s.period === "FULL_DAY");
                      const isBooked = selectedDayBooked.some((b: any) => b.period === p.id || b.period === "FULL_DAY");
                      const slot = selectedDayBlocked.find((s: any) => s.period === p.id);

                      return (
                        <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${isBlocked ? "border-red-200 bg-red-50" : isBooked ? "border-amber-200 bg-amber-50" : "border-gray-100"}`}>
                          <span className={`text-sm font-medium ${isBlocked ? "text-red-700" : isBooked ? "text-amber-700" : "text-gray-700"}`}>
                            {p.label}
                            {isBlocked && " — مغلق"}
                            {isBooked && " — محجوز"}
                          </span>
                          {!isBooked && (
                            isBlocked && slot ? (
                              <Button size="sm" variant="ghost" onClick={() => handleUnblock(slot.id)} className="text-emerald-600 hover:bg-emerald-50 h-8 text-xs">
                                <Unlock className="w-3 h-3 ml-1" /> فتح
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => handleBlock(p.id)} disabled={blocking} className="text-red-600 hover:bg-red-50 h-8 text-xs">
                                <Lock className="w-3 h-3 ml-1" /> إغلاق
                              </Button>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                اختر يوماً من التقويم لإدارة مواعيده
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="space-y-6">
          {pendingBookings.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> بانتظار موافقتك ({pendingBookings.length})
              </h3>
              <div className="space-y-3">
                {pendingBookings.map((booking: any) => (
                  <BookingDetailCard key={booking.id} booking={booking} onAction={handleBookingAction} />
                ))}
              </div>
            </div>
          )}

          {confirmedBookings.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" /> مؤكدة ({confirmedBookings.length})
              </h3>
              <div className="space-y-3">
                {confirmedBookings.map((booking: any) => (
                  <BookingDetailCard key={booking.id} booking={booking} onAction={handleBookingAction} confirmed />
                ))}
              </div>
            </div>
          )}

          {chalet.bookings?.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد حجوزات لهذا الشاليه</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookingDetailCard({ booking, onAction, confirmed }: { booking: any; onAction: (id: string, action: "CONFIRM" | "REJECT") => void; confirmed?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <div className="font-semibold">{booking.guestName || booking.user?.name}</div>
              <div className="text-gray-400 text-xs">{booking.guestPhone || booking.user?.phone}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <div className="font-semibold">{format(new Date(booking.date), "d MMMM yyyy", { locale: arSA })}</div>
              <div className="text-gray-400 text-xs">{getPeriodLabel(booking.period)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-emerald-600 text-base">{formatPrice(booking.totalPrice)}</span>
          </div>
          {booking.guestAddress && (
            <div className="text-gray-500 text-xs col-span-2">{booking.guestAddress}</div>
          )}
        </div>

        {!confirmed && (
          <div className="flex gap-2 items-start">
            <Button size="sm" onClick={() => onAction(booking.id, "CONFIRM")} className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> قبول
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onAction(booking.id, "REJECT")} className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> رفض
            </Button>
          </div>
        )}

        {confirmed && <Badge variant="success">مؤكد</Badge>}
      </div>
    </div>
  );
}
