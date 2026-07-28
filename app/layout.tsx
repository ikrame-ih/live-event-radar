import type { Metadata } from "next";
import { Inter, Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://live-event-radar.vercel.app"),
  title: "LiveEvent Radar",
  description:
    "See which stands are running low — venue map, zone stock, and live stock events for brand activations.",
  other: {
    google: "notranslate",
  },
  openGraph: {
    title: "LiveEvent Radar",
    description:
      "Live ops for brand activations — zone stock, venue map, and stock events in one view.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "LiveEvent Radar",
    description:
      "Live ops for brand activations — zone stock, venue map, and stock events in one view.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      translate="no"
      suppressHydrationWarning
      className={`${inter.variable} ${montserrat.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
