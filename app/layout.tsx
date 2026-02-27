import type { Metadata, Viewport } from "next";
import { Inter, Lora, Caveat } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import { ThemeProvider } from "@/components/theme-provider";
import { DiaryFontProvider } from "@/lib/diary-font";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  style: ['normal', 'italic'],
  display: 'swap',
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#e11d48',
}

export const metadata: Metadata = {
  title: "R-dyri — calm space",
  description: "A tasteful, peaceful daily diary for you and your partner.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'R-dyri',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${lora.variable} ${caveat.variable} font-sans antialiased h-full flex flex-col bg-background text-foreground transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DiaryFontProvider>
            <div className="flex-1 pb-20 lg:pb-0">
              {children}
            </div>
            <BottomNav />
            <ServiceWorkerRegistration />
          </DiaryFontProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
