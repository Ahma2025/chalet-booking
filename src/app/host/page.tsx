"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getPeriodLabel } from "@/lib/utils";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import {
  PlusCircle, Building2, Calendar, CheckCircle, XCircle,
  Clock, Loader2, User, DollarSign
} from "lucide-react";

export default function HostDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chalets, setChalets] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chalets" | "bookings">("chalets");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if ((session?.user as any)?.role !== "HOST") { router.push("/"); return; }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/chalets/mine").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ]).then(([c, b]) => {
      setChalets(c);
      setBookings(b);
      setLoading(false);
    });
  }, [status]);

  const handleAction = async (bookingId: string, action: "CONFIRM" | "REJECT") => {
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBookings((prev) =>
      action === "REJECT"
        ? prev.filter((b) => b.id !== bookingId)
        : prev.map((b) => (b.id === bookingId ? { ...b, status: "CONFIRMED" } : b))
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  const pendingBookings = bookings.filter(
    (b) => b.status === "PENDING" && (!b.expiresAt || new Date(b.expiresAt) > new Date())
  );
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة المضيف</h1>
          <p className="text-gray-500 mt-1">أهلاً، {session?.user?.name}</p>
        </div>
        <Link href="/host/chalets/add">
          <Button className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> إضافة شاليه
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "شاليهاتي", value: chalets.length, icon: <Building2 className="w-6 h-6" />, color: "bg-emerald-50 text-emerald-600" },
          { label: "طلبات معلقة", value: pendingBookings.length, icon: <Clock className="w-6 h-6" />, color: "bg-amber-50 text-amber-600" },
          { label: "حجوزات مؤكدة", value: confirmedBookings.length, icon: <CheckCircle className="w-6 h-6" />, color: "bg-blue-50 text-blue-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { id: "chalets", label: "شاليهاتي" },
          { id: "bookings", label: "الحجوزات" },
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

      {activeTab === "chalets" && (
        <div>
          {chalets.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">لم تضف أي شاليه بعد</p>
              <Link href="/host/chalets/add"><Button>إضافة شاليه جديد</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {chalets.map((chalet) => (
                <div key={chalet.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="relative h-40">
                    {chalet.coverImage ? (
                      <Image src={chalet.coverImage} alt={chalet.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-3xl">🏡</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{chalet.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{chalet.city}</p>
                    <Link href={`/host/chalets/${chalet.id}`}>
                      <Button variant="outline" size="sm" className="w-full">إدارة الشاليه</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="space-y-4">
          {pendingBookings.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> طلبات بانتظار الموافقة
              </h3>
              <div className="space-y-3">
                {pendingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onAction={handleAction} />
                ))}
              </div>
            </div>
          )}

          {confirmedBookings.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" /> الحجوزات المؤكدة
              </h3>
              <div className="space-y-3">
                {confirmedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onAction={handleAction} confirmed />
                ))}
              </div>
            </div>
          )}

          {bookings.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد حجوزات بعد</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, onAction, confirmed }: { booking: any; onAction: (id: string, action: "CONFIRM" | "REJECT") => void; confirmed?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900">{booking.chalet?.name}</h4>
            <Badge variant={confirmed ? "success" : "warning"}>
              {confirmed ? "مؤكد" : "معلق"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" /> {booking.guestName}</span>
            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-gray-400" /> {booking.guestPhone}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {format(new Date(booking.date), "d MMMM yyyy", { locale: arSA })}
            </span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> {getPeriodLabel(booking.period)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-emerald-600">{formatPrice(booking.totalPrice)}</span>
          </div>
          {booking.guestAddress && (
            <p className="text-xs text-gray-400">العنوان: {booking.guestAddress}</p>
          )}
        </div>

        {!confirmed && (
          <div className="flex gap-2 sm:flex-col">
            <Button
              size="sm"
              onClick={() => onAction(booking.id, "CONFIRM")}
              className="flex items-center gap-1.5 flex-1 sm:flex-none"
            >
              <CheckCircle className="w-4 h-4" /> قبول
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onAction(booking.id, "REJECT")}
              className="flex items-center gap-1.5 flex-1 sm:flex-none"
            >
              <XCircle className="w-4 h-4" /> رفض
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
