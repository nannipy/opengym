---
name: frontend-design
description: Guidance for distinctive, intentional visual design, polished UI/UX, refined typography, aesthetic system design, custom branding/logos, and fluid physics-based micro-animations.
---

# Frontend Design & Modern UI/UX System

Approach this as the lead product designer and creative director crafting a distinct, polished visual identity that feels custom-built, responsive, and tactile.

## Core Pillars

1. **Brand & Identity**:
   - Distinctive vector logo and icon mark designed for the product theme (strength, performance, modern fitness).
   - Cohesive brand presence in navigation, loading states, and headers.

2. **System Design & Tokens**:
   - **Dark Mode (Obsidian Precision)**: Deep pitch-black background (`#0a0a0c`), layered card surfaces (`rgba(255, 255, 255, 0.035)` with `rgba(255, 255, 255, 0.08)` borders), crisp typography, vibrant performance neon accent (`#a3e635` / lime electric).
   - **Light Mode (Clean Atelier)**: Crisp bright whites (`#ffffff`), warm subtle paper backdrop (`#f8fafc`), soft shadows (`box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05)`), dark graphite text (`#0f172a`).
   - Hairline borders with glassmorphism blur (`backdrop-filter: blur(16px)`).
   - Generous, tactile hit targets (min 44x44px) for mobile ergonomics in the gym.

3. **Fluid Micro-Animations**:
   - Custom easing curve: `cubic-bezier(0.16, 1, 0.3, 1)` (apple-like spring deceleration).
   - Active tactile feedback: `transform: scale(0.97)` on buttons, cards, and interactive chips.
   - Smooth accordion transitions, staggered entry for lists, glowing pulse for live status indicators.
   - Rest timer circular progress animation with fluid dashoffset transitions.

4. **Information Density & Typography**:
   - Clean tabular numerals (`font-variant-numeric: tabular-nums`) for weights, sets, reps, timers.
   - Scannable badge chips with distinct hierarchy: sets/reps, load, RPE, rest intervals.
   - Clear visual feedback on completion (checkmark burst, green status flash).
