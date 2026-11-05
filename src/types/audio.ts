export type VisualizerMode = 'waves' | 'orb' | 'bars' | 'dna';

export type AudioSourceType = 'mic' | 'file' | 'idle';

export interface AudioAnalyserConfig {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}
