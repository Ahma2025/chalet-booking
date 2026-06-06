import Link from "next/link";
import Image from "next/image";
import { MapPin, Wifi, Car, Waves, ChefHat, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const amenityIcons: Record<string, React.ReactNode> = {
  "واي فاي": <Wifi className="w-3.5 h-3.5" />,
  "مسبح": <Waves className="w-3.5 h-3.5" />,
  "مواقف": <Car className="w-3.5 h-3.5" />,
  "مطبخ": <ChefHat className="w-3.5 h-3.5" />,
};

interface Amenity {
  id: string;
  name: string;
}

interface Props {
  chalet: {
    id: string;
    name: string;
    location: string;
    city: string;
    coverImage: string | null;
    amenities: Amenity[];
    pricingDays: { fullDayPrice: number | null }[];
  };
}

export default function ChaletCard({ chalet }: Props) {
  const minPrice = chalet.pricingDays
    .map((d) => d.fullDayPrice)
    .filter(Boolean)
    .sort((a, b) => (a ?? 0) - (b ?? 0))[0];

  return (
    <Link href={`/chalets/${chalet.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-100">
        <div className="relative h-52 overflow-hidden">
          {chalet.coverImage ? (
            <Image
              src={chalet.coverImage}
              alt={chalet.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <span className="text-white text-4xl">🏡</span>
            </div>
          )}
          {minPrice && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-xl px-3 py-1.5 shadow-md">
              <span className="text-emerald-600 font-bold text-sm">من {minPrice} د.أ/يوم</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {chalet.name}
          </h3>

          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="line-clamp-1">{chalet.location}، {chalet.city}</span>
          </div>

          {chalet.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {chalet.amenities.slice(0, 4).map((a) => (
                <Badge key={a.id} variant="secondary" className="text-xs flex items-center gap-1">
                  {amenityIcons[a.name] || null}
                  {a.name}
                </Badge>
              ))}
              {chalet.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs">+{chalet.amenities.length - 4}</Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
