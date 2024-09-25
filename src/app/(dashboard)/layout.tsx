
import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";

import HeaderMenus from "@/components/HeaderMenus";
import Menus from "@/components/Menus";
import SessionWrapper from "@/components/SessionWrapper";
import { Image } from "@nextui-org/react";
import Link from "next/link";
import { Suspense } from "react";
import { Providers } from "../providers";

const geistSans = localFont({
  src: "../../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PM Quản lý tiết chuẩn",
  description: "Phần mềm Quản lý tiết chuẩn",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>
            <div className="h-screen flex overflow-y-hidden">
              {/* LEFT */}
              <div className="w-64 p-4 sticky top-0">
                <Link
                  href="/"
                  className="flex justify-center items-center gap-2"
                >
                  <Image
                    src="/logoUEF.svg"
                    width={170}
                    height={120}
                    alt="UEF Logo"
                  />
                </Link>
                <Menus />
              </div>
              {/* END LEFT */}
              {/* RIGHT */}
              <div className="flex-1 overflow-y-scroll no-scroll">
                <HeaderMenus />
                <div className="bg-neutral-100 rounded-lg px-3 py-2 mb-2">
                  <Suspense fallback={<div>Loading...</div>}>
                    {children}
                  </Suspense>
                </div>
              </div>
              {/* END RIGHT */}
            </div>
          </Providers>
        </body>
      </html>
    </SessionWrapper>
  );
}
