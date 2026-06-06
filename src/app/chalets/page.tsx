"use client";
import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import ChaletCard from "@/components/chalet/ChaletCard";
import { Search, MapPin, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/hooks";

export default function ChaletsPage() {
  const [chalets, setChalets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const debouncedCity = useDebounce(city, 400);

  const fetchChalets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (debouncedCity) params.set("city", debouncedCity);
    const res = await fetch(`/api/chalets?${params}`);
    const data = await res.json();
    setChalets(data);
    setLoading(false);
  }, [debouncedSearch, debouncedCity]);

  useEffect(() => { fetchChalets(); }, [fetchChalets]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تصفح الشاليهات</h1>
        <p className="text-gray-500">اكتشف أجمل الشاليهات والفلل في المنطقة</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ابحث باسم الشاليه أو الموقع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="relative sm:w-56">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="المدينة..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="pr-10"
            />
          </div>
          {(search || city) && (
            <Button variant="ghost" onClick={() => { setSearch(""); setCity(""); }}>
              مسح
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : chalets.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
          <p className="text-gray-400">جرب تغيير معايير البحث</p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">{chalets.length} شاليه متاح</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {chalets.map((chalet) => (
              <ChaletCard key={chalet.id} chalet={chalet} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
