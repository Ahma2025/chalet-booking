"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, getPeriodLabel } from "@/lib/utils";
import { User, Calendar, MapPin, Building2, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Image from "next/image";

const statusMap: Record<string, { label: string; variant: any }> = {
  PENDING: { label: "بانتظار التأكيد", variant: "warning" },
  CONFIRMED: { label: "مؤكد", variant: "success" },
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((data) => { setBookings(data); setLoading(false); });
    }
  }, [status]);

  if (status === "loading" || !session) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  const user = session.user as any;
  const activeBookings = bookings.filter((b) => {
    if (b.status === "PENDING" && b.expiresAt && new Date(b.expiresAt) < new Date()) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex items-center gap-5">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl font-bold flex-shrink-0">
          {user.name?.[0] || <User className="w-7 h-7" />}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <Badge className="mt-2" variant={user.role === "HOST" ? "default" : "secondary"}>
            {user.role === "HOST" ? "مضيف" : "ضيف"}
          </Badge>
        </div>
        {user.role === "HOST" && (
          <div className="mr-auto">
            <Button onClick={() => router.push("/host")} variant="outline" size="sm">
              <Building2 className="w-4 h-4" /> لوحة المضيف
            </Button>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-5">حجوزاتي</h2>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-emerald-600" /></div>
      ) : activeBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">لا توجد حجوزات بعد</p>
          <Button onClick={() => router.push("/chalets")} className="mt-4" size="sm">تصفح الشاليهات</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeBookings.map((booking) => {
            const st = statusMap[booking.status] || { label: booking.status, variant: "secondary" };
            const expiresAt = booking.expiresAt ? new Date(booking.expiresAt) : null;
            const remainingMs = expiresAt ? expiresAt.getTime() - Date.now() : null;
            const remainingHours = remainingMs ? Math.ceil(remainingMs / 3600000) : null;

            return (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex gap-4 p-5">
                  {booking.chalet?.coverImage && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={booking.chalet.coverImage} alt={booking.chalet.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-base truncate">{booking.chalet?.name}</h3>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(booking.date), "d MMMM yyyy", { locale: arSA })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {getPeriodLabel(booking.period)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {booking.chalet?.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-emerald-600">{formatPrice(booking.totalPrice)}</span>
                      {booking.status === "PENDING" && remainingHours && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ينتهي خلال {remainingHours}س
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
