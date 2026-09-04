import type { Metadata } from "next";
import { Open_Sans, ZCOOL_XiaoWei } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
});

const zcoolXiaoWei = ZCOOL_XiaoWei({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-zcool",
});

export const metadata: Metadata = {
  title: "Emmoğlu Menu",
  description: "Emmoğlu - 1994'ten beri",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${openSans.variable} ${zcoolXiaoWei.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow pt-[88px] sm:pt-[104px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
