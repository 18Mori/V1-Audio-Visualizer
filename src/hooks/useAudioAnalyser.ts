'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioSourceType, AudioAnalyserConfig } from '@/types/audio';

interface FileAudioMetadata {
  name: string;
  duration: number;
}

export function useAudioAnalyser(config: AudioAnalyserConfig = {}) {
  const {
    fftSize = 256,
    smoothingTimeConstant = 0.85,
    minDecibels = -90,
    maxDecibels = -10,
  } = config;

  const [activeSource, setActiveSource] = useState<AudioSourceType>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<FileAudioMetadata | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Web Audio persistent refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // HTML5 Audio Element for uploaded files
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const elementSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Real-time audio data buffers (mutated directly to bypass React re-renders)
  const frequencyDataRef = useRef<any>(new Uint8Array(fftSize / 2));
  const timeDomainDataRef = useRef<any>(new Uint8Array(fftSize));

  // Initialize or get persistent AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Initialize AnalyserNode
  const setupAnalyser = useCallback((ctx: AudioContext) => {
    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothingTimeConstant;
      analyser.minDecibels = minDecibels;
      analyser.maxDecibels = maxDecibels;
      analyserRef.current = analyser;

      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      timeDomainDataRef.current = new Uint8Array(analyser.fftSize);
    }
    return analyserRef.current;
  }, [fftSize, smoothingTimeConstant, minDecibels, maxDecibels]);

  // Clean up existing nodes
  const cleanupCurrentSource = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (micSourceNodeRef.current) {
      micSourceNodeRef.current.disconnect();
      micSourceNodeRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
      audioElementRef.current = null;
    }
    if (elementSourceNodeRef.current) {
      elementSourceNodeRef.current.disconnect();
      elementSourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // 1. START MICROPHONE STREAM
  const startMicrophone = useCallback(async () => {
    setError(null);
    try {
      cleanupCurrentSource();
      const ctx = getAudioContext();
      const analyser = setupAnalyser(ctx);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      micStreamRef.current = stream;
      const source = ctx.createMediaStreamSource(stream);
      micSourceNodeRef.current = source;

      source.connect(analyser);
      // Note: Do NOT connect mic source to ctx.destination to prevent feedback loops!

      setActiveSource('mic');
      setIsPlaying(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Microphone permission denied or failed to initialize';
      setError(message);
      setActiveSource('idle');
      setIsPlaying(false);
    }
  }, [cleanupCurrentSource, getAudioContext, setupAnalyser]);

  // 2. PLAY UPLOADED AUDIO FILE
  const loadAudioFile = useCallback((file: File) => {
    setError(null);
    try {
      cleanupCurrentSource();
      const ctx = getAudioContext();
      const analyser = setupAnalyser(ctx);

      const objectUrl = URL.createObjectURL(file);
      const audio = new Audio();
      audio.src = objectUrl;
      audio.crossOrigin = 'anonymous';
      audioElementRef.current = audio;

      // Gain node for volume control
      const gainNode = ctx.createGain();
      gainNodeRef.current = gainNode;

      const source = ctx.createMediaElementSource(audio);
      elementSourceNodeRef.current = source;

      source.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(ctx.destination);

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        setMetadata({ name: file.name, duration: audio.duration });
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.play().then(() => {
        setActiveSource('file');
        setIsPlaying(true);
      }).catch((playErr) => {
        setError('Failed to play audio file: ' + playErr.message);
      });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load audio file';
      setError(message);
      setActiveSource('idle');
    }
  }, [cleanupCurrentSource, getAudioContext, setupAnalyser]);

  const togglePlayPause = useCallback(() => {
    if (activeSource === 'file' && audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [activeSource, isPlaying, getAudioContext]);

  const seek = useCallback((time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const stopAll = useCallback(() => {
    cleanupCurrentSource();
    setActiveSource('idle');
    setIsPlaying(false);
  }, [cleanupCurrentSource]);

  // Read frame data inside animation loop directly
  const updateFrameData = useCallback(() => {
    if (analyserRef.current) {
      analyserRef.current.getByteFrequencyData(frequencyDataRef.current as any);
      analyserRef.current.getByteTimeDomainData(timeDomainDataRef.current as any);
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupCurrentSource();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [cleanupCurrentSource]);

  return {
    activeSource,
    isPlaying,
    error,
    metadata,
    currentTime,
    duration,
    frequencyDataRef,
    timeDomainDataRef,
    startMicrophone,
    loadAudioFile,
    togglePlayPause,
    seek,
    setVolume,
    stopAll,
    updateFrameData,
  };
}
