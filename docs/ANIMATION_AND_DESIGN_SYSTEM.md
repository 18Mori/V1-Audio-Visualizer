# Design and Animation System Blueprint

## 1. Aesthetic & Theme
- **Base Palette:** Deep OLED Black / Zinc 950 (`#09090b`), frosted glass panels with `backdrop-blur-md bg-zinc-900/40 border border-zinc-800/70 shadow-2xl`.
- **Google Gemini Signature Colors (Multimodal Prism & Sparkle Gradient Mesh):**
  - Google Blue: `#4285F4`
  - Purple / Violet: `#8b5cf6`
  - Magenta / Pink: `#ec4899`
  - Google Red: `#EA4335`
  - Google Yellow: `#FBBC05`
- **Typography:** Inter / Geist Sans with glowing text gradients for headers.

---

## 2. Animation & Motion Physics (Gemini Multimodal Prism Glow)
- **Overlapping Radial Gradient Mesh:**
  - Multiple soft gradient blobs positioned along the bottom bar with `ctx.filter = 'blur(55px)'` and `globalCompositeOperation = 'screen'` for additive color bleeding.
- **Trigonometric Organic Motion (Simplex / Perlin Noise Overlay):**
  - Coordinates and radii drift over time using `Math.sin` and `Math.cos` phase offsets driven by real-time audio frequency amplitude and volume.
- **State-Based UI Transitions:**
  - `idle`: Slow breathing pulse ($A = 0.08$).
  - `listening`: Active horizontal expansion ($1.4\times$) and high-energy frequency displacement.
  - `thinking`: Turbulent rotation and color-shifting across Google brand palette.
  - `speaking`: Rhythmic audio-reactive pulsing driven directly by `AnalyserNode` frequency bins.

---

## 3. Layouts & Responsiveness
- **Desktop:** Immersive full-screen background canvas with a bottom hover-reveal control drawer.
- **Mobile:** Full-screen canvas with touch-optimized state pills and collapsible audio control drawer.
