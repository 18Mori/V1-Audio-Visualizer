# Project Context & Master Onboarding Guide

> **CRITICAL RULE FOR ALL INCOMING AI AGENTS:** 
> At the start of every task, refactoring, or debugging session, you **MUST** read `docs/PROJECT_CONTEXT.md` and `docs/ERROR_AND_DECISION_LOG.md`. Do not attempt solutions that have previously failed. After fixing any bug or introducing a major feature, you must update `docs/ERROR_AND_DECISION_LOG.md` with what failed, why it failed, and how it was fixed.

---

## 1. Executive Summary & Vision
This project is a **Next.js 14+ (App Router) & TypeScript** real-time audio and voice visualizer application. Standard static waveform bars or rigid third-party libraries (e.g., `react-voice-visualizer`) are strictly prohibited because they fail to deliver the fluid, organic, high-performance aesthetic required. 

Our goal is to build an immersive, buttery-smooth (60+ FPS) visual experience driven by custom **HTML5 Canvas render loops**, multi-layered sine wave phase shifting, dynamic particle/orb physics, the Gemini Four-Color Gradient Mesh Blob Orb, and real-time Web Audio API frequency/time-domain analysis (`AnalyserNode`).

---

## 2. Tech Stack & Architecture
- **Framework:** Next.js 14 (App Router, Server & Client Components separation)
- **Language:** TypeScript (Strict typing for audio nodes, canvas contexts, and animation state machines)
- **Styling:** Tailwind CSS (Dark-mode frosted glass aesthetics, CSS variables for dynamic neon glows)
- **Rendering Engine:** HTML5 2D Canvas Context (`ctx`) with `devicePixelRatio` HiDPI Retina scaling, requestAnimationFrame optimization, and smooth quadratic splines.
- **Audio Pipeline:** Web Audio API (`AudioContext`, `AnalyserNode`, `MediaStreamSource` for mic inputs, `MediaElementAudioSourceNode` for file uploads)
- **State Management:** React Hooks (`useRef`, `useCallback`, `useEffect`) avoiding unnecessary React re-renders during high-frequency 60fps animation loops.
- **Deployment & CI:** Vercel optimized with GitHub Actions CI workflow for lint/build checks.

---

## 3. Core Architectural Rules
1. **Zero React State in Render Loops:** Never store or update audio frequency/time data in React state (`useState`) during the animation loop. Mutate persistent `useRef` data structures and draw directly via `requestAnimationFrame` to prevent stutter and garbage collection spikes.
2. **Audio Context Lifecycle & User Gesture:** Always initialize/resume `AudioContext` inside an explicit user gesture handler (e.g., click/tap to start/upload) to comply with browser autoplay policies.
3. **Responsive Canvas Resizing:** Canvas backing stores must account for `window.devicePixelRatio` (Retina/High-DPI displays) to ensure crisp rendering without pixelation.
4. **SSR Safety:** Because Web Audio API and HTML5 Canvas depend on browser APIs (`window`, `navigator`, `AudioContext`), all visualizer components must be loaded dynamically with `ssr: false` or guarded with `typeof window !== 'undefined'` checks.

---

## 4. AI Agent Execution & Documentation Mandate (The Documentation Protocol)
> **MANDATORY PROTOCOL FOR ALL FUTURE AI AGENTS:**
> 1. **Read First:** At the beginning of any session or task, read `docs/PROJECT_CONTEXT.md` and `docs/ERROR_AND_DECISION_LOG.md`.
> 2. **Update on Completion:** Upon completing *any* task, bug fix, or feature enhancement, you **MUST** immediately update:
>    - `docs/ERROR_AND_DECISION_LOG.md` (recording attempted approaches, failures, and verified solutions).
>    - `README.md` or other docs if features/architecture changed.
> 3. **Verification Command Reminder:** Always run build checks (`npm run build`) and verify code standards before declaring success.
