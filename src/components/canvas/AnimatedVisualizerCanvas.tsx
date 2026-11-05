'use client';

import React, { useRef, useEffect } from 'react';
import { VisualizerMode } from '@/types/audio';

interface AnimatedVisualizerCanvasProps {
  mode: VisualizerMode;
  frequencyDataRef: React.MutableRefObject<any>;
  timeDomainDataRef: React.MutableRefObject<any>;
  updateFrameData: () => void;
  isPlaying: boolean;
  sensitivity?: number;
  className?: string;
}

export const AnimatedVisualizerCanvas: React.FC<AnimatedVisualizerCanvasProps> = ({
  mode,
  frequencyDataRef,
  timeDomainDataRef,
  updateFrameData,
  isPlaying,
  sensitivity = 1.5,
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

      // 1. Calculate Average Energy & Smooth with Heavier Damping for Butter-Smooth Motion
      let rawSum = 0;
      for (let i = 0; i < freq.length; i++) {
        rawSum += freq[i];
      }
      const rawAvg = rawSum / (freq.length || 1);
      const targetEnergy = isPlaying ? (rawAvg / 255) * sensitivity : 0.05 + Math.sin(Date.now() * 0.0015) * 0.02; // Gentle breathing pulse when idle
      
      // Butter-smooth damping factor (0.06 instead of 0.1) for organic, lag-free fluidity
      smoothedEnergyRef.current += (targetEnergy - smoothedEnergyRef.current) * 0.06;
      const energy = smoothedEnergyRef.current;

      // Smooth individual frequency bins with heavier damping
      const smoothFreq = smoothedFreqRef.current;
      for (let i = 0; i < smoothFreq.length; i++) {
        const target = freq[i] ? (freq[i] / 255) * sensitivity : 0.02;
        smoothFreq[i] += (target - smoothFreq[i]) * 0.08;
      }

      // Advance animation phase slower for silkiness
      phaseRef.current += 0.012 + energy * 0.03;
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
          // Gemini Four-Color Sparkle Orb (Google Brand Colors: Blue #4285F4, Purple #8b5cf6, Red #EA4335, Yellow #FBBC05)
          const baseRadius = Math.min(width, height) * 0.22;
          const radius = baseRadius + energy * baseRadius * 0.9;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(phase * 0.2); // Slow rotation for fluid sparkle mesh

          // 1. Four-Color Sparkle Outer Glow (Gemini Signature Gradient Mesh)
          const gradient = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius * 2.2);
          gradient.addColorStop(0, 'rgba(66, 133, 244, 0.7)');   // Google Blue
          gradient.addColorStop(0.33, 'rgba(139, 92, 246, 0.6)'); // Purple
          gradient.addColorStop(0.66, 'rgba(234, 67, 53, 0.5)');  // Google Red
          gradient.addColorStop(1, 'rgba(251, 188, 5, 0)');       // Google Yellow fade out

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, radius * 2.2, 0, Math.PI * 2);
          ctx.fill();

          // 2. Inner Fluid Morphing Core Shape with Smooth Quadratic Splines
          const points = 72;
          const coords: { x: number; y: number }[] = [];
          for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const freqIdx = Math.floor((i / points) * (freq.length / 3));
            const freqAmp = smoothFreq[freqIdx] || energy;

            const n1 = Math.sin(angle * 3 + phase * 1.5) * 10 * (1 + freqAmp * 1.2);
            const n2 = Math.cos(angle * 5 - phase * 1.2) * 6 * (1 + freqAmp * 1.2);
            
            const currentRadius = radius + n1 + n2;
            coords.push({
              x: Math.cos(angle) * currentRadius,
              y: Math.sin(angle) * currentRadius,
            });
          }

          ctx.beginPath();
          ctx.moveTo(coords[0].x, coords[0].y);
          for (let i = 0; i < coords.length; i++) {
            const p1 = coords[i];
            const p2 = coords[(i + 1) % coords.length];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
          }
          ctx.closePath();

          // Four-Color Sparkle Linear Gradient Stroke
          const strokeGradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
          strokeGradient.addColorStop(0, '#4285F4'); // Blue
          strokeGradient.addColorStop(0.35, '#8b5cf6'); // Purple
          strokeGradient.addColorStop(0.7, '#EA4335'); // Red
          strokeGradient.addColorStop(1, '#FBBC05'); // Yellow

          ctx.strokeStyle = strokeGradient;
          ctx.lineWidth = 5;
          ctx.shadowBlur = 25 + energy * 40;
          ctx.shadowColor = '#8b5cf6';
          ctx.stroke();

          // 3. Center Core Sparkle Highlight
          ctx.beginPath();
          ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15);';
          ctx.fill();

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

        case 'sparkle': {
          // Gemini-Style Multi-Color Gradient Mesh Blob Orb (Google Brand Colors: Blue #4285F4, Purple #8b5cf6, Red #EA4335, Yellow #FBBC05)
          const baseRadius = Math.min(width, height) * 0.22;
          const currentBaseRadius = baseRadius * (1 + energy * 0.7);

          ctx.save();
          ctx.translate(centerX, centerY);

          // 1. Drifting Overlapping Radial Gradients (Gradient Mesh Effect)
          const driftX1 = Math.sin(phase * 0.8) * 35;
          const driftY1 = Math.cos(phase * 0.6) * 35;
          const driftX2 = Math.cos(phase * 0.9) * 40;
          const driftY2 = Math.sin(phase * 0.7) * 40;

          // Google Blue / Purple Mesh Layer
          const grad1 = ctx.createRadialGradient(driftX1, driftY1, currentBaseRadius * 0.1, driftX1, driftY1, currentBaseRadius * 1.8);
          grad1.addColorStop(0, 'rgba(66, 133, 244, 0.85)');   // Google Blue
          grad1.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)'); // Purple
          grad1.addColorStop(1, 'rgba(66, 133, 244, 0)');

          ctx.fillStyle = grad1;
          ctx.beginPath();
          ctx.arc(driftX1, driftY1, currentBaseRadius * 1.8, 0, Math.PI * 2);
          ctx.fill();

          // Google Red / Yellow Mesh Layer
          const grad2 = ctx.createRadialGradient(driftX2, driftY2, currentBaseRadius * 0.1, driftX2, driftY2, currentBaseRadius * 1.8);
          grad2.addColorStop(0, 'rgba(234, 67, 53, 0.85)');   // Google Red
          grad2.addColorStop(0.5, 'rgba(251, 188, 5, 0.5)');  // Google Yellow
          grad2.addColorStop(1, 'rgba(234, 67, 53, 0)');

          ctx.fillStyle = grad2;
          ctx.beginPath();
          ctx.arc(driftX2, driftY2, currentBaseRadius * 1.8, 0, Math.PI * 2);
          ctx.fill();

          // 2. Deformed Perimeter (Blob Effect) with Smooth Quadratic Splines
          const vertices = 72;
          const sparkleCoords: { x: number; y: number }[] = [];
          for (let i = 0; i < vertices; i++) {
            const theta = (i / vertices) * Math.PI * 2;
            const freqIdx = Math.floor((i / vertices) * (smoothFreq.length / 2));
            const freqVal = smoothFreq[freqIdx] || energy;

            const k = 4; // gentle wave frequency
            const deform = Math.sin(k * theta + phase * 1.5) * 12 * freqVal + Math.cos(2 * theta - phase) * 8 * energy;
            const r = currentBaseRadius + deform;

            sparkleCoords.push({
              x: Math.cos(theta) * r,
              y: Math.sin(theta) * r,
            });
          }

          ctx.beginPath();
          ctx.moveTo(sparkleCoords[0].x, sparkleCoords[0].y);
          for (let i = 0; i < sparkleCoords.length; i++) {
            const p1 = sparkleCoords[i];
            const p2 = sparkleCoords[(i + 1) % sparkleCoords.length];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
          }
          ctx.closePath();

          // Gradient Stroke enclosing the blob orb
          const strokeGrad = ctx.createLinearGradient(-currentBaseRadius, -currentBaseRadius, currentBaseRadius, currentBaseRadius);
          strokeGrad.addColorStop(0, '#4285F4');
          strokeGrad.addColorStop(0.33, '#8b5cf6');
          strokeGrad.addColorStop(0.66, '#EA4335');
          strokeGrad.addColorStop(1, '#FBBC05');

          ctx.strokeStyle = strokeGrad;
          ctx.lineWidth = 4 + energy * 4;
          ctx.shadowBlur = 30 + energy * 40;
          ctx.shadowColor = '#8b5cf6';
          ctx.stroke();

          // 3. Inner Core Highlight Sparkle
          ctx.beginPath();
          ctx.arc(0, 0, currentBaseRadius * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fill();

          ctx.restore();
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
