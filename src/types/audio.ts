export type VisualizerMode = 'waves' | 'orb' | 'bars' | 'prism-loader' | 'sparkle' | 'gemini-prism';

export type VisualizerState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type AudioSourceType = 'mic' | 'file' | 'idle';

export interface AudioAnalyserConfig {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}
