"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Building2, User, LogOut, PlusCircle } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHost = (session?.user as any)?.role === "HOST";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">شاليهات</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center gap-1.5">
              <Home className="w-4 h-4" /> الرئيسية
            </Link>
            <Link href="/chalets" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> الشاليهات
            </Link>
            {isHost && (
              <Link href="/host" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" /> لوحة المضيف
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {session.user?.name}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> خروج
                </Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">تسجيل دخول</Button></Link>
                <Link href="/register"><Button size="sm">إنشاء حساب</Button></Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          <Link href="/" className="block py-2 text-gray-700 hover:text-emerald-600 font-medium" onClick={() => setMenuOpen(false)}>الرئيسية</Link>
          <Link href="/chalets" className="block py-2 text-gray-700 hover:text-emerald-600 font-medium" onClick={() => setMenuOpen(false)}>الشاليهات</Link>
          {isHost && <Link href="/host" className="block py-2 text-gray-700 hover:text-emerald-600 font-medium" onClick={() => setMenuOpen(false)}>لوحة المضيف</Link>}
          {session ? (
            <>
              <Link href="/profile" className="block py-2 text-gray-700 hover:text-emerald-600 font-medium" onClick={() => setMenuOpen(false)}>الملف الشخصي</Link>
              <button onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }} className="block w-full text-right py-2 text-red-600 font-medium">تسجيل خروج</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-gray-700 hover:text-emerald-600 font-medium" onClick={() => setMenuOpen(false)}>تسجيل دخول</Link>
              <Link href="/register" className="block py-2 text-emerald-600 font-semibold" onClick={() => setMenuOpen(false)}>إنشاء حساب</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
