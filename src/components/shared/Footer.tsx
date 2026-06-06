import Link from "next/link";
import { Building2, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">شاليهات</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              منصتك الأولى لحجز الشاليهات والفلل في أجمل المناطق. نوفر لك أفضل التجارب بأسعار مناسبة.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">الرئيسية</Link></li>
              <li><Link href="/chalets" className="hover:text-emerald-400 transition-colors">تصفح الشاليهات</Link></li>
              <li><Link href="/register" className="hover:text-emerald-400 transition-colors">أضف شاليهك</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">تواصل معنا</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" /> +962 79 000 0000</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-400" /> info@chalets.com</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> عمان، الأردن</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} شاليهات — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
