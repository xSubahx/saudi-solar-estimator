import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" dir="ltr">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
