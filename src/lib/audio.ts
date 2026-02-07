const playSound = (path: string) => {
  const audio = new Audio(`${import.meta.env.BASE_URL}${path}`);
  audio.play().catch(() => {});
};

export const playBlindCountdownSound = () => {
  playSound('sounds/blind-countdown.mp3');
};

export const playBlindRaiseSound = () => {
  playSound('sounds/blind-raise.mp3');
};

export const playTournamentStartSound = () => {
  playSound('sounds/tournament-start.mp3');
};
