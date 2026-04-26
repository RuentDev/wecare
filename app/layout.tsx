import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
// import { Analytics } from "@vercel/analytics/next";
// import { Header } from "@/components/header";
// import Footer from "@/components/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WeCare Clinic",
  description: "Professional healthcare management system for WeCare Clinic",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1e638d",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        {/* <Header /> */}
        {children}
        {/* <Footer /> */}
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
