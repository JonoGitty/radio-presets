# Radio Presets

A keyboard-mapped sound preset music maker built with Electron and React. Map synthesised sounds to your keyboard keys, switch between preset banks, and record what you play.

All 66 built-in sounds are generated at runtime using Tone.js -- no sample files needed.

## Getting Started

```bash
npm install
npm run dev
```

This starts the Vite dev server and Electron concurrently. The app opens automatically once the renderer is ready.

## How It Works

**Binding sounds to keys:**
Hold Ctrl (or Cmd on macOS) and press any letter key. The sound library panel opens with that key pending. Click a sound to bind it. The binding auto-saves to disk.

**Playing sounds:**
Press any bound key to trigger its sound. The on-screen keyboard lights up as you play.

**Switching presets:**
Press 1-9 or 0 on the number row to switch between 10 independent preset banks. Each bank has its own set of key bindings and accent colour.

**Recording:**
Click the record button, play keys, click stop. Events are captured with timestamps so playback is faithful to your timing. BPM can be set in the recorder bar.

**Smart suggestions:**
A suggestion panel analyses your current preset and recommends what's missing -- if you have drums but no bass, it'll nudge you to add some.

## Sound Library

66 synthesised sounds across 8 categories:

| Category | Examples |
|----------|----------|
| Drums | Kicks, snares, hi-hats, toms, cymbals, cowbell, tambourine |
| Bass | Sub, synth, pluck, slap, 808, wobble, acoustic |
| Synth | Warm/dark/bright pads, saw/square/pluck leads, chord stabs, arps |
| Keys | Grand piano, electric piano, honky-tonk, church/Hammond/jazz organ |
| Guitar | Acoustic strum, electric clean, power chord, muted, fingerpick |
| Ukulele | Strums in C, Am, F, G, Em, D, Dm, A |
| Strings | Violin, cello, orchestra hit, pizzicato |
| FX | Riser, impact, whoosh, scratch, reverse cymbal, glitch |

You can also import your own audio files (WAV, MP3, OGG, FLAC, AAC, WebM) through the app.

## Tech Stack

- **Electron** -- desktop shell, IPC for file I/O
- **React 19** -- UI
- **Vite 6** -- bundler and dev server
- **Tone.js** -- audio synthesis and effects (reverb, delay, pitch shift, filter)
- **Zustand** -- state management (presets, recording, app UI)
- **TypeScript** -- throughout
- **lamejs** -- MP3 encoding for exports

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start dev server + Electron |
| `npm run build` | Build renderer (Vite) + main process (tsc) |
| `npm run pack` | Build + package with electron-builder (unpacked) |
| `npm run dist` | Build + create distributable installer |

## Project Structure

```
src/
  main/           Electron main process
    index.ts        Window creation, IPC handlers
    preload.ts      Context bridge (window.api)
  renderer/       React app
    App.tsx           Root layout
    audio/            SoundEngine singleton (Tone.js)
    components/       Keyboard, library, presets, recorder, suggestions
    data/             Sound library definitions
    stores/           Zustand stores
    styles/           CSS custom properties
  shared/         TypeScript types shared between processes
```

## License

ISC
