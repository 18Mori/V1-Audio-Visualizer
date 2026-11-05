'use client';

import React from 'react';
import { VisualizerMode, AudioSourceType } from '@/types/audio';
import { Mic, Upload, Play, Pause, Square, Activity, Radio, BarChart2, Dna } from 'lucide-react';

interface ControlPanelProps {
  mode: VisualizerMode;
  setMode: (mode: VisualizerMode) => void;
  activeSource: AudioSourceType;
  isPlaying: boolean;
  onStartMic: () => void;
  onFileUpload: (file: File) => void;
  onTogglePlayPause: () => void;
  onStop: () => void;
  fileName?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  setMode,
  activeSource,
  isPlaying,
  onStartMic,
  onFileUpload,
  onTogglePlayPause,
  onStop,
  fileName,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const modeOptions: { id: VisualizerMode; label: string; icon: React.ReactNode }[] = [
    { id: 'waves', label: 'Liquid Waves', icon: <Activity className="w-4 h-4" /> },
    { id: 'orb', label: 'Siri Orb', icon: <Radio className="w-4 h-4" /> },
    { id: 'bars', label: 'Neon Bars', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'dna', label: 'DNA Helix', icon: <Dna className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-4xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
      {/* Visualizer Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Rendering Preset</span>
        <div className="flex flex-wrap gap-2">
          {modeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                mode === opt.id
                  ? 'bg-violet-600/90 text-white shadow-lg shadow-violet-600/30 border border-violet-400/30'
                  : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Source & Execution Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Source Switcher */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mic Button */}
          <button
            onClick={onStartMic}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
              activeSource === 'mic'
                ? 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500'
                : 'bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Live Mic</span>
          </button>

          {/* File Upload Button */}
          <label className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm cursor-pointer transition-all duration-300 ${
            activeSource === 'file'
              ? 'bg-cyan-600/90 text-white shadow-lg shadow-cyan-600/30 ring-2 ring-cyan-500'
              : 'bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700'
          }`}>
            <Upload className="w-4 h-4" />
            <span>Upload Audio</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Playback Controls (File Mode Active) */}
        {activeSource === 'file' && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-zinc-400 truncate max-w-[150px]" title={fileName}>
              {fileName || 'Audio Track'}
            </span>
            <button
              onClick={onTogglePlayPause}
              className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={onStop}
              className="p-2.5 bg-red-950/50 hover:bg-red-900/60 text-red-400 rounded-xl transition-all border border-red-800/40"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mic Mode Active Status */}
        {activeSource === 'mic' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Mic Streaming
            </div>
            <button
              onClick={onStop}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs transition-all"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
