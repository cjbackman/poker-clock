/**
 * Check if the timer should show a blind change alert
 * @param timeRemaining Time remaining in seconds
 * @returns Boolean indicating whether to show the alert
 */
export const shouldShowBlindChangeAlert = (timeRemaining: number): boolean => {
  return timeRemaining > 0 && timeRemaining <= 10;
};

/**
 * Format a notification message without currency symbols
 * @param smallBlind Small blind amount
 * @param bigBlind Big blind amount
 * @returns Formatted notification message
 */
export const formatBlindChangeNotification = (smallBlind: number, bigBlind: number): string => {
  return `Blinds changing to ${smallBlind}/${bigBlind}`;
};
