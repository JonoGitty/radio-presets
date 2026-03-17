import { create } from 'zustand';

// ── Store types ─────────────────────────────────────────────────────

interface AppState {
  masterVolume: number;
  setMasterVolume: (vol: number) => void;

  showLibrary: boolean;
  toggleLibrary: () => void;

  showRecorder: boolean;
  toggleRecorder: () => void;

  showEffects: boolean;
  toggleEffects: () => void;

  selectedSoundId: string | null;
  setSelectedSoundId: (id: string | null) => void;
}

// ── Store implementation ────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  masterVolume: 0.8,
  setMasterVolume(vol: number) {
    set({ masterVolume: Math.max(0, Math.min(1, vol)) });
  },

  showLibrary: false,
  toggleLibrary() {
    set((state) => ({ showLibrary: !state.showLibrary }));
  },

  showRecorder: false,
  toggleRecorder() {
    set((state) => ({ showRecorder: !state.showRecorder }));
  },

  showEffects: false,
  toggleEffects() {
    set((state) => ({ showEffects: !state.showEffects }));
  },

  selectedSoundId: null,
  setSelectedSoundId(id: string | null) {
    set({ selectedSoundId: id });
  },
}));
