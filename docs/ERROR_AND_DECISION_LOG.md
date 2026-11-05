# Error and Decision Log (Institutional Memory)

> **Purpose:** Record past architectural hurdles, debugging breakthroughs, performance tuning, and verified solutions. Incoming agents must review this log before proposing code changes.

---

## Log Template
- **Date:** YYYY-MM-DD
- **Context:** Feature or bug fix context
- **Attempted Approach:** What was tried
- **Failure / Error Encountered:** Why it failed (e.g., AudioContext suspended, React re-render lag, canvas scaling blur)
- **Verified Solution:** The exact fix and performance metric

---

## Initial Entries

### Entry #001: AudioContext Autoplay Policy & User Gesture
- **Date:** 2026-03-05
- **Context:** Initial Web Audio API wiring for microphone and file uploads.
- **Attempted Approach:** Instantiating `new AudioContext()` on component mount (`useEffect`).
- **Failure / Error Encountered:** Browsers (Chrome, Safari) throw `DOMException: AudioContext.resume() failed: the AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page.`
- **Verified Solution:** Lazily initialize `AudioContext` inside a click/tap handler (`startVisualizer` or file drop/upload handler) and explicitly invoke `audioContext.resume()` if state is `suspended`.

### Entry #002: Canvas Retina / HiDPI Blur
- **Date:** 2026-03-05
- **Context:** High-end Canvas rendering on Retina MacBooks and high-DPI Windows displays.
- **Attempted Approach:** Using CSS width/height directly without accounting for `window.devicePixelRatio`.
- **Failure / Error Encountered:** Rendered lines and glow effects appeared pixelated and blurry.
- **Verified Solution:** Scale canvas internal drawing buffer by `window.devicePixelRatio` and scale canvas context (`ctx.scale(dpr, dpr)`), while maintaining CSS dimensions via Tailwind or style rules.

### Entry #003: Autoprefixer & Uint8Array Buffer Typing
- **Date:** 2026-03-05
- **Context:** Production build compilation and TypeScript strict type checking.
- **Attempted Approach:** Standard Next.js CSS processing and strict `Uint8Array` references.
- **Failure / Error Encountered:** Missing `autoprefixer` module for PostCSS and TypeScript `ArrayBufferLike` vs `ArrayBuffer` type mismatch in `AnalyserNode.getByteFrequencyData`.
- **Verified Solution:** Installed `autoprefixer` as a devDependency and typed audio data refs as `any` / cast during analyser buffer population. Verified production build compiles successfully with 0 errors.
