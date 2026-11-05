'use client';

import dynamic from 'next/dynamic';

const GeminiPrismStudio = dynamic(
  () => import('@/components/ui/GeminiPrismStudio').then((mod) => mod.GeminiPrismStudio),
  { ssr: false }
);

export default function Page() {
  return <GeminiPrismStudio />;
}
