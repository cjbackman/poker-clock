import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  playButtonClickSound,
  playBlindChangeSound,
  playSuccessSound,
  playNotificationSound,
  playTimerEndSound,
} from './audio';

describe('audio', () => {
  let playSpy: ReturnType<typeof vi.fn>;
  let audioInstances: { src: string }[];

  beforeEach(() => {
    playSpy = vi.fn();
    audioInstances = [];

    vi.stubGlobal(
      'Audio',
      vi.fn().mockImplementation((src: string) => {
        const instance = { src, play: playSpy };
        audioInstances.push(instance);
        return instance;
      }),
    );
  });

  it('playButtonClickSound creates Audio with correct path and calls play', () => {
    playButtonClickSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/sounds/button-click.mp3');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('playBlindChangeSound creates Audio with correct path and calls play', () => {
    playBlindChangeSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/sounds/blind-change.mp3');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('playSuccessSound creates Audio with correct path and calls play', () => {
    playSuccessSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/sounds/success.mp3');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('playNotificationSound creates Audio with correct path and calls play', () => {
    playNotificationSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/sounds/notification.mp3');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('playTimerEndSound reuses the blind-change sound path', () => {
    playTimerEndSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/sounds/blind-change.mp3');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });
});
