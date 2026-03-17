import { create } from 'zustand';
import type { RecordedEvent, Recording } from '../../shared/types';

// ── Store types ─────────────────────────────────────────────────────

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordingStartTime: number;
  events: RecordedEvent[];
  recordings: Recording[];
  bpm: number;

  startRecording: () => void;
  stopRecording: () => Recording;
  pauseRecording: () => void;
  resumeRecording: () => void;
  addEvent: (event: RecordedEvent) => void;
  deleteRecording: (id: string) => void;
  setBpm: (bpm: number) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────

function generateId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Track cumulative paused time so events stay in musical time. */
let pauseStartedAt = 0;
let totalPausedMs = 0;

// ── Store implementation ────────────────────────────────────────────

export const useRecordingStore = create<RecordingState>((set, get) => ({
  isRecording: false,
  isPaused: false,
  recordingStartTime: 0,
  events: [],
  recordings: [],
  bpm: 120,

  startRecording() {
    pauseStartedAt = 0;
    totalPausedMs = 0;

    set({
      isRecording: true,
      isPaused: false,
      recordingStartTime: performance.now(),
      events: [],
    });
  },

  stopRecording(): Recording {
    const { events, recordingStartTime, bpm } = get();
    const duration = performance.now() - recordingStartTime - totalPausedMs;

    // Collect unique preset IDs used (stored on events via the key's preset
    // at record time — the caller is responsible for setting presetIds if needed).
    const presetIds: number[] = [];

    const recording: Recording = {
      id: generateId(),
      name: `Recording ${get().recordings.length + 1}`,
      events: [...events],
      bpm,
      duration: Math.max(0, duration),
      presetIds,
      createdAt: Date.now(),
    };

    set((state) => ({
      isRecording: false,
      isPaused: false,
      recordingStartTime: 0,
      events: [],
      recordings: [...state.recordings, recording],
    }));

    pauseStartedAt = 0;
    totalPausedMs = 0;

    return recording;
  },

  pauseRecording() {
    if (!get().isRecording || get().isPaused) return;
    pauseStartedAt = performance.now();
    set({ isPaused: true });
  },

  resumeRecording() {
    if (!get().isRecording || !get().isPaused) return;
    if (pauseStartedAt > 0) {
      totalPausedMs += performance.now() - pauseStartedAt;
      pauseStartedAt = 0;
    }
    set({ isPaused: false });
  },

  addEvent(event: RecordedEvent) {
    const { isRecording, isPaused } = get();
    if (!isRecording || isPaused) return;
    set((state) => ({ events: [...state.events, event] }));
  },

  deleteRecording(id: string) {
    set((state) => ({
      recordings: state.recordings.filter((r) => r.id !== id),
    }));
  },

  setBpm(bpm: number) {
    set({ bpm: Math.max(20, Math.min(300, bpm)) });
  },
}));
