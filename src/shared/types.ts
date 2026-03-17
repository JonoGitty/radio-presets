/** A single sound that can be mapped to a key */
export interface Sound {
  id: string;
  name: string;
  category: SoundCategory;
  /** 'synth' = generated via Tone.js, 'sample' = audio file */
  type: 'synth' | 'sample';
  /** For synth sounds: Tone.js config. For samples: file path or data URL */
  source: string;
  /** Optional tags for search and suggestions */
  tags: string[];
  /** Duration hint in seconds (0 = one-shot, >0 = sustain) */
  duration: number;
  /** Default volume 0-1 */
  volume: number;
  /** Per-sound effects */
  effects: SoundEffects;
}

export interface SoundEffects {
  reverb: number;    // 0-1 wet mix
  delay: number;     // 0-1 wet mix
  delayTime: number; // seconds
  pitchShift: number; // semitones (-12 to +12)
  filter: number;    // 0-1 (0=dark, 0.5=neutral, 1=bright)
}

export type SoundCategory =
  | 'drums'
  | 'bass'
  | 'synth'
  | 'keys'
  | 'guitar'
  | 'ukulele'
  | 'strings'
  | 'fx'
  | 'vocal'
  | 'custom';

/** A key binding: which key triggers which sound */
export interface KeyBinding {
  key: string;          // e.g. 'a', 's', 'q', ' ' (space)
  soundId: string | null; // null = unbound
  label?: string;       // custom label override
}

/** A preset = a named collection of key→sound mappings */
export interface Preset {
  id: number;
  name: string;
  bindings: Record<string, string | null>; // key → soundId
  color: string; // accent colour for this preset
}

/** Recording track data */
export interface RecordedEvent {
  soundId: string;
  key: string;
  time: number;      // ms from recording start
  duration: number;   // ms (0 for one-shots)
  velocity: number;   // 0-1
}

export interface Recording {
  id: string;
  name: string;
  events: RecordedEvent[];
  bpm: number;
  duration: number;    // total ms
  presetIds: number[]; // which presets were used
  createdAt: number;
}

/** Suggestion from the smart fill system */
export interface SoundSuggestion {
  category: SoundCategory;
  reason: string;
  sounds: Sound[];
}

/** Window API exposed by preload */
export interface ElectronAPI {
  savePresets: (data: string) => Promise<boolean>;
  loadPresets: () => Promise<string | null>;
  importSound: () => Promise<{ name: string; path: string }[]>;
  listCustomSounds: () => Promise<{ name: string; path: string }[]>;
  saveRecording: (opts: { format: string }) => Promise<string | null>;
  writeFile: (filePath: string, data: number[]) => Promise<boolean>;
  getAppPath: () => Promise<string>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
