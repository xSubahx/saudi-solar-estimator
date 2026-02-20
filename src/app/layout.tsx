import type { Metadata } from 'next';
import { Outfit, Source_Serif_4 } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

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
    <html lang="en" dir="ltr" data-theme="dark" className={`${outfit.variable} ${sourceSerif.variable}`}>
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
