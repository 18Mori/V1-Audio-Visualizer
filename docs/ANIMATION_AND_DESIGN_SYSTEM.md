# Design and Animation System Blueprint

## 1. Aesthetic & Theme
- **Base Palette:** Deep OLED Black / Zinc 950 (`#09090b`), frosted glass panels with `backdrop-blur-xl bg-zinc-900/60 border border-zinc-800/80 shadow-2xl`.
- **Accent Glows:** Neon Violet (`#8b5cf6`), Cyber Cyan (`#06b6d4`), Electric Magenta (`#ec4899`), and Emerald Beam (`#10b981`).
- **Typography:** Inter / Geist Sans with glowing text gradients for headers.

---

## 2. Animation & Motion Physics
- **Multi-Layer Sine Wave Superposition:**
  - 3 overlapping sine waves running simultaneously with distinct frequencies, amplitudes, and phase offsets ($\phi$).
  - Phase velocity increments every frame ($\phi_{n+1} = \phi_n + \omega_n \cdot dt$) to create liquid flowing undulations.
- **Linear Interpolation (Lerp) Damping:**
  - Raw audio frequency data is smoothed using lerp (`current = current + (target - current) * dampingFactor`) to eliminate jagged spiking and produce organic floating transitions.
- **Particle Orbitals (Siri Orb Mode):**
  - Concentric glowing rings and orbiting particles whose radius and opacity pulsate based on RMS (Root Mean Square) energy of the audio stream.
- **Glow & Shadow Effects:**
  - Canvas context `shadowBlur` and `shadowColor` dynamically tuned to peak frequency amplitudes.

---

## 3. Layouts & Responsiveness
- **Desktop:** Centered immersive card with floating control bar, preset visualizer mode selectors (Sine Wave, Liquid Orb, Frequency Bars), and audio source toggles (Microphone vs. File Upload).
- **Mobile:** Full-screen vertical flex layout with collapsible drawer controls and touch-optimized input targets (min 44px).
