import { useState, useMemo } from 'react';
import { SOUND_LIBRARY } from '../../data/soundLibrary';
import { usePresetStore } from '../../stores/usePresetStore';
import { useAppStore } from '../../stores/useAppStore';
import { SoundEngine } from '../../audio/SoundEngine';
import type { Sound, SoundCategory } from '../../../shared/types';

const CATEGORIES: { id: SoundCategory | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: 'var(--text-secondary)' },
  { id: 'drums', label: 'Drums', color: '#ef4444' },
  { id: 'bass', label: 'Bass', color: '#f97316' },
  { id: 'synth', label: 'Synth', color: '#a855f7' },
  { id: 'keys', label: 'Keys', color: '#3b82f6' },
  { id: 'ukulele', label: 'Ukulele', color: '#22c55e' },
  { id: 'guitar', label: 'Guitar', color: '#eab308' },
  { id: 'strings', label: 'Strings', color: '#06b6d4' },
  { id: 'fx', label: 'FX', color: '#ec4899' },
  { id: 'custom', label: 'Custom', color: '#8b5cf6' },
];

export default function SoundLibraryPanel() {
  const [category, setCategory] = useState<SoundCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const { pendingBindKey, activePresetId, bindSound, setPendingBindKey } = usePresetStore();
  const { toggleLibrary } = useAppStore();

  const filtered = useMemo(() => {
    return SOUND_LIBRARY.filter(s => {
      if (category !== 'all' && s.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.tags.some(t => t.includes(q));
      }
      return true;
    });
  }, [category, search]);

  const previewSound = (sound: Sound) => {
    const engine = SoundEngine.getInstance();
    engine.playSound(sound);
  };

  const selectSound = (sound: Sound) => {
    if (pendingBindKey) {
      bindSound(activePresetId, pendingBindKey, sound.id);
      setPendingBindKey(null);
    }
  };

  const handleImport = async () => {
    if (window.api) {
      const imported = await window.api.importSound();
      // TODO: add to custom sounds library
      console.log('Imported:', imported);
    }
  };

  return (
    <div style={{
      width: 320,
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>
          Sound Library
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleImport}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              fontSize: 11,
            }}
          >
            + Import
          </button>
          <button
            onClick={toggleLibrary}
            style={{ color: 'var(--text-tertiary)', padding: 4 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="3" x2="11" y2="11" />
              <line x1="11" y1="3" x2="3" y2="11" />
            </svg>
          </button>
        </div>
      </div>

      {/* Binding hint */}
      {pendingBindKey && (
        <div style={{
          padding: '8px 16px',
          background: 'var(--accent-blue)' + '15',
          borderBottom: '1px solid var(--accent-blue)' + '30',
          color: 'var(--accent-blue)',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
        }}>
          Click a sound to bind to key "{pendingBindKey.toUpperCase()}"
        </div>
      )}

      {/* Search */}
      <div style={{ padding: '8px 16px' }}>
        <input
          type="text"
          placeholder="Search sounds..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', fontSize: 12, padding: '6px 10px' }}
        />
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        padding: '0 16px 8px',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: category === cat.id ? cat.color + '20' : 'transparent',
              color: category === cat.id ? cat.color : 'var(--text-tertiary)',
              fontSize: 10,
              fontWeight: category === cat.id ? 600 : 400,
              border: `1px solid ${category === cat.id ? cat.color + '40' : 'transparent'}`,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sound list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
        {filtered.map(sound => {
          const catInfo = CATEGORIES.find(c => c.id === sound.category);
          return (
            <div
              key={sound.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {/* Preview button */}
              <button
                onClick={(e) => { e.stopPropagation(); previewSound(sound); }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <polygon points="1,0 10,5 1,10" />
                </svg>
              </button>

              {/* Sound info */}
              <div
                style={{ flex: 1, cursor: 'pointer' }}
                onClick={() => selectSound(sound)}
              >
                <p style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.2 }}>{sound.name}</p>
                <p style={{ fontSize: 10, color: catInfo?.color || 'var(--text-tertiary)' }}>
                  {sound.category}
                </p>
              </div>

              {/* Bind button (when in binding mode) */}
              {pendingBindKey && (
                <button
                  onClick={() => selectSound(sound)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-blue)' + '20',
                    color: 'var(--accent-blue)',
                    fontSize: 10,
                    border: '1px solid var(--accent-blue)' + '40',
                  }}
                >
                  Bind
                </button>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 24, fontSize: 12 }}>
            No sounds found
          </p>
        )}
      </div>
    </div>
  );
}
