import type { Metadata } from "next";
import "./globals.css";

import SessionWrapper from "@/components/SessionWrapper";

export const metadata: Metadata = {
  title: "PM Quản lý tiết chuẩn",
  description: "Phần mềm Quản lý tiết chuẩn",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <html lang="en">
        <body>{children}</body>
      </html>
    </SessionWrapper>
  );
}
