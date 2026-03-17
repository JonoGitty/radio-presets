import { useMemo } from 'react';
import type { Sound } from '../../../shared/types';

interface KeyCapProps {
  keyDef: { key: string; display: string; width?: number };
  sound: Sound | null;
  isActive: boolean;       // currently pressed
  isBindingMode: boolean;  // Ctrl held
  isPendingBind: boolean;  // this key selected for binding
  presetColor: string;
  onPress: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  drums: '#ef4444',
  bass: '#f97316',
  synth: '#a855f7',
  keys: '#3b82f6',
  guitar: '#eab308',
  ukulele: '#22c55e',
  strings: '#06b6d4',
  fx: '#ec4899',
  vocal: '#f472b6',
  custom: '#8b5cf6',
};

export default function KeyCap({
  keyDef, sound, isActive, isBindingMode, isPendingBind, presetColor, onPress,
}: KeyCapProps) {
  const width = (keyDef.width || 1) * 56;
  const isMapped = sound !== null;
  const catColor = sound ? (CATEGORY_COLORS[sound.category] || presetColor) : 'transparent';

  const bgColor = useMemo(() => {
    if (isActive) return 'var(--key-active)';
    if (isPendingBind) return 'var(--key-binding)';
    if (isBindingMode && !isMapped) return '#ffffff06';
    if (isMapped) return 'var(--key-mapped)';
    return 'var(--key-idle)';
  }, [isActive, isPendingBind, isBindingMode, isMapped]);

  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onPress(); }}
      style={{
        width,
        height: 56,
        borderRadius: 'var(--radius-md)',
        background: bgColor,
        border: `1px solid ${isPendingBind ? 'var(--accent-blue)' : isMapped ? catColor + '40' : 'var(--border-subtle)'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        position: 'relative',
        transition: 'all var(--transition-fast)',
        transform: isActive ? 'scale(0.94)' : 'scale(1)',
        boxShadow: isActive
          ? `0 0 20px ${catColor}40, inset 0 0 15px ${catColor}20`
          : isMapped
          ? `inset 0 -2px 0 ${catColor}30`
          : 'none',
        cursor: isBindingMode ? 'crosshair' : 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* Category indicator dot */}
      {isMapped && (
        <div style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: catColor,
        }} />
      )}

      {/* Key letter */}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: keyDef.width && keyDef.width > 1 ? 11 : 14,
        fontWeight: 700,
        color: isActive ? 'var(--accent-primary)' : isMapped ? 'var(--text-primary)' : 'var(--text-tertiary)',
        lineHeight: 1,
      }}>
        {keyDef.display}
      </span>

      {/* Sound name */}
      {isMapped && (
        <span style={{
          fontSize: 8,
          color: 'var(--text-secondary)',
          maxWidth: width - 8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}>
          {sound!.name}
        </span>
      )}

      {/* Binding mode indicator */}
      {isBindingMode && !isMapped && (
        <span style={{
          fontSize: 8,
          color: 'var(--accent-blue)',
          lineHeight: 1,
          position: 'absolute',
          bottom: 4,
        }}>
          +
        </span>
      )}
    </button>
  );
}
