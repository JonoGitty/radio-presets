import * as Tone from 'tone';
import type { Sound, SoundEffects } from '../../shared/types';

/** JSON shape stored in Sound.source for synth-type sounds */
interface SynthSourceConfig {
  synth: string;
  note?: string;
  notes?: string[];
  options?: Record<string, unknown>;
  duration?: string;
}

type ToneSynth =
  | Tone.MembraneSynth
  | Tone.MonoSynth
  | Tone.NoiseSynth
  | Tone.MetalSynth
  | Tone.PluckSynth
  | Tone.FMSynth
  | Tone.AMSynth
  | Tone.PolySynth
  | Tone.Synth;

interface CachedSource {
  synth: ToneSynth;
  gain: Tone.Gain;
}

/**
 * Central audio engine backed by Tone.js.
 * Singleton: access via SoundEngine.getInstance().
 */
export class SoundEngine {
  // ------------------------------------------------------------------
  // Singleton
  // ------------------------------------------------------------------
  private static instance: SoundEngine | null = null;

  static getInstance(): SoundEngine {
    // Allow surviving hot-reloads by stashing on window
    const win = window as unknown as { __radio_sound_engine?: SoundEngine };
    if (win.__radio_sound_engine) return win.__radio_sound_engine;
    if (!SoundEngine.instance) {
      SoundEngine.instance = new SoundEngine();
      win.__radio_sound_engine = SoundEngine.instance;
    }
    return SoundEngine.instance;
  }

  // ------------------------------------------------------------------
  // Internal state
  // ------------------------------------------------------------------
  private cache = new Map<string, CachedSource>();
  private masterGain!: Tone.Gain;
  private reverb!: Tone.Reverb;
  private delay!: Tone.FeedbackDelay;
  private pitchShift!: Tone.PitchShift;
  private initialised = false;

  private constructor() {
    /* use getInstance() */
  }

  // ------------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------------

  /** Must be called once (ideally on first user gesture) before any playback. */
  async init(): Promise<void> {
    if (this.initialised) return;

    await Tone.start();

    // Master effects chain: source → pitchShift → delay → reverb → masterGain → dest
    this.masterGain = new Tone.Gain(0.8).toDestination();
    this.reverb = new Tone.Reverb({ decay: 2.5, wet: 0 }).connect(this.masterGain);
    this.delay = new Tone.FeedbackDelay({
      delayTime: 0.25,
      feedback: 0.3,
      wet: 0,
    }).connect(this.reverb);
    this.pitchShift = new Tone.PitchShift({ pitch: 0, wet: 0 }).connect(this.delay);

    // Reverb needs to generate its impulse response
    await this.reverb.ready;

    this.initialised = true;
  }

  // ------------------------------------------------------------------
  // Playback
  // ------------------------------------------------------------------

  /** Trigger a sound. velocity 0-1 scales the volume. */
  async playSound(sound: Sound, velocity = 1): Promise<void> {
    if (!this.initialised) {
      await this.init();
    }

    try {
    if (sound.type === 'sample') {
      this.playSample(sound, velocity);
      return;
    }

    const config = JSON.parse(sound.source) as SynthSourceConfig;
    const cached = this.getOrCreateSynth(sound.id, config, sound.effects, sound.volume);
    const { synth, gain } = cached;

    // Apply velocity via the per-sound gain node
    gain.gain.value = sound.volume * velocity;

    const duration = config.duration ?? '8n';

    if (config.synth === 'NoiseSynth') {
      // NoiseSynth takes no note argument
      (synth as Tone.NoiseSynth).triggerAttackRelease(duration);
    } else if (config.notes && config.notes.length > 0) {
      // Chord: stagger notes slightly for a natural feel
      const now = Tone.now();
      config.notes.forEach((note, i) => {
        const stagger = i * 0.015; // 15 ms between voices
        if (synth instanceof Tone.PolySynth) {
          (synth as Tone.PolySynth).triggerAttackRelease(note, duration, now + stagger);
        } else {
          // Fallback: only first note for mono synths
          if (i === 0) {
            (synth as Exclude<ToneSynth, Tone.NoiseSynth | Tone.PolySynth>)
              .triggerAttackRelease(note, duration, now + stagger);
          }
        }
      });
    } else {
      const note = config.note ?? 'C3';
      if (sound.duration === 0) {
        // One-shot
        (synth as Exclude<ToneSynth, Tone.NoiseSynth>).triggerAttackRelease(note, duration);
      } else {
        // Sustained — caller should stopSound() later
        (synth as Exclude<ToneSynth, Tone.NoiseSynth>).triggerAttack(note);
      }
    }
    } catch (err) {
      console.error('[SoundEngine] playSound error:', sound.id, err);
    }
  }

  /** Stop a specific playing sound. */
  stopSound(soundId: string): void {
    const cached = this.cache.get(soundId);
    if (!cached) return;

    try {
      if ('triggerRelease' in cached.synth && typeof cached.synth.triggerRelease === 'function') {
        (cached.synth as Tone.Synth).triggerRelease();
      }
    } catch {
      // synth may already be stopped — ignore
    }
  }

  /** Stop all currently playing sounds. */
  stopAll(): void {
    for (const [, cached] of this.cache) {
      try {
        if ('triggerRelease' in cached.synth && typeof cached.synth.triggerRelease === 'function') {
          (cached.synth as Tone.Synth).triggerRelease();
        }
      } catch {
        // ignore
      }
    }
  }

  /** Set master output volume (0-1). */
  setMasterVolume(vol: number): void {
    if (!this.initialised) return;
    this.masterGain.gain.value = Math.max(0, Math.min(1, vol));
  }

  /** Live pitch bend — shift all cached synths by semitones (-12 to +12). */
  setPitchBend(semitones: number): void {
    if (!this.initialised) return;
    const clamped = Math.max(-12, Math.min(12, semitones));
    this.pitchShift.pitch = clamped;
  }

  /** Get current pitch bend value. */
  getPitchBend(): number {
    if (!this.initialised) return 0;
    return this.pitchShift.pitch;
  }

  /** Tear down all audio resources. */
  dispose(): void {
    this.stopAll();
    for (const [, cached] of this.cache) {
      try {
        cached.synth.dispose();
        cached.gain.dispose();
      } catch {
        // ignore
      }
    }
    this.cache.clear();

    if (this.initialised) {
      this.pitchShift.dispose();
      this.delay.dispose();
      this.reverb.dispose();
      this.masterGain.dispose();
    }

    this.initialised = false;
    const win = window as unknown as { __radio_sound_engine?: SoundEngine };
    delete win.__radio_sound_engine;
    SoundEngine.instance = null;
  }

  // ------------------------------------------------------------------
  // Internals — synth creation / caching
  // ------------------------------------------------------------------

  private getOrCreateSynth(
    soundId: string,
    config: SynthSourceConfig,
    effects: SoundEffects,
    volume: number,
  ): CachedSource {
    const existing = this.cache.get(soundId);
    if (existing) return existing;

    // Per-sound gain node → master effects chain
    const gain = new Tone.Gain(volume);

    // Optional per-sound effects inserted between synth → gain
    const chain = this.buildPerSoundChain(effects, gain);

    const synth = this.createSynth(config);
    synth.connect(chain);

    const entry: CachedSource = { synth, gain };
    this.cache.set(soundId, entry);
    return entry;
  }

  private createSynth(config: SynthSourceConfig): ToneSynth {
    const opts = config.options ?? {};

    switch (config.synth) {
      case 'MembraneSynth':
        return new Tone.MembraneSynth(opts as Partial<Tone.MembraneSynthOptions>);
      case 'MonoSynth':
        return new Tone.MonoSynth(opts as Partial<Tone.MonoSynthOptions>);
      case 'NoiseSynth':
        return new Tone.NoiseSynth(opts as Partial<Tone.NoiseSynthOptions>);
      case 'MetalSynth':
        return new Tone.MetalSynth(opts as Partial<Tone.MetalSynthOptions>);
      case 'PluckSynth':
        return new Tone.PluckSynth(opts as Partial<Tone.PluckSynthOptions>);
      case 'FMSynth':
        return new Tone.FMSynth(opts as Partial<Tone.FMSynthOptions>);
      case 'AMSynth':
        return new Tone.AMSynth(opts as Partial<Tone.AMSynthOptions>);
      case 'PolySynth':
        return new Tone.PolySynth(opts as Partial<Tone.PolySynthOptions>);
      case 'Synth':
      default:
        return new Tone.Synth(opts as Partial<Tone.SynthOptions>);
    }
  }

  /**
   * Build a per-sound mini effects chain that feeds into the master chain.
   * Returns the head node that the synth should connect to.
   */
  private buildPerSoundChain(effects: SoundEffects, gain: Tone.Gain): Tone.ToneAudioNode {
    // gain → master pitch shift (shared effects)
    gain.connect(this.pitchShift);

    // If the sound has its own pitch shift, insert it before the gain
    if (effects.pitchShift !== 0) {
      const ps = new Tone.PitchShift({ pitch: effects.pitchShift });
      ps.connect(gain);

      // If the sound has its own reverb / delay wet amounts, override the shared nodes
      this.applyWetOverrides(effects);
      return ps;
    }

    this.applyWetOverrides(effects);
    return gain;
  }

  /** Temporarily set shared effect wet levels to match per-sound values. */
  private applyWetOverrides(effects: SoundEffects): void {
    // These are "last write wins" — fine for a jam-oriented app where one
    // sound plays at a time per tap. A more complex approach would use
    // per-sound send buses, but that's overkill for v1.
    this.reverb.wet.value = effects.reverb;
    this.delay.wet.value = effects.delay;
    if (effects.delayTime > 0) {
      this.delay.delayTime.value = effects.delayTime;
    }
  }

  // ------------------------------------------------------------------
  // Sample playback
  // ------------------------------------------------------------------

  private playSample(sound: Sound, velocity: number): void {
    // sound.source is a file path or data URL for sample-type sounds
    const player = new Tone.Player({
      url: sound.source,
      autostart: false,
      volume: Tone.gainToDb(sound.volume * velocity),
      onload: () => {
        player.connect(this.pitchShift);
        this.applyWetOverrides(sound.effects);
        player.start();

        // Auto-dispose when finished
        player.onstop = () => {
          player.dispose();
        };
      },
    });
  }
}
