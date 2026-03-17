import { useMemo } from 'react';
import { usePresetStore } from '../../stores/usePresetStore';
import { SOUND_LIBRARY } from '../../data/soundLibrary';
import { SoundEngine } from '../../audio/SoundEngine';
import type { Sound, SoundCategory } from '../../../shared/types';

const CATEGORY_LABELS: Record<SoundCategory, string> = {
  drums: 'Drums & Percussion',
  bass: 'Bass',
  synth: 'Synth & Pads',
  keys: 'Keys & Piano',
  guitar: 'Guitar',
  ukulele: 'Ukulele',
  strings: 'Strings',
  fx: 'FX & Textures',
  vocal: 'Vocals',
  custom: 'Custom',
};

const CATEGORY_COLORS: Record<SoundCategory, string> = {
  drums: '#ef4444', bass: '#f97316', synth: '#a855f7', keys: '#3b82f6',
  guitar: '#eab308', ukulele: '#22c55e', strings: '#06b6d4', fx: '#ec4899',
  vocal: '#f472b6', custom: '#8b5cf6',
};

/** Analyse current preset and suggest what's missing */
function getSuggestions(usedSoundIds: string[]): { category: SoundCategory; reason: string; sounds: Sound[] }[] {
  const usedSounds = usedSoundIds.map(id => SOUND_LIBRARY.find(s => s.id === id)).filter(Boolean) as Sound[];
  const usedCategories = new Set(usedSounds.map(s => s.category));

  const suggestions: { category: SoundCategory; reason: string; sounds: Sound[] }[] = [];

  // Core rhythm section
  if (!usedCategories.has('drums')) {
    suggestions.push({
      category: 'drums',
      reason: 'Every track needs rhythm — add a kick, snare, or hi-hat to get started',
      sounds: SOUND_LIBRARY.filter(s => s.category === 'drums').slice(0, 4),
    });
  }

  // Bass foundation
  if (!usedCategories.has('bass')) {
    suggestions.push({
      category: 'bass',
      reason: 'Add bass to give your track a solid foundation',
      sounds: SOUND_LIBRARY.filter(s => s.category === 'bass').slice(0, 3),
    });
  }

  // Melodic element
  const hasMelody = usedCategories.has('synth') || usedCategories.has('keys') || usedCategories.has('ukulele') || usedCategories.has('guitar');
  if (!hasMelody) {
    suggestions.push({
      category: 'synth',
      reason: 'Add a melodic element — synth, keys, or strings for harmony',
      sounds: SOUND_LIBRARY.filter(s => s.category === 'synth' || s.category === 'keys').slice(0, 4),
    });
  }

  // Texture / FX
  if (usedSounds.length >= 4 && !usedCategories.has('fx')) {
    suggestions.push({
      category: 'fx',
      reason: 'Add texture and transitions with FX sounds',
      sounds: SOUND_LIBRARY.filter(s => s.category === 'fx').slice(0, 3),
    });
  }

  // If drums but no variation, suggest more drums
  if (usedCategories.has('drums')) {
    const drumSounds = usedSounds.filter(s => s.category === 'drums');
    const usedDrumIds = new Set(drumSounds.map(s => s.id));
    const hasKick = drumSounds.some(s => s.tags.includes('kick'));
    const hasSnare = drumSounds.some(s => s.tags.includes('snare'));
    const hasHat = drumSounds.some(s => s.tags.includes('hihat') || s.tags.includes('hat'));

    if (!hasKick || !hasSnare || !hasHat) {
      const missing: string[] = [];
      if (!hasKick) missing.push('kick');
      if (!hasSnare) missing.push('snare');
      if (!hasHat) missing.push('hi-hat');
      suggestions.push({
        category: 'drums',
        reason: `Your drum kit is missing: ${missing.join(', ')}`,
        sounds: SOUND_LIBRARY.filter(s =>
          s.category === 'drums' &&
          !usedDrumIds.has(s.id) &&
          missing.some(m => s.tags.includes(m))
        ).slice(0, 3),
      });
    }
  }

  // If no suggestions, encourage exploration
  if (suggestions.length === 0 && usedSounds.length > 0) {
    suggestions.push({
      category: 'strings',
      reason: 'Your mix sounds complete! Try adding strings or pads for extra depth',
      sounds: SOUND_LIBRARY.filter(s => s.category === 'strings' || s.tags.includes('pad')).slice(0, 3),
    });
  }

  return suggestions;
}

export default function SuggestionPanel() {
  const { presets, activePresetId, pendingBindKey, bindSound, setPendingBindKey } = usePresetStore();
  const activePreset = presets.find(p => p.id === activePresetId) || presets[0];

  const usedSoundIds = useMemo(() =>
    Object.values(activePreset.bindings).filter(Boolean) as string[],
    [activePreset.bindings]
  );

  const suggestions = useMemo(() => getSuggestions(usedSoundIds), [usedSoundIds]);

  const preview = (sound: Sound) => {
    SoundEngine.getInstance().playSound(sound);
  };

  const bind = (sound: Sound) => {
    if (pendingBindKey) {
      bindSound(activePresetId, pendingBindKey, sound.id);
      setPendingBindKey(null);
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div style={{
      padding: '12px 16px',
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <p style={{
        color: 'var(--text-tertiary)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        fontFamily: 'var(--font-mono)',
      }}>
        Suggestions
      </p>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {suggestions.map((sug, i) => (
          <div key={i} style={{
            minWidth: 220,
            padding: 12,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)',
            border: `1px solid ${CATEGORY_COLORS[sug.category]}20`,
            flexShrink: 0,
          }}>
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              color: CATEGORY_COLORS[sug.category],
              marginBottom: 4,
            }}>
              {CATEGORY_LABELS[sug.category]}
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
              {sug.reason}
            </p>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {sug.sounds.map(s => (
                <button
                  key={s.id}
                  onClick={() => pendingBindKey ? bind(s) : preview(s)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: CATEGORY_COLORS[sug.category] + '15',
                    border: `1px solid ${CATEGORY_COLORS[sug.category]}30`,
                    color: CATEGORY_COLORS[sug.category],
                    fontSize: 10,
                  }}
                  title={pendingBindKey ? `Bind to ${pendingBindKey.toUpperCase()}` : 'Click to preview'}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
