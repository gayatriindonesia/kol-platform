import type { Metadata } from "next";
import { Inter, Poppins, Roboto } from 'next/font/google'
import "./globals.css";
import { SessionProvider } from "@/providers/session-provider";

// Configure fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins'
})

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto'
})

{/** 
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
*/}

export const metadata: Metadata = {
  title: "Gayatri Indonesia",
  description: "Application Key Opinion Leader (KOL) Gayatri Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${roboto.variable}`}>
      <body
        className={inter.className}
      >
        <SessionProvider>
        {children}
        </SessionProvider>
      </body>
    </html>
  );
}