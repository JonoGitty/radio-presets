import { create } from 'zustand';
import type { Preset } from '../../shared/types';

// ── Default data ────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#ff6b35', // 1  orange
  '#3b82f6', // 2  blue
  '#22c55e', // 3  green
  '#a855f7', // 4  purple
  '#eab308', // 5  yellow
  '#06b6d4', // 6  cyan
  '#ef4444', // 7  red
  '#f97316', // 8  tangerine
  '#8b5cf6', // 9  violet
  '#14b8a6', // 10 teal
];

function createDefaultPresets(): Preset[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Preset ${i + 1}`,
    bindings: {},
    color: PRESET_COLORS[i],
  }));
}

// ── Store types ─────────────────────────────────────────────────────

interface PresetState {
  presets: Preset[];
  activePresetId: number;
  isBindingMode: boolean;
  pendingBindKey: string | null;

  setActivePreset: (id: number) => void;
  setBindingMode: (active: boolean) => void;
  setPendingBindKey: (key: string | null) => void;
  bindSound: (presetId: number, key: string, soundId: string | null) => void;
  unbindKey: (presetId: number, key: string) => void;
  renamePreset: (id: number, name: string) => void;
  getBinding: (key: string) => string | null;
  loadFromDisk: () => Promise<void>;
  saveToDisk: () => Promise<void>;
}

// ── Store implementation ────────────────────────────────────────────

export const usePresetStore = create<PresetState>((set, get) => ({
  presets: createDefaultPresets(),
  activePresetId: 1,
  isBindingMode: false,
  pendingBindKey: null,

  setActivePreset(id: number) {
    if (id < 1 || id > 10) return;
    set({ activePresetId: id });
  },

  setBindingMode(active: boolean) {
    set({ isBindingMode: active, pendingBindKey: active ? get().pendingBindKey : null });
  },

  setPendingBindKey(key: string | null) {
    set({ pendingBindKey: key });
  },

  bindSound(presetId: number, key: string, soundId: string | null) {
    set((state) => ({
      presets: state.presets.map((p) =>
        p.id === presetId
          ? { ...p, bindings: { ...p.bindings, [key]: soundId } }
          : p,
      ),
      pendingBindKey: null,
    }));
    // Persist after binding change
    get().saveToDisk();
  },

  unbindKey(presetId: number, key: string) {
    set((state) => ({
      presets: state.presets.map((p) => {
        if (p.id !== presetId) return p;
        const bindings = { ...p.bindings };
        delete bindings[key];
        return { ...p, bindings };
      }),
    }));
    get().saveToDisk();
  },

  renamePreset(id: number, name: string) {
    set((state) => ({
      presets: state.presets.map((p) => (p.id === id ? { ...p, name } : p)),
    }));
    get().saveToDisk();
  },

  getBinding(key: string): string | null {
    const { presets, activePresetId } = get();
    const preset = presets.find((p) => p.id === activePresetId);
    if (!preset) return null;
    return preset.bindings[key] ?? null;
  },

  async loadFromDisk() {
    try {
      if (!window.api) return;
      const raw = await window.api.loadPresets();
      if (!raw) return; // no saved data yet — keep defaults
      const loaded = JSON.parse(raw) as Preset[];
      if (!Array.isArray(loaded) || loaded.length === 0) return;

      // Merge loaded data with defaults so that any newly-added preset
      // slots still get their default colour / name.
      const defaults = createDefaultPresets();
      const merged = defaults.map((def) => {
        const saved = loaded.find((p) => p.id === def.id);
        return saved ? { ...def, ...saved } : def;
      });

      set({ presets: merged });
    } catch {
      // If the file is corrupt just keep defaults
    }
  },

  async saveToDisk() {
    try {
      if (!window.api) return;
      const { presets } = get();
      await window.api.savePresets(JSON.stringify(presets, null, 2));
    } catch {
      // Non-fatal — user can keep playing even if save fails
    }
  },
}));
