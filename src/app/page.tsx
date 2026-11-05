'use client';

import dynamic from 'next/dynamic';

const AudioVisualizerStudio = dynamic(
  () => import('@/components/ui/AudioVisualizerStudio').then((mod) => mod.AudioVisualizerStudio),
  { ssr: false }
);

export default function Page() {
  return <AudioVisualizerStudio />;
}
