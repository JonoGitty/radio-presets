import { useEffect } from 'react';
import PresetBar from './components/presets/PresetBar';
import KeyboardView from './components/keyboard/KeyboardView';
import SoundLibraryPanel from './components/library/SoundLibraryPanel';
import RecorderBar from './components/recorder/RecorderBar';
import SuggestionPanel from './components/suggestions/SuggestionPanel';
import { useAppStore } from './stores/useAppStore';
import { usePresetStore } from './stores/usePresetStore';

export default function App() {
  const { showLibrary, toggleLibrary, masterVolume } = useAppStore();
  const { loadFromDisk } = usePresetStore();

  // Load saved presets on startup
  useEffect(() => {
    loadFromDisk();
  }, [loadFromDisk]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-deepest)',
      overflow: 'hidden',
    }}>
      {/* Title bar area */}
      <div style={{
        height: 36,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        WebkitAppRegion: 'drag' as any,
        gap: 12,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, WebkitAppRegion: 'no-drag' as any }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="var(--accent-primary)" strokeWidth="1.5" />
            <circle cx="9" cy="9" r="3" fill="var(--accent-primary)" />
            <line x1="9" y1="1" x2="9" y2="4" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--accent-primary)',
            letterSpacing: 0.5,
          }}>
            Radio Presets
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Master volume */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          WebkitAppRegion: 'no-drag' as any,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(masterVolume * 100)}
            onChange={(e) => useAppStore.setState({ masterVolume: Number(e.target.value) / 100 })}
            style={{ width: 80, accentColor: 'var(--accent-primary)', height: 4 }}
          />
        </div>

        {/* Library toggle */}
        <button
          onClick={toggleLibrary}
          style={{
            padding: '3px 10px',
            borderRadius: 'var(--radius-sm)',
            background: showLibrary ? 'var(--accent-primary)' + '20' : 'transparent',
            color: showLibrary ? 'var(--accent-primary)' : 'var(--text-tertiary)',
            fontSize: 11,
            fontWeight: 500,
            WebkitAppRegion: 'no-drag' as any,
          }}
        >
          Sounds
        </button>
      </div>

      {/* Preset bar */}
      <PresetBar />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Centre: Keyboard */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          gap: 16,
        }}>
          <KeyboardView />
        </div>

        {/* Right: Sound Library */}
        {showLibrary && <SoundLibraryPanel />}
      </div>

      {/* Smart suggestions */}
      <SuggestionPanel />

      {/* Recorder bar */}
      <RecorderBar />
    </div>
  );
}
