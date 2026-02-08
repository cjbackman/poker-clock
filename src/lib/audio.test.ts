import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('audio', () => {
  let startSpy: ReturnType<typeof vi.fn>;
  let connectSpy: ReturnType<typeof vi.fn>;
  let resumeSpy: ReturnType<typeof vi.fn>;
  let decodeAudioDataSpy: ReturnType<typeof vi.fn>;
  let mockDestination: object;

  // Re-import the module fresh each test so the cached AudioContext resets
  let playBlindCountdownSound: () => void;
  let playBlindRaiseSound: () => void;
  let playTournamentStartSound: () => void;
  let unlockAudio: () => void;

  beforeEach(async () => {
    vi.resetModules();

    startSpy = vi.fn();
    mockDestination = {};
    connectSpy = vi.fn();
    resumeSpy = vi.fn().mockResolvedValue(undefined);
    decodeAudioDataSpy = vi.fn().mockResolvedValue({ duration: 1 });

    vi.stubGlobal(
      'AudioContext',
      vi.fn().mockImplementation(() => ({
        state: 'running',
        resume: resumeSpy,
        decodeAudioData: decodeAudioDataSpy,
        destination: mockDestination,
        createBufferSource: vi.fn().mockReturnValue({
          connect: connectSpy,
          start: startSpy,
          buffer: null,
        }),
      })),
    );

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      }),
    );

    const audioModule = await import('./audio');
    playBlindCountdownSound = audioModule.playBlindCountdownSound;
    playBlindRaiseSound = audioModule.playBlindRaiseSound;
    playTournamentStartSound = audioModule.playTournamentStartSound;
    unlockAudio = audioModule.unlockAudio;
  });

  it('playBlindCountdownSound fetches correct path and plays via Web Audio API', async () => {
    playBlindCountdownSound();
    await vi.waitFor(() => {
      expect(startSpy).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith('/sounds/blind-countdown.mp3');
    expect(connectSpy).toHaveBeenCalledWith(mockDestination);
    expect(startSpy).toHaveBeenCalledWith(0);
  });

  it('playBlindRaiseSound fetches correct path and plays via Web Audio API', async () => {
    playBlindRaiseSound();
    await vi.waitFor(() => {
      expect(startSpy).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith('/sounds/blind-raise.mp3');
  });

  it('playTournamentStartSound fetches correct path and plays via Web Audio API', async () => {
    playTournamentStartSound();
    await vi.waitFor(() => {
      expect(startSpy).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith('/sounds/tournament-start.mp3');
  });

  it('unlockAudio resumes a suspended AudioContext and preloads sounds', async () => {
    // Override with suspended context for this test
    vi.resetModules();
    const suspendedResume = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal(
      'AudioContext',
      vi.fn().mockImplementation(() => ({
        state: 'suspended',
        resume: suspendedResume,
        decodeAudioData: decodeAudioDataSpy,
        destination: mockDestination,
        createBufferSource: vi.fn().mockReturnValue({
          connect: connectSpy,
          start: startSpy,
          buffer: null,
        }),
      })),
    );

    const audioModule = await import('./audio');
    audioModule.unlockAudio();
    expect(suspendedResume).toHaveBeenCalled();
    // Should preload all 3 sounds
    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });
});
