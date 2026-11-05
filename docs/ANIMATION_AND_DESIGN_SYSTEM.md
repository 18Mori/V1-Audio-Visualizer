# Design and Animation System Blueprint

## 1. Aesthetic & Theme
- **Base Palette:** Deep OLED Black / Zinc 950 (`#09090b`), frosted glass panels with `backdrop-blur-md bg-zinc-900/40 border border-zinc-800/70 shadow-2xl`.
- **Google Gemini Signature Colors (Four-Color Sparkle & Gradient Mesh):**
  - Google Blue: `#4285F4`
  - Purple / Violet: `#8b5cf6`
  - Google Red: `#EA4335`
  - Google Yellow: `#FBBC05`
- **Neon Accents:** Cyber Cyan (`#06b6d4`), Electric Magenta (`#ec4899`), Emerald Beam (`#10b981`).
- **Typography:** Inter / Geist Sans with glowing text gradients for headers.

---

## 2. Animation & Motion Physics
- **Multi-Layer Sine Wave Superposition:**
  - 3 overlapping sine waves running simultaneously with distinct frequencies, amplitudes, and phase offsets ($\phi$).
  - Phase velocity increments every frame ($\phi_{n+1} = \phi_n + \omega_n \cdot dt$) to create liquid flowing undulations.
- **Linear Interpolation (Lerp) Damping & Heavy Damping:**
  - Raw audio frequency data is smoothed using heavier damping factors (`0.06` and `0.08`) to eliminate jagged spiking and produce buttery-soft, lag-free floating transitions.
- **Gemini Gradient Mesh Blob Orb:**
  - Overlapping radial gradients (`ctx.createRadialGradient`) whose center positions drift over time using $\sin$ and $\cos$ trigonometric offsets.
  - Deformed perimeter blob equations: $$R(\theta) = R_{\text{base}} + \text{Amplitude} \cdot \sin(k \cdot \theta + \text{time})$$ rendered using smooth quadratic bezier splines (`ctx.quadraticCurveTo`) to prevent any sharp corners or overlapping line intersections.
- **Glow & Shadow Effects:**
  - Canvas context `shadowBlur` and `shadowColor` dynamically tuned to peak frequency amplitudes.

---

## 3. Layouts & Responsiveness
- **Desktop:** Immersive full-screen background canvas with a bottom hover-reveal control drawer.
- **Mobile:** Full-screen canvas with a touch-friendly floating arrow notch at the bottom center for collapsible control management.
