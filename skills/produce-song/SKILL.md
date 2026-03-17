# Radio Presets — AI Production Assistant Skill

## Purpose

This skill allows Claude Code (or any AI agent) to interact with Radio Presets as a production consultant — helping users build, refine, and complete songs by manipulating presets, suggesting sounds, and editing arrangements.

## How Radio Presets Works

Radio Presets is an Electron desktop app where users map sounds to keyboard keys across switchable preset banks.

### Core Concepts

- **Sound**: An audio source (synth or sample) with a unique `id`, `category`, `name`, and `tags`
- **Preset**: A numbered bank (1-10) containing a mapping of keyboard keys → sound IDs
- **Binding**: A single key→sound assignment within a preset (e.g., key "a" → "kick-deep")
- **Recording**: A timestamped sequence of key press events that can be exported

### Data Files

| File | Location | Format |
|------|----------|--------|
| Sound library | `src/renderer/data/soundLibrary.ts` | TypeScript array of `Sound` objects |
| User presets | `{userData}/radio-presets/presets.json` | JSON array of `Preset` objects |
| Custom sounds | `{userData}/radio-presets/custom-sounds/` | Audio files (WAV, MP3, etc.) |

### Preset JSON Schema

```json
{
  "id": 1,
  "name": "My Drumkit",
  "bindings": {
    "a": "kick-deep",
    "s": "snare-acoustic",
    "d": "hat-closed",
    "f": "hat-open",
    "g": "tom-high",
    "h": "tom-mid",
    "j": "tom-low",
    "k": "crash",
    "q": null,
    "w": null
  },
  "color": "#ff6b35"
}
```

Keys are lowercase single characters. Values are sound IDs from the library, or `null` for unbound.

### Sound Object Schema

```json
{
  "id": "kick-deep",
  "name": "Deep Kick",
  "category": "drums",
  "type": "synth",
  "source": "{\"synth\":\"MembraneSynth\",\"note\":\"C1\",\"options\":{...}}",
  "tags": ["kick", "drum", "bass", "deep"],
  "duration": 0,
  "volume": 0.8,
  "effects": {
    "reverb": 0.1,
    "delay": 0,
    "delayTime": 0,
    "pitchShift": 0,
    "filter": 0.5
  }
}
```

### Available Sound Categories

`drums`, `bass`, `synth`, `keys`, `guitar`, `ukulele`, `strings`, `fx`, `vocal`, `custom`

### Bindable Keys

Row 1: q w e r t y u i o p
Row 2: a s d f g h j k l
Row 3: z x c v b n m
Row 4: space

Total: 37 bindable keys per preset, 10 presets = 370 possible sound mappings.

## What Claude Can Do

### 1. Build a Preset

Given a genre or style, populate a preset with appropriate sounds:

```
User: "Set up preset 1 as a lo-fi hip hop kit"
Claude: Reads soundLibrary.ts, selects appropriate sounds, writes preset bindings
```

**Approach**: Edit the user's `presets.json` file directly, or guide the user through Ctrl+key bindings. When editing directly, map sounds logically:
- Left hand (A-G): Drums and percussion
- Right hand (H-L, Y-P): Melodic elements
- Bottom row (Z-M): Bass and FX
- Space: Main hit or drop

### 2. Analyse and Suggest Improvements

Look at the current preset bindings and suggest what's missing:

```
User: "What's missing from my current setup?"
Claude: Reads presets.json, cross-references with soundLibrary, identifies gaps
```

**Check for**:
- Missing rhythm section (no kick, snare, or hat)
- Missing bass element
- Missing melodic element (synth, keys, guitar, uke)
- Missing FX/transitions
- Unbalanced categories (too many of one type)
- Unused key areas (whole rows unmapped)

### 3. Design a Full Song Layout

Map out multiple presets for different sections of a song:

```
User: "Help me plan a 4-preset song layout for a pop track"
Claude:
- Preset 1 "Intro": Soft pad + fingerpick guitar + light hat
- Preset 2 "Verse": Add kick + snare + bass + uke strum
- Preset 3 "Chorus": Full drums + lead synth + chord stab + strings
- Preset 4 "Bridge": Strip back to piano + bass + FX riser
```

### 4. Create Custom Sounds

Add new synthesised sounds to `soundLibrary.ts`:

```
User: "I need a detuned saw lead with lots of reverb"
Claude: Adds a new Sound object with appropriate Tone.js config
```

**Tone.js synth types and when to use them**:
- `MembraneSynth` — Kicks, toms, deep percussive hits
- `NoiseSynth` — Snares, hats, cymbals, noise sweeps
- `MetalSynth` — Metallic percussion, bells, industrial
- `MonoSynth` — Bass lines, mono leads
- `FMSynth` — Electric piano, bells, complex timbres
- `AMSynth` — Strings, pads, tremolo sounds
- `PluckSynth` — Plucked strings (uke, guitar, harp)
- `PolySynth` — Chords, pads (wraps any other synth)
- `Synth` — Simple oscillator (leads, beeps, clean tones)

### 5. Optimise Key Layout

Suggest better key arrangements for playability:

- Group related sounds together (all drums on one row)
- Put frequently used sounds on home row (ASDF)
- Map chord progressions to sequential keys (e.g., Q=I, W=IV, E=V, R=vi)
- Consider the user's playing style (one hand vs two hands)

## Interaction Pattern

When the user asks for help with Radio Presets:

1. **Read the current state**: Check `presets.json` and `soundLibrary.ts`
2. **Understand the goal**: What genre? What section? What's missing?
3. **Make changes**: Edit preset files directly or provide step-by-step Ctrl+key instructions
4. **Explain choices**: Brief rationale for each sound selection
5. **Suggest next steps**: What to record, what to tweak, what preset to set up next

## Example: Full Session

```
User: "Help me make a chill acoustic track"

Claude:
1. Sets up Preset 1 "Verse" with:
   - A: kick-deep, S: snare-acoustic, D: hat-closed, F: hat-open
   - Q: uke-strum-c, W: uke-strum-am, E: uke-strum-f, R: uke-strum-g
   - Z: bass-acoustic, Space: fingerpick-guitar

2. Sets up Preset 2 "Chorus" with:
   - Same drums on A-F
   - Q: uke-strum-c, W: uke-strum-g, E: uke-strum-am, R: uke-strum-f
   - Z: bass-acoustic, X: pad-warm
   - Space: strum-acoustic

3. Suggests: "Try recording a verse: play the drum pattern on A-S-D,
   strum ukulele on Q-W-E-R following C-Am-F-G, add bass on Z.
   Then switch to Preset 2 for the chorus and add the pad on X."
```

## File Locations

- Sound library: `C:\AI\radio-presets\src\renderer\data\soundLibrary.ts`
- Shared types: `C:\AI\radio-presets\src\shared\types.ts`
- Preset store: `C:\AI\radio-presets\src\renderer\stores\usePresetStore.ts`
- Sound engine: `C:\AI\radio-presets\src\renderer\audio\SoundEngine.ts`
