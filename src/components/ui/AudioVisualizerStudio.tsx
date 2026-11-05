'use client';

import React, { useState, useEffect } from 'react';
import { VisualizerMode } from '@/types/audio';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { AnimatedVisualizerCanvas } from '@/components/canvas/AnimatedVisualizerCanvas';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { Sparkles, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';

export const AudioVisualizerStudio: React.FC = () => {
  const [mode, setMode] = useState<VisualizerMode>('waves');
  const [isPanelOpen, setIsPanelOpen] = useState(true);

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

  // Auto-collapse panel after 4 seconds of playback to let the canvas shine
  useEffect(() => {
    if (isPlaying && activeSource !== 'idle') {
      const timer = setTimeout(() => {
        setIsPanelOpen(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setIsPanelOpen(true);
    }
  }, [isPlaying, activeSource]);

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col justify-between p-4 sm:p-8 overflow-hidden font-sans">
      {/* Full-Screen Immersive Canvas Background */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <AnimatedVisualizerCanvas
          mode={mode}
          frequencyDataRef={frequencyDataRef}
          timeDomainDataRef={timeDomainDataRef}
          updateFrameData={updateFrameData}
          isPlaying={isPlaying}
          className="w-full h-full"
        />
      </div>

      {/* Subtle vignette gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-zinc-950/50 pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between py-4 px-2 sm:px-6">
        <div className="flex items-center gap-3 backdrop-blur-md bg-zinc-900/50 border border-zinc-800/70 px-4 py-2 rounded-2xl shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              VIBE <span className="text-violet-400 font-normal">Visualizer</span>
            </h1>
            <p className="text-[11px] text-zinc-400">Real-Time Audio-Reactive Motion Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2 backdrop-blur-md bg-zinc-900/50 border border-zinc-800/70 px-4 py-2 rounded-2xl shadow-xl">
          <span className="inline-flex items-center gap-2 text-xs font-mono text-zinc-300">
            <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
            {isPlaying ? 'ACTIVE 60FPS' : 'STANDBY'}
          </span>
        </div>
      </header>

      {/* Error Alert Display */}
      {error && (
        <div className="relative z-10 w-full max-w-xl mx-auto bg-red-950/90 border border-red-800/80 text-red-200 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm shadow-2xl backdrop-blur-xl">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Idle Center Prompt */}
      <main className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col items-center justify-center pointer-events-none">
        {activeSource === 'idle' && (
          <div className="flex flex-col items-center justify-center p-8 text-center backdrop-blur-md bg-zinc-900/30 border border-zinc-800/50 rounded-3xl shadow-2xl max-w-md pointer-events-auto animate-float">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 mb-4 shadow-xl">
              <Sparkles className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mb-2">
              Visualizer Standing By
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Enable your Live Microphone or upload an audio track below to awaken the buttery-smooth 60fps audio-reactive motion engine.
            </p>
          </div>
        )}
      </main>

      {/* Bottom Collapsible Control Drawer with Hover/Click Notch */}
      <footer 
        className="relative z-20 w-full flex flex-col items-center pb-4 px-2"
        onMouseEnter={() => setIsPanelOpen(true)}
      >
        {/* Floating Arrow Notch Toggle */}
        <button
          onClick={() => setIsPanelOpen((prev) => !prev)}
          className="mb-2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer"
          title={isPanelOpen ? 'Collapse Controls' : 'Expand Controls'}
        >
          <span>{isPanelOpen ? 'Hide Controls' : 'Audio Controls'}</span>
          {isPanelOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-violet-400 group-hover:text-white transition-transform animate-bounce" />
          )}
        </button>

        {/* Sliding Panel */}
        <div
          className={`w-full max-w-4xl transition-all duration-500 ease-out transform ${
            isPanelOpen
              ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
              : 'translate-y-12 opacity-0 scale-95 pointer-events-none'
          }`}
        >
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
        </div>
      </footer>
    </div>
  );
};
