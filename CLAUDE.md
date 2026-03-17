# Radio Presets

Keyboard-mapped sound preset music maker. Electron + React + Vite + Tone.js.

## Quick Reference

- **Stack**: Electron (main), React 19 + Vite 6 (renderer), Tone.js (audio), Zustand (state)
- **Run**: `npm run dev` (starts Vite + Electron concurrently)
- **Build**: `npm run build` (Vite renderer + tsc main process)
- **Sound engine**: `src/renderer/audio/SoundEngine.ts` — singleton, uses Tone.js
- **Stores**: `src/renderer/stores/` — usePresetStore, useRecordingStore, useAppStore
- **Sound library**: `src/renderer/data/soundLibrary.ts` — 66 built-in sounds

## Architecture

### Main Process (`src/main/`)
- `index.ts` — Electron window, IPC handlers for file I/O
- `preload.ts` — Context bridge exposing `window.api`

### Renderer (`src/renderer/`)
- `App.tsx` — Root layout (title bar, preset bar, keyboard, library panel, suggestions, recorder)
- `audio/SoundEngine.ts` — Tone.js singleton, synth creation, effects routing
- `data/soundLibrary.ts` — 66 synthesised sounds across 8 categories
- `stores/` — Zustand stores for presets, recording, app UI state
- `components/keyboard/` — Visual keyboard with key caps
- `components/library/` — Sound browser panel
- `components/presets/` — Preset bank switcher
- `components/recorder/` — Record/export bar
- `components/suggestions/` — Smart fill suggestions

### Shared (`src/shared/`)
- `types.ts` — All TypeScript interfaces (Sound, Preset, KeyBinding, Recording, etc.)

## Key Workflows

### Binding a sound to a key
1. User holds Ctrl/Cmd
2. Presses a key (e.g., 'A')
3. Sound library panel opens with that key pending
4. User clicks a sound → bound to that key in the active preset
5. Preset auto-saves to disk

### Switching presets
Press 1-9 or 0 on the number row to switch between 10 preset banks.

### Recording
Click the record button, play keys, click stop. Events are stored with timestamps relative to recording start.

## Conventions

- Sound IDs use kebab-case: `kick-deep`, `uke-strum-c`
- Presets are numbered 1-10
- All audio goes through Tone.js — never create raw AudioContext
- State flows through Zustand stores, not prop drilling
- CSS custom properties in `styles/global.css` — use them, don't hardcode colours

## Skills

See `skills/produce-song/SKILL.md` for the AI production assistant skill that lets Claude Code help build and refine songs.
