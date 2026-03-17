import { useRecordingStore } from '../../stores/useRecordingStore';

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function RecorderBar() {
  const {
    isRecording, isPaused, recordingStartTime, events,
    startRecording, stopRecording, pauseRecording, resumeRecording,
    bpm, setBpm,
  } = useRecordingStore();

  const elapsed = isRecording ? Date.now() - recordingStartTime : 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 20px',
      background: isRecording ? '#ef444410' : 'var(--bg-surface)',
      borderTop: `1px solid ${isRecording ? '#ef444430' : 'var(--border-subtle)'}`,
      transition: 'all var(--transition-normal)',
    }}>
      {/* Record / Stop */}
      {!isRecording ? (
        <button
          onClick={startRecording}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#ef444430',
            border: '2px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Start recording"
        >
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#ef4444',
          }} />
        </button>
      ) : (
        <button
          onClick={() => stopRecording()}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#ef444440',
            border: '2px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'recording 1.5s ease-in-out infinite',
          }}
          title="Stop recording"
        >
          <div style={{
            width: 12,
            height: 12,
            borderRadius: 2,
            background: '#ef4444',
          }} />
        </button>
      )}

      {/* Pause / Resume */}
      {isRecording && (
        <button
          onClick={isPaused ? resumeRecording : pauseRecording}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            fontSize: 11,
          }}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      )}

      {/* Timer */}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 16,
        color: isRecording ? '#ef4444' : 'var(--text-tertiary)',
        minWidth: 60,
      }}>
        {formatTime(elapsed)}
      </span>

      {/* Event count */}
      {isRecording && (
        <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>
          {events.length} events
        </span>
      )}

      <div style={{ flex: 1 }} />

      {/* BPM */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--text-tertiary)', fontSize: 10, textTransform: 'uppercase' }}>BPM</span>
        <input
          type="number"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          style={{
            width: 50,
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            padding: '4px 6px',
          }}
          min={40}
          max={300}
        />
      </div>

      {/* Export buttons */}
      <div style={{ display: 'flex', gap: 4 }}>
        {['WAV', 'MP3'].map(fmt => (
          <button
            key={fmt}
            onClick={() => {/* TODO: export */}}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {fmt}
          </button>
        ))}
      </div>
    </div>
  );
}
