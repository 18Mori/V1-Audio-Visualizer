'use client';

import React, { useRef, useEffect } from 'react';
import { VisualizerMode } from '@/types/audio';

interface AnimatedVisualizerCanvasProps {
  mode: VisualizerMode;
  frequencyDataRef: React.MutableRefObject<Uint8Array>;
  timeDomainDataRef: React.MutableRefObject<Uint8Array>;
  updateFrameData: () => void;
  isPlaying: boolean;
  className?: string;
}

export const AnimatedVisualizerCanvas: React.FC<AnimatedVisualizerCanvasProps> = ({
  mode,
  frequencyDataRef,
  timeDomainDataRef,
  updateFrameData,
  isPlaying,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  
  // Animation state physics refs (persisted to prevent GC lag)
  const phaseRef = useRef<number>(0);
  const smoothedEnergyRef = useRef<number>(0);
  const smoothedFreqRef = useRef<Float32Array>(new Float32Array(128));

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

    // Dynamic Particle Array for Orb/Ambient effects
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    // MAIN 60 FPS RENDER LOOP
    const render = () => {
      updateFrameData();

      const freq = frequencyDataRef.current;
      const time = timeDomainDataRef.current;

      // 1. Calculate Average Energy & Smooth with Lerp
      let rawSum = 0;
      for (let i = 0; i < freq.length; i++) {
        rawSum += freq[i];
      }
      const rawAvg = rawSum / (freq.length || 1);
      const targetEnergy = isPlaying ? rawAvg / 255 : 0.05 + Math.sin(Date.now() * 0.002) * 0.02; // Soft breathing pulse when idle
      
      smoothedEnergyRef.current += (targetEnergy - smoothedEnergyRef.current) * 0.1;
      const energy = smoothedEnergyRef.current;

      // Smooth individual frequency bins
      const smoothFreq = smoothedFreqRef.current;
      for (let i = 0; i < smoothFreq.length; i++) {
        const target = freq[i] ? freq[i] / 255 : 0.02;
        smoothFreq[i] += (target - smoothFreq[i]) * 0.15;
      }

      // Advance animation phase
      phaseRef.current += 0.02 + energy * 0.05;
      const phase = phaseRef.current;

      // 2. Clear Canvas with slight fade trail for motion blur
      ctx.fillStyle = 'rgba(9, 9, 11, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 3. Render Selected Visualizer Mode
      switch (mode) {
        case 'waves': {
          // Multi-layer Sine Wave Superposition
          const layers = [
            { color: '#8b5cf6', amplitude: 60, speed: 1.0, offset: 0 },
            { color: '#06b6d4', amplitude: 45, speed: 1.4, offset: Math.PI / 3 },
            { color: '#ec4899', amplitude: 30, speed: 1.8, offset: (2 * Math.PI) / 3 },
          ];

          layers.forEach((layer) => {
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = layer.color;
            ctx.shadowBlur = 15 + energy * 25;
            ctx.shadowColor = layer.color;

            const sliceWidth = width / 100;
            let x = 0;

            for (let i = 0; i <= 100; i++) {
              const freqIdx = Math.floor((i / 100) * (freq.length / 2));
              const localEnergy = smoothFreq[freqIdx] || energy;

              const wave1 = Math.sin(i * 0.05 + phase * layer.speed + layer.offset);
              const wave2 = Math.cos(i * 0.03 - phase * 0.8 + layer.offset);
              
              const dynamicAmp = layer.amplitude * (0.2 + localEnergy * 1.8);
              const y = centerY + (wave1 + wave2) * dynamicAmp * Math.sin((i / 100) * Math.PI); // Pinched at edges

              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);

              x += sliceWidth;
            }
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow for performance
          });
          break;
        }

        case 'orb': {
          // Siri / Liquid Morphing Orb Mode
          const baseRadius = Math.min(width, height) * 0.2;
          const radius = baseRadius + energy * baseRadius * 0.8;

          ctx.save();
          ctx.translate(centerX, centerY);

          // Draw Glowing Outer Aura
          const gradient = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 1.8);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
          gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.4)');
          gradient.addColorStop(1, 'rgba(9, 9, 11, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, radius * 1.8, 0, Math.PI * 2);
          ctx.fill();

          // Draw Liquid Morphing Core Shape
          const points = 64;
          ctx.beginPath();
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const freqIdx = Math.floor((i / points) * (freq.length / 4));
            const freqAmp = smoothFreq[freqIdx] || energy;

            const n1 = Math.sin(angle * 4 + phase * 2) * 15 * (1 + freqAmp * 2);
            const n2 = Math.cos(angle * 6 - phase * 1.5) * 10 * (1 + freqAmp * 2);
            
            const currentRadius = radius + n1 + n2;
            const px = Math.cos(angle) * currentRadius;
            const py = Math.sin(angle) * currentRadius;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();

          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 4;
          ctx.shadowBlur = 20 + energy * 30;
          ctx.shadowColor = '#ec4899';
          ctx.stroke();

          ctx.restore();
          break;
        }

        case 'bars': {
          // Dynamic Neon Frequency Spectrum Bars
          const barCount = 48;
          const barWidth = (width / barCount) * 0.6;
          const gap = (width / barCount) * 0.4;
          const maxHeight = height * 0.5;

          ctx.shadowBlur = 10;

          for (let i = 0; i < barCount; i++) {
            const freqIdx = Math.floor((i / barCount) * (freq.length / 2));
            const barHeight = Math.max(6, smoothFreq[freqIdx] * maxHeight);

            const x = i * (barWidth + gap) + gap / 2;
            const y = centerY - barHeight / 2;

            const hue = (i / barCount) * 280 + 180; // Cyan to Magenta gradient
            const color = `hsl(${hue}, 90%, 60%)`;

            ctx.fillStyle = color;
            ctx.shadowColor = color;

            // Rounded vertical bars
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2]);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          break;
        }

        case 'dna': {
          // 3D Double Helix DNA Strand Mode
          const nodes = 32;
          const spacing = width / nodes;
          const amp = height * 0.2 * (0.5 + energy * 1.5);

          for (let i = 0; i < nodes; i++) {
            const x = i * spacing;
            const freqIdx = Math.floor((i / nodes) * (freq.length / 2));
            const localEnergy = smoothFreq[freqIdx] || energy;

            const angle1 = i * 0.2 + phase;
            const angle2 = angle1 + Math.PI;

            const y1 = centerY + Math.sin(angle1) * amp;
            const y2 = centerY + Math.sin(angle2) * amp;

            const size1 = 4 + Math.cos(angle1) * 3 + localEnergy * 6;
            const size2 = 4 + Math.cos(angle2) * 3 + localEnergy * 6;

            // Connecting Strand
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
            ctx.lineWidth = 2;
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.stroke();

            // Node 1
            ctx.beginPath();
            ctx.arc(x, y1, Math.max(1, size1), 0, Math.PI * 2);
            ctx.fillStyle = '#06b6d4';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#06b6d4';
            ctx.fill();

            // Node 2
            ctx.beginPath();
            ctx.arc(x, y2, Math.max(1, size2), 0, Math.PI * 2);
            ctx.fillStyle = '#ec4899';
            ctx.shadowColor = '#ec4899';
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          break;
        }
      }

      // 4. Ambient Floating Dust Particles
      particles.forEach((p) => {
        p.y -= p.speed * (1 + energy * 2);
        p.angle += 0.01;
        p.x += Math.cos(p.angle) * 0.5;

        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (1 + energy), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * (0.3 + energy * 0.7)})`;
        ctx.fill();
      });

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [mode, isPlaying, updateFrameData, frequencyDataRef, timeDomainDataRef]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block rounded-2xl ${className}`}
    />
  );
};
