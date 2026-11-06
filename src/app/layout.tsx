import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VIBE - Advanced Real-Time Audio & Voice Visualizer',
  description: 'Premium organic motion visualizer powered by HTML5 Canvas & Web Audio API',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-violet-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
