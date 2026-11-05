# VIBE - Real-Time Audio & Voice Visualizer

A premium, highly animated real-time audio and voice visualizer built with **Next.js 14+ (App Router), TypeScript, Tailwind CSS**, and a custom **HTML5 Canvas 60FPS Motion Engine** driven by the Web Audio API.

---

## ✨ Key Features
- **Zero Third-Party Visualizer Libraries:** 100% custom math physics, render loops, and audio analyser node graphs built from scratch.
- **Dual Audio Source Support:**
  - **Live Microphone Input:** Real-time speech/voice reactivity via `navigator.mediaDevices.getUserMedia`.
  - **Uploaded Audio Files:** Support for `.mp3`, `.wav`, `.aac`, and more playing through `AudioBufferSourceNode`.
- **5 High-End Animation Modes:**
  1. *Liquid Waves*: Multi-layer sine wave superposition with phase shifting.
  2. *Siri Orb*: Fluid glowing core with dynamic frequency reactivity.
  3. *Neon Bars*: High-energy spectrum frequency analyzer bars.
  4. *DNA Helix*: 3D double-helix strand reactive nodes.
  5. *Gemini Sparkle*: Google's signature Four-Color Gradient Mesh Blob Orb (`#4285F4`, `#8b5cf6`, `#EA4335`, `#FBBC05`) with drifting mesh centers and parametric vertex blob deformation.
- **Immersive Full-Screen Canvas & Responsive Controls:** Full-bleed viewport canvas with an auto-hiding bottom control drawer (hover-reveal on desktop, touch-friendly floating arrow notch on mobile).

---

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📚 Project Documentation (`/docs`)
- [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md) - Master onboarding guide & incoming agent governance rules.
- [`docs/ANIMATION_AND_DESIGN_SYSTEM.md`](docs/ANIMATION_AND_DESIGN_SYSTEM.md) - UI/UX aesthetics, color palettes, motion physics, and math formulas.
- [`docs/ERROR_AND_DECISION_LOG.md`](docs/ERROR_AND_DECISION_LOG.md) - Institutional memory tracking past hurdles, performance tuning, and verified solutions.
