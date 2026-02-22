import type { Metadata } from 'next';
import { Syne, Newsreader, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Saudi Solar Savings Estimator | Free PVGIS Tool',
  description:
    'Free tool to estimate rooftop solar PV potential and bill savings for Saudi Arabian homeowners using real PVGIS irradiance data and SEC electricity tariffs. Results shown as a range — no false precision.',
  keywords: 'solar Saudi Arabia, rooftop solar KSA, SEC tariff calculator, PVGIS Saudi, solar savings estimator',
  openGraph: {
    title: 'Saudi Solar Savings Estimator',
    description: 'Estimate your solar savings with PVGIS data and SEC tariffs.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" className={`${syne.variable} ${newsreader.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: `
  try {
    const t = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
`}} />
        {children}
      </body>
    </html>
  );
}
