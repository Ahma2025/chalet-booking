import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/shared/SessionProvider";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "شاليهات — احجز شاليهك المثالي",
  description: "منصة حجز الشاليهات والفلل في أجمل المناطق",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo min-h-screen bg-gray-50 flex flex-col">
        <SessionProvider>
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
