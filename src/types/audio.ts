export type VisualizerMode = 'waves' | 'orb' | 'bars' | 'portal' | 'sparkle' | 'gemini-prism';

export type VisualizerState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type AudioSourceType = 'mic' | 'file' | 'idle';

export interface AudioAnalyserConfig {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}
