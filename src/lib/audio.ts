export const playButtonClickSound = () => {
  const audio = new Audio('/sounds/button-click.mp3');
  audio.play();
};

export const playBlindChangeSound = () => {
  const audio = new Audio('/sounds/blind-change.mp3');
  audio.play();
};

export const playSuccessSound = () => {
  const audio = new Audio('/sounds/success.mp3');
  audio.play();
};

export const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.play();
};

export const playTimerEndSound = () => {
  const audio = new Audio('/sounds/blind-change.mp3'); // Reusing blind-change sound for timer end
  audio.play();
};
