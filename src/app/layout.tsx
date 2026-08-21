import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import SmoothScrollProvider from "@/components/scroll/SmoothScrollProvider";
import { IDENTITY, THESIS } from "@/lib/content";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${IDENTITY.name} — ${IDENTITY.role}`,
  description: THESIS,
  authors: [{ name: IDENTITY.name, url: IDENTITY.github }],
  openGraph: {
    title: `${IDENTITY.name} — ${IDENTITY.role}`,
    description: THESIS,
    type: "profile",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Sin `data-scroll-behavior="smooth"`: en Next 16 ese atributo devuelve el
    // comportamiento antiguo, en el que el framework manipula `scroll-behavior`
    // durante la navegación. Aquí el scroll lo gobierna Lenis y esa
    // intervención se pelearía con él.
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="bg-black text-white antialiased">
        <SmoothScrollProvider />
        {children}
      </body>
    </html>
  );
}
