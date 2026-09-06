import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from './register-sw'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://urbanflow-mobility.vercel.app'),
  title: {
    default: 'UrbanFlow Mobility — Mobilité urbaine intelligente en IDF',
    template: '%s | UrbanFlow',
  },
  description: 'Planifiez vos trajets multimodaux en temps réel — métro, RER, Vélib, trottinette, covoiturage. Réduisez votre empreinte CO₂ et gagnez des points à chaque déplacement éco-responsable.',
  keywords: ['mobilité urbaine', 'transport en commun', 'Île-de-France', 'planificateur itinéraire', 'multimodal', 'vélib', 'covoiturage', 'CO2', 'IDFM', 'PWA'],
  authors: [{ name: 'UrbanFlow Mobility' }],
  creator: 'UrbanFlow Mobility',
  manifest: '/manifest.json',
  themeColor: '#16A34A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UrbanFlow',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://urbanflow-mobility.vercel.app',
    siteName: 'UrbanFlow Mobility',
    title: 'UrbanFlow Mobility — Mobilité urbaine intelligente en IDF',
    description: 'Planifiez vos trajets multimodaux en temps réel. Métro, RER, Vélib, covoiturage — un seul planificateur, zéro CO₂ superflu.',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'UrbanFlow Mobility — logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'UrbanFlow Mobility',
    description: 'Planifiez vos trajets multimodaux en IDF. Réduisez votre CO₂.',
    images: ['/icons/icon-512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Skip to main content — WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-green-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:font-semibold"
        >
          Aller au contenu principal
        </a>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
