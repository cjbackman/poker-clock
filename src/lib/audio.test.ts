import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playBlindCountdownSound, playBlindRaiseSound, playTournamentStartSound } from './audio';

describe('audio', () => {
  let playSpy: ReturnType<typeof vi.fn>;
  let audioInstances: { src: string }[];

  beforeEach(() => {
    playSpy = vi.fn().mockResolvedValue(undefined);
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

  it('playBlindCountdownSound creates Audio with correct path and calls play', () => {
    playBlindCountdownSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/sounds/blind-countdown.mp3');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('playBlindRaiseSound creates Audio with correct path and calls play', () => {
    playBlindRaiseSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/sounds/blind-raise.mp3');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it('playTournamentStartSound creates Audio with correct path and calls play', () => {
    playTournamentStartSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/sounds/tournament-start.mp3');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });
});
