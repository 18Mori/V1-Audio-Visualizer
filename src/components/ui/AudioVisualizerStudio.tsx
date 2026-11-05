'use client';

import React, { useState } from 'react';
import { VisualizerMode } from '@/types/audio';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { AnimatedVisualizerCanvas } from '@/components/canvas/AnimatedVisualizerCanvas';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { Sparkles, AlertCircle } from 'lucide-react';

export const AudioVisualizerStudio: React.FC = () => {
  const [mode, setMode] = useState<VisualizerMode>('waves');

  const {
    activeSource,
    isPlaying,
    error,
    metadata,
    frequencyDataRef,
    timeDomainDataRef,
    startMicrophone,
    loadAudioFile,
    togglePlayPause,
    stopAll,
    updateFrameData,
  } = useAudioAnalyser({
    fftSize: 256,
    smoothingTimeConstant: 0.85,
  });

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden font-sans">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Header Bar */}
      <header className="z-10 w-full max-w-5xl flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              VIBE <span className="text-violet-400 font-normal">Visualizer</span>
            </h1>
            <p className="text-xs text-zinc-400">Custom Audio-Reactive Motion Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
            {isPlaying ? 'ACTIVE 60FPS' : 'IDLE'}
          </span>
        </div>
      </header>

      {/* Error Alert Display */}
      {error && (
        <div className="z-10 w-full max-w-4xl bg-red-950/80 border border-red-800/60 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-xl mb-4">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Visualizer Stage */}
      <main className="z-10 w-full max-w-5xl flex-1 flex flex-col items-center justify-center my-6 min-h-[400px]">
        <div className="relative w-full h-[60vh] max-h-[600px] min-h-[350px] bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/60 rounded-3xl p-3 shadow-2xl overflow-hidden group">
          <AnimatedVisualizerCanvas
            mode={mode}
            frequencyDataRef={frequencyDataRef}
            timeDomainDataRef={timeDomainDataRef}
            updateFrameData={updateFrameData}
            isPlaying={isPlaying}
          />

          {/* Idle Stage Overlay Instructions */}
          {activeSource === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
              <div className="p-4 rounded-full bg-zinc-900/80 border border-zinc-800 mb-4 animate-float">
                <Sparkles className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-200 mb-1">
                Visualizer Standing By
              </h2>
              <p className="text-sm text-zinc-400 max-w-sm">
                Enable your Live Microphone or upload an Audio File below to activate real-time frequency reactivity.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Control Bar */}
      <footer className="z-10 w-full flex justify-center pb-4">
        <ControlPanel
          mode={mode}
          setMode={setMode}
          activeSource={activeSource}
          isPlaying={isPlaying}
          onStartMic={startMicrophone}
          onFileUpload={loadAudioFile}
          onTogglePlayPause={togglePlayPause}
          onStop={stopAll}
          fileName={metadata?.name}
        />
      </footer>
    </div>
  );
};
