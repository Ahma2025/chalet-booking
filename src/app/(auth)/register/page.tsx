"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, Mail, Lock, Phone, Eye, EyeOff, Home, Star } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "GUEST" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push(form.role === "HOST" ? "/host" : "/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">إنشاء حساب جديد</h1>
            <p className="text-gray-500 mt-1">انضم إلى مجتمع شاليهات</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: "GUEST" }))}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${
                form.role === "GUEST"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <Home className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold text-sm">ضيف</div>
              <div className="text-xs text-gray-400 mt-0.5">أبحث عن شاليه</div>
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: "HOST" }))}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${
                form.role === "HOST"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <Star className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold text-sm">مضيف</div>
              <div className="text-xs text-gray-400 mt-0.5">أملك شاليه</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="محمد أحمد" value={form.name} onChange={set("name")} className="pr-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="email" placeholder="example@email.com" value={form.email} onChange={set("email")} className="pr-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="tel" placeholder="07XXXXXXXX" value={form.phone} onChange={set("phone")} className="pr-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
                  className="pr-10 pl-10"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">{error}</div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-emerald-600 font-semibold hover:underline">سجل الدخول</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
