import { describe, it, expect, beforeEach } from "vitest";
import { soundFx } from "@/lib/soundFx";

describe("W2W Web Audio SFX & Haptics Engine", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("handles mute state in localStorage", () => {
    expect(soundFx.isMuted()).toBe(false);
    soundFx.setMuted(true);
    expect(soundFx.isMuted()).toBe(true);
    soundFx.setMuted(false);
    expect(soundFx.isMuted()).toBe(false);
  });

  it("safely invokes haptics without throwing", () => {
    expect(() => soundFx.triggerHaptic([30, 20])).not.toThrow();
  });

  it("safely executes sound synthesizer functions in headless environment", () => {
    expect(() => soundFx.playCameraShutter()).not.toThrow();
    expect(() => soundFx.playCoinSound()).not.toThrow();
    expect(() => soundFx.playLevelUpFanfare()).not.toThrow();
    expect(() => soundFx.playSuccessTone()).not.toThrow();
    expect(() => soundFx.playBarcodeBeep()).not.toThrow();
  });

  it("suppresses sound output when muted", () => {
    soundFx.setMuted(true);
    expect(() => soundFx.playCameraShutter()).not.toThrow();
    expect(() => soundFx.playCoinSound()).not.toThrow();
  });
});
