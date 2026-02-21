import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Speaking KickStart — jonweaver.by',
  description:
    'A 28-day intensive speaking course for B1/B2 English learners. Train automaticity. Stop freezing. Sound like yourself in English.',
  openGraph: {
    title: 'The Speaking KickStart',
    description: 'A 28-day intensive speaking course for B1/B2 English learners.',
    siteName: 'jonweaver.by',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
