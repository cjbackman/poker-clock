const playSound = (path: string) => {
  const audio = new Audio(path);
  audio.play().catch(() => {});
};

export const playButtonClickSound = () => {
  playSound('/sounds/button-click.mp3');
};

export const playBlindChangeSound = () => {
  playSound('/sounds/blind-change.mp3');
};

export const playSuccessSound = () => {
  playSound('/sounds/success.mp3');
};

export const playNotificationSound = () => {
  playSound('/sounds/notification.mp3');
};

export const playTimerEndSound = () => {
  playSound('/sounds/blind-change.mp3');
};
