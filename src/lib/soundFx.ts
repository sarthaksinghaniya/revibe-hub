/**
 * W2W Web Audio Sound Effects & Haptics Engine
 * --------------------------------------------
 * Pure synthesized procedural audio using the HTML5 Web Audio API.
 * Zero external MP3/WAV assets to load (0 kB network footprint).
 */

class SoundFxEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("w2w_sound_muted") === "true";
  }

  public setMuted(muted: boolean): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("w2w_sound_muted", muted ? "true" : "false");
  }

  public triggerHaptic(pattern: number | number[] = 30): void {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(pattern);
      } catch {
        /* silent on unsupported browsers */
      }
    }
  }

  public playCameraShutter(): void {
    if (this.isMuted()) return;
    this.triggerHaptic([20, 30, 20]);
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High-pitched click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.debug("Audio play error", e);
    }
  }

  public playCoinSound(): void {
    if (this.isMuted()) return;
    this.triggerHaptic([40, 30, 40]);
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Dual harmonic sine tones: B5 (987.77 Hz) and E6 (1318.51 Hz)
      const frequencies = [987.77, 1318.51];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.2, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.22);
      });
    } catch (e) {
      console.debug("Audio play error", e);
    }
  }

  public playLevelUpFanfare(): void {
    if (this.isMuted()) return;
    this.triggerHaptic([30, 40, 50, 40, 70]);
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Major triad arpeggio: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = now + idx * 0.08;
        const duration = idx === notes.length - 1 ? 0.35 : 0.12;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.debug("Audio play error", e);
    }
  }

  public playSuccessTone(): void {
    if (this.isMuted()) return;
    this.triggerHaptic(30);
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {
      console.debug("Audio play error", e);
    }
  }
}

export const soundFx = new SoundFxEngine();
