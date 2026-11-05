'use client';

import React, { useState } from 'react';
import { VisualizerState } from '@/types/audio';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { GeminiGlowPrismCanvas } from '@/components/canvas/GeminiGlowPrismCanvas';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { Sparkles, Mic, Brain, Volume2, Moon } from 'lucide-react';

export const GeminiPrismStudio: React.FC = () => {
  const [state, setState] = useState<VisualizerState>('idle');
  const [isHovered, setIsHovered] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);

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

  const stateButtons: { id: VisualizerState; label: string; icon: React.ReactNode }[] = [
    { id: 'idle', label: 'Idle', icon: <Moon className="w-4 h-4" /> },
    { id: 'listening', label: 'Listening', icon: <Mic className="w-4 h-4" /> },
    { id: 'thinking', label: 'Thinking', icon: <Brain className="w-4 h-4" /> },
    { id: 'speaking', label: 'Speaking', icon: <Volume2 className="w-4 h-4" /> },
  ];

  const showPanel = isHovered || isPinnedOpen;

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col justify-between p-4 sm:p-8 overflow-hidden font-sans">
      {/* Full-Screen Gemini Bottom Glow Prism Background */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <GeminiGlowPrismCanvas
          state={state}
          frequencyDataRef={frequencyDataRef}
          timeDomainDataRef={timeDomainDataRef}
          updateFrameData={updateFrameData}
          isPlaying={isPlaying}
          className="w-full h-full"
        />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between py-4 px-2 sm:px-6">
        <div className="flex items-center gap-3 backdrop-blur-md bg-zinc-900/50 border border-zinc-800/70 px-4 py-2 rounded-2xl shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-yellow-300">
              GEMINI <span className="text-zinc-300 font-normal">Prism Glow</span>
            </h1>
            <p className="text-[11px] text-zinc-400">Multimodal Sparkle & Bottom-Bar Mesh</p>
          </div>
        </div>

        {/* State Selector Pill */}
        <div className="hidden sm:flex items-center gap-1 backdrop-blur-md bg-zinc-900/60 border border-zinc-800/80 p-1.5 rounded-2xl shadow-xl">
          {stateButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setState(btn.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                state === btn.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {btn.icon}
              <span className="capitalize">{btn.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Mobile State Selector */}
      <div className="relative z-10 sm:hidden flex justify-center gap-1 my-2">
        {stateButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setState(btn.id)}
            className={`p-2 rounded-xl text-xs ${
              state === btn.id ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400'
            }`}
            title={btn.label}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Main Studio Center Area */}
      <main className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col items-center justify-center pointer-events-none">
        {activeSource === 'idle' && (
          <div className="flex flex-col items-center justify-center p-8 text-center backdrop-blur-md bg-zinc-900/30 border border-zinc-800/50 rounded-3xl shadow-2xl max-w-md pointer-events-auto animate-float">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 mb-4 shadow-xl">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mb-2">
              Gemini Prism Active
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Select your state above or activate your microphone / upload music to see the multi-colored gradient mesh bottom glow react in real-time.
            </p>
          </div>
        )}
      </main>

      {/* Bottom Hover Zone & Collapsible Drawer */}
      <footer 
        className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center pb-3 px-2 pointer-events-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`w-full max-w-4xl transition-all duration-500 ease-out transform pointer-events-auto ${
            showPanel
              ? 'translate-y-0 opacity-100 scale-100'
              : 'translate-y-24 opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <ControlPanel
            mode={'sparkle'}
            setMode={() => {}}
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
