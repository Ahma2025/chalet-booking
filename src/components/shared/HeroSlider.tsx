"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react";

interface Chalet {
  id: string;
  name: string;
  location: string;
  city: string;
  coverImage: string | null;
}

interface Props {
  chalets: Chalet[];
}

export default function HeroSlider({ chalets }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (chalets.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % chalets.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [chalets.length]);

  const prev = () => setCurrent((c) => (c - 1 + chalets.length) % chalets.length);
  const next = () => setCurrent((c) => (c + 1) % chalets.length);

  const slides = chalets.length > 0 ? chalets : [null];

  return (
    <div className="relative h-[600px] md:h-[700px] overflow-hidden bg-gray-900">
      {slides.map((chalet, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {chalet?.coverImage ? (
            <Image
              src={chalet.coverImage}
              alt={chalet.name}
              fill
              className="object-cover"
              priority={i === 0}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        {chalets.length > 0 && chalets[current] ? (
          <div className="animate-slide-in">
            <div className="flex items-center justify-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">{chalets[current].city}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-3 drop-shadow-lg">
              {chalets[current].name}
            </h2>
            <p className="text-gray-200 text-lg mb-2">{chalets[current].location}</p>
          </div>
        ) : (
          <div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
              استمتع بأجمل الإقامات
            </h1>
            <p className="text-gray-200 text-xl mb-2">
              اكتشف الشاليهات والفلل في أجمل المناطق
            </p>
          </div>
        )}

        <p className="text-gray-200 text-lg mb-8">
          احجز شاليهك المثالي بكل سهولة وأمان
        </p>

        <Link href="/chalets">
          <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 text-lg rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105">
            ابدأ الحجز الآن
          </Button>
        </Link>
      </div>

      {chalets.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {chalets.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-8 bg-emerald-400" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
