'use client';

import React, { useRef, useEffect } from 'react';
import { VisualizerState } from '@/types/audio';

interface GeminiGlowPrismCanvasProps {
  state: VisualizerState;
  frequencyDataRef: React.MutableRefObject<any>;
  timeDomainDataRef: React.MutableRefObject<any>;
  updateFrameData: () => void;
  isPlaying: boolean;
  className?: string;
}

export const GeminiGlowPrismCanvas: React.FC<GeminiGlowPrismCanvasProps> = ({
  state,
  frequencyDataRef,
  timeDomainDataRef,
  updateFrameData,
  isPlaying,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Persistent physics refs for buttery-smooth lerp damping
  const phaseRef = useRef<number>(0);
  const energyRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const handleResize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Google Brand Colors for Gemini Prism Mesh
    const colors = [
      { r: 66, g: 133, b: 244 },  // Google Blue
      { r: 139, g: 92, b: 246 },  // Purple
      { r: 236, g: 72, b: 153 },  // Magenta
      { r: 234, g: 67, b: 53 },   // Coral Red
      { r: 251, g: 188, b: 5 },   // Warm Yellow
    ];

    // MAIN 60 FPS RENDER LOOP
    const render = () => {
      updateFrameData();

      const freq = frequencyDataRef.current;

      // 1. Calculate Audio Energy / Volume
      let sum = 0;
      const freqLen = freq ? freq.length : 0;
      for (let i = 0; i < freqLen; i++) {
        sum += freq[i];
      }
      const avg = sum / (freqLen || 1);

      // State-based target energy and speed multipliers
      let targetEnergy = isPlaying ? avg / 255 : 0.1;
      let speedMultiplier = 1.0;

      if (state === 'listening') {
        targetEnergy = Math.max(0.3, targetEnergy * 1.5);
        speedMultiplier = 1.8;
      } else if (state === 'thinking') {
        targetEnergy = 0.4 + Math.sin(Date.now() * 0.005) * 0.2;
        speedMultiplier = 2.5;
      } else if (state === 'speaking') {
        targetEnergy = Math.max(0.2, avg / 200);
        speedMultiplier = 2.0;
      } else {
        // idle
        targetEnergy = 0.08 + Math.sin(Date.now() * 0.002) * 0.03;
        speedMultiplier = 0.6;
      }

      energyRef.current += (targetEnergy - energyRef.current) * 0.08;
      const energy = energyRef.current;

      phaseRef.current += 0.015 * speedMultiplier;
      const phase = phaseRef.current;

      // 2. Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 3. Render Gemini Multimodal Prism Bottom-Bar Glow
      ctx.save();
      ctx.globalCompositeOperation = 'screen'; // Additive prism glow
      ctx.filter = 'blur(55px)'; // Signature Gemini heavy diffused blur

      const bottomY = height + 40; // Positioned along bottom bar
      const blobCount = colors.length;

      colors.forEach((col, idx) => {
        const angleOffset = (idx / blobCount) * Math.PI * 2;
        
        // Trigonometric organic motion offset (Simplex-like wave overlays)
        const xOffset = Math.sin(phase * 0.8 + angleOffset) * (width * 0.25) * (state === 'listening' ? 1.4 : 1.0);
        const yOffset = Math.cos(phase * 0.6 + angleOffset * 2) * 50 * (state === 'thinking' ? 1.8 : 1.0);

        const x = width / 2 + xOffset;
        const y = bottomY + yOffset - (energy * 100);

        const baseRadius = width * 0.25;
        const radius = baseRadius * (0.8 + energy * 1.2 + Math.sin(phase + idx) * 0.2);

        const radialGrad = ctx.createRadialGradient(x, y, radius * 0.05, x, y, radius);
        radialGrad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${0.75 + energy * 0.25})`);
        radialGrad.addColorStop(0.5, `rgba(${col.r}, ${col.g}, ${col.b}, ${0.35 + energy * 0.2})`);
        radialGrad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);

        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      // 4. Supplemental Top Accent Shimmer Line (Gemini Bottom Bar Rim)
      ctx.save();
      ctx.beginPath();
      const lineGradient = ctx.createLinearGradient(0, height - 2, width, height - 2);
      lineGradient.addColorStop(0, 'rgba(66, 133, 244, 0)');
      lineGradient.addColorStop(0.25, 'rgba(66, 133, 244, 0.8)');
      lineGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.9)');
      lineGradient.addColorStop(0.75, 'rgba(234, 67, 53, 0.8)');
      lineGradient.addColorStop(1, 'rgba(251, 188, 5, 0)');

      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 2 + energy * 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#8b5cf6';
      
      const sliceWidth = width / 100;
      let lineX = 0;
      for (let i = 0; i <= 100; i++) {
        const freqIdx = freq ? Math.floor((i / 100) * (freq.length / 2)) : 0;
        const val = freq && freq[freqIdx] ? freq[freqIdx] / 255 : energy;
        const lineY = height - 10 - Math.sin(i * 0.1 + phase * 3) * (10 * val);

        if (i === 0) ctx.moveTo(lineX, lineY);
        else ctx.lineTo(lineX, lineY);
        lineX += sliceWidth;
      }
      ctx.stroke();
      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [state, isPlaying, updateFrameData, frequencyDataRef, timeDomainDataRef]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block pointer-events-none ${className}`}
    />
  );
};
