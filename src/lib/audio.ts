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
 */
export const unlockAudio = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  // Preload all sounds so they play instantly when needed
  Object.values(SOUND_PATHS).forEach((path) => loadBuffer(path));
};

const playSound = (path: string) => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  loadBuffer(path)
    .then((buffer) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    })
    .catch(() => {});
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
