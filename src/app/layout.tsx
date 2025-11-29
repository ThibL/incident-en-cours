import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter, Orbitron } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

// Primary UI font - clean and highly legible
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Monospace font for data, timers, and technical displays
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

// Display font for dramatic headlines and titles
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "INCIDENT VOYAGEUR ? Peut-être....",
    template: "%s | Transit",
  },
  description:
    "Centre de contrôle temps réel des transports Île-de-France. Surveillez les prochains passages, perturbations et statistiques du réseau métro, RER, tramway et bus.",
  keywords: [
    "RATP",
    "IDFM",
    "métro",
    "RER",
    "tramway",
    "bus",
    "Paris",
    "Île-de-France",
    "transports",
    "temps réel",
    "dashboard",
    "control room",
  ],
  authors: [{ name: "Transit Command" }],
  openGraph: {
    title: "TRANSIT COMMAND - IDFM Dashboard",
    description:
      "Centre de contrôle temps réel des transports Île-de-France",
    type: "website",
    locale: "fr_FR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Control Room dark theme color
  themeColor: "#0a0b0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${orbitron.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
