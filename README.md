# GEMINI Multimodal Prism & Sparkle Audio Visualizer

A custom, high-end real-time audio and voice visualizer reverse-engineering Google Gemini’s **Multimodal Prism / Sparkle bottom-bar glow** (a fluid, multi-colored, blurred gradient mesh that morphs and shifts dynamically when speaking, listening, or thinking). Built with **Next.js 14+ (App Router), TypeScript, Tailwind CSS**, and a custom **HTML5 Canvas 60FPS Motion Engine**.

---

## ✨ Key Features
- **Zero Third-Party Visualizer Libraries:** 100% custom math physics, overlapping radial gradient meshes, and audio analyser node graphs built from scratch.
- **Dual Audio Source Support:**
  - **Live Microphone Input:** Real-time speech/voice reactivity via `navigator.mediaDevices.getUserMedia`.
  - **Uploaded Audio Files:** Support for `.mp3`, `.wav`, `.aac`, and more playing through `AudioBufferSourceNode`.
- **Gemini Glow & Blur Aesthetic:**
  - Multi-layered soft gradient blobs using Google's brand palette (Indigo `#4285F4`, Purple `#8b5cf6`, Magenta `#ec4899`, Coral Red `#EA4335`, Warm Yellow `#FBBC05`).
  - Heavy canvas blur effects (`ctx.filter = 'blur(55px)'` + `globalCompositeOperation = 'screen'`) for the signature diffused, bleeding-light glow underneath the interface.
- **State-Based UI Transitions:**
  - `idle`: Slow breathing pulse.
  - `listening`: Active horizontal expansion and high-energy noise.
  - `thinking`: Turbulent rotation and color shifting.
  - `speaking`: Rhythmic audio-reactive frequency pulsing.
- **Immersive Full-Screen Canvas & Responsive Controls:** Full-bleed viewport canvas with an auto-hiding bottom control drawer (hover-reveal on desktop).

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
- [`docs/ANIMATION_AND_DESIGN_SYSTEM.md`](docs/ANIMATION_AND_DESIGN_SYSTEM.md) - UI/UX aesthetics, color palettes, motion physics, and Gemini Prism math formulas.
- [`docs/ERROR_AND_DECISION_LOG.md`](docs/ERROR_AND_DECISION_LOG.md) - Institutional memory tracking past hurdles, performance tuning, and verified solutions.
