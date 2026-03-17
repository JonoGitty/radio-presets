import { useEffect, useState, useCallback, useRef } from 'react';
import { KEYBOARD_ROWS, PRESET_KEYS } from './KeyboardLayout';
import KeyCap from './KeyCap';
import { usePresetStore } from '../../stores/usePresetStore';
import { useAppStore } from '../../stores/useAppStore';
import { useRecordingStore } from '../../stores/useRecordingStore';
import { SoundEngine } from '../../audio/SoundEngine';
import { SOUND_LIBRARY } from '../../data/soundLibrary';
import type { Sound } from '../../../shared/types';

export default function KeyboardView() {
  const {
    presets, activePresetId, isBindingMode, pendingBindKey,
    setActivePreset, setBindingMode, setPendingBindKey, bindSound,
  } = usePresetStore();
  const { showLibrary, toggleLibrary } = useAppStore();
  const { isRecording, addEvent, recordingStartTime } = useRecordingStore();

  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const engineRef = useRef<SoundEngine | null>(null);

  const activePreset = presets.find(p => p.id === activePresetId) || presets[0];

  // Sound lookup map
  const soundMap = useCallback((soundId: string | null): Sound | null => {
    if (!soundId) return null;
    return SOUND_LIBRARY.find(s => s.id === soundId) || null;
  }, []);

  // Init sound engine
  useEffect(() => {
    engineRef.current = SoundEngine.getInstance();
    engineRef.current.init();
  }, []);

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Ctrl/Cmd held = binding mode
      if (e.key === 'Control' || e.key === 'Meta') {
        setBindingMode(true);
        return;
      }

      // Number keys = switch preset
      if (PRESET_KEYS.includes(key)) {
        const presetIdx = key === '0' ? 10 : parseInt(key);
        setActivePreset(presetIdx);
        return;
      }

      // Prevent key repeat
      if (e.repeat) return;

      // Binding mode: select this key for binding
      if (isBindingMode) {
        setPendingBindKey(key);
        if (!showLibrary) toggleLibrary();
        return;
      }

      // Normal mode: play the mapped sound
      const soundId = activePreset.bindings[key];
      if (soundId) {
        const sound = soundMap(soundId);
        if (sound && engineRef.current) {
          engineRef.current.playSound(sound);
          setActiveKeys(prev => new Set(prev).add(key));

          // Record event
          if (isRecording) {
            addEvent({
              soundId,
              key,
              time: Date.now() - recordingStartTime,
              duration: 0,
              velocity: 1,
            });
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (e.key === 'Control' || e.key === 'Meta') {
        setBindingMode(false);
        return;
      }

      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });

      // Stop sustained sounds
      const soundId = activePreset.bindings[key];
      if (soundId) {
        const sound = soundMap(soundId);
        if (sound && sound.duration > 0 && engineRef.current) {
          engineRef.current.stopSound(soundId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activePreset, isBindingMode, showLibrary, isRecording, recordingStartTime,
      setBindingMode, setPendingBindKey, setActivePreset, toggleLibrary, addEvent, soundMap]);

  const handleKeyCapPress = (key: string) => {
    if (isBindingMode) {
      setPendingBindKey(key);
      if (!showLibrary) toggleLibrary();
      return;
    }

    const soundId = activePreset.bindings[key];
    if (soundId) {
      const sound = soundMap(soundId);
      if (sound && engineRef.current) {
        engineRef.current.playSound(sound);
        setActiveKeys(prev => new Set(prev).add(key));
        setTimeout(() => {
          setActiveKeys(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }, 150);
      }
    }
  };

  // Count mapped keys
  const mappedCount = Object.values(activePreset.bindings).filter(Boolean).length;
  const totalKeys = KEYBOARD_ROWS.flat().length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        color: 'var(--text-secondary)', fontSize: 12,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          color: isBindingMode ? 'var(--accent-blue)' : 'var(--text-tertiary)',
        }}>
          {isBindingMode
            ? pendingBindKey
              ? `Binding key "${pendingBindKey.toUpperCase()}" — pick a sound from the library`
              : 'Hold Ctrl + press a key to bind a sound'
            : `${mappedCount}/${totalKeys} keys mapped`}
        </span>
      </div>

      {/* Keyboard rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
        {KEYBOARD_ROWS.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: 'flex',
              gap: 4,
              paddingLeft: ri === 1 ? 16 : ri === 2 ? 32 : ri === 3 ? 0 : 0,
            }}
          >
            {row.map(keyDef => {
              const soundId = activePreset.bindings[keyDef.key] || null;
              const sound = soundMap(soundId);
              return (
                <KeyCap
                  key={keyDef.key}
                  keyDef={keyDef}
                  sound={sound}
                  isActive={activeKeys.has(keyDef.key)}
                  isBindingMode={isBindingMode}
                  isPendingBind={pendingBindKey === keyDef.key}
                  presetColor={activePreset.color}
                  onPress={() => handleKeyCapPress(keyDef.key)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
