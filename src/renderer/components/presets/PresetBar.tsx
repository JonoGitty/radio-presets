import { usePresetStore } from '../../stores/usePresetStore';
import { PRESET_KEYS } from '../keyboard/KeyboardLayout';

export default function PresetBar() {
  const { presets, activePresetId, setActivePreset, renamePreset } = usePresetStore();

  return (
    <div style={{
      display: 'flex',
      gap: 4,
      padding: '8px 16px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      alignItems: 'center',
    }}>
      <span style={{
        color: 'var(--text-tertiary)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginRight: 8,
        fontFamily: 'var(--font-mono)',
      }}>
        Presets
      </span>

      {presets.map((preset, i) => {
        const isActive = preset.id === activePresetId;
        const keyHint = PRESET_KEYS[i] || '';

        return (
          <button
            key={preset.id}
            onClick={() => setActivePreset(preset.id)}
            onDoubleClick={() => {
              const newName = prompt('Rename preset:', preset.name);
              if (newName) renamePreset(preset.id, newName);
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: isActive ? preset.color + '20' : 'var(--bg-elevated)',
              border: `1px solid ${isActive ? preset.color : 'var(--border-subtle)'}`,
              color: isActive ? preset.color : 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all var(--transition-fast)',
              position: 'relative',
            }}
            title={`${preset.name} (press ${keyHint})`}
          >
            {/* Key hint */}
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: isActive ? preset.color : 'var(--text-tertiary)',
              opacity: 0.7,
            }}>
              {keyHint}
            </span>

            <span>{preset.name}</span>

            {/* Active indicator */}
            {isActive && (
              <div style={{
                position: 'absolute',
                bottom: -1,
                left: '20%',
                right: '20%',
                height: 2,
                borderRadius: 1,
                background: preset.color,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
