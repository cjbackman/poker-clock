import { describe, it, expect } from 'vitest';
import { shouldShowBlindChangeAlert, formatBlindChangeNotification } from './timerUtils';

describe('timerUtils', () => {
  describe('shouldShowBlindChangeAlert', () => {
    it('should return true if time remaining is less than or equal to 10 seconds', () => {
      expect(shouldShowBlindChangeAlert(10)).toBe(true);
      expect(shouldShowBlindChangeAlert(5)).toBe(true);
      expect(shouldShowBlindChangeAlert(1)).toBe(true);
    });

    it('should return false if time remaining is greater than 10 seconds', () => {
      expect(shouldShowBlindChangeAlert(11)).toBe(false);
      expect(shouldShowBlindChangeAlert(60)).toBe(false);
    });

    it('should return false if time remaining is 0 or negative', () => {
      expect(shouldShowBlindChangeAlert(0)).toBe(false);
      expect(shouldShowBlindChangeAlert(-1)).toBe(false);
    });
  });

  describe('formatBlindChangeNotification', () => {
    it('should correctly format the notification message without currency symbols', () => {
      expect(formatBlindChangeNotification(25, 50)).toBe('Blinds changing to 25/50');
      expect(formatBlindChangeNotification(100, 200)).toBe('Blinds changing to 100/200');
    });
  });
});
