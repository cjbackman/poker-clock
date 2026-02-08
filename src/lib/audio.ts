let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();

const SOUND_PATHS = {
  blindCountdown: 'sounds/blind-countdown.mp3',
  blindRaise: 'sounds/blind-raise.mp3',
  tournamentStart: 'sounds/tournament-start.mp3',
} as const;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

const loadBuffer = async (path: string): Promise<AudioBuffer> => {
  const cached = bufferCache.get(path);
  if (cached) return cached;

  const response = await fetch(`${import.meta.env.BASE_URL}${path}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = await getAudioContext().decodeAudioData(arrayBuffer);
  bufferCache.set(path, buffer);
  return buffer;
};

/**
 * Call on first user gesture (e.g. Play button tap) to unlock audio
 * playback on mobile browsers and preload all sound buffers.
 *
 * Plays a silent buffer to fully unlock the iOS audio pipeline, then
 * preloads all sounds so subsequent non-gesture playback works.
 */
export const unlockAudio = async () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  // Play a tiny silent buffer to fully unlock audio on iOS Safari.
  // Without this, the context may re-suspend before the first real sound.
  const silentBuffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  const source = ctx.createBufferSource();
  source.buffer = silentBuffer;
  source.connect(ctx.destination);
  source.start(0);

  // Preload all sounds so they play instantly when needed
  Object.values(SOUND_PATHS).forEach((path) => loadBuffer(path));
};

const playSound = (path: string) => {
  const ctx = getAudioContext();
  const play = () => {
    loadBuffer(path)
      .then((buffer) => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      })
      .catch(() => {});
  };

  if (ctx.state === 'suspended') {
    ctx.resume().then(play);
  } else {
    play();
  }
};

export const playBlindCountdownSound = () => {
  playSound(SOUND_PATHS.blindCountdown);
};

export const playBlindRaiseSound = () => {
  playSound(SOUND_PATHS.blindRaise);
};

export const playTournamentStartSound = () => {
  playSound(SOUND_PATHS.tournamentStart);
};
