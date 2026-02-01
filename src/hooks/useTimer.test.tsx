import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';

// Audio is mocked globally in test/setup.ts via HTMLMediaElement.prototype.play

vi.mock('@/lib/audio', () => ({
  playBlindChangeSound: vi.fn(),
  playTimerEndSound: vi.fn(),
}));

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('starts with the given initial time', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 300 }));
      expect(result.current.timeRemaining).toBe(300);
    });

    it('starts paused by default', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 300 }));
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(true);
      expect(result.current.isComplete).toBe(false);
    });

    it('auto-starts when autoStart is true', () => {
      const { result } = renderHook(() =>
        useTimer({ initialTime: 300, autoStart: true }),
      );
      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('start / pause / resume', () => {
    it('start() transitions from paused to running', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 300 }));

      act(() => result.current.start());

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it('pause() stops a running timer', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 300 }));

      act(() => result.current.start());
      act(() => result.current.pause());

      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(true);
    });

    it('resume() restarts a paused timer', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 300 }));

      act(() => result.current.start());
      act(() => result.current.pause());
      act(() => result.current.resume());

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it('start() does nothing when already running', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 300 }));

      act(() => result.current.start());
      act(() => result.current.start()); // second call is a no-op

      expect(result.current.isRunning).toBe(true);
    });

    it('start() does nothing when timeRemaining is 0', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 0 }));

      act(() => result.current.start());

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('countdown', () => {
    it('decrements timeRemaining each second', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 5 }));

      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(1000));

      expect(result.current.timeRemaining).toBeLessThanOrEqual(4);
    });

    it('calls onTick on each tick', () => {
      const onTick = vi.fn();
      const { result } = renderHook(() =>
        useTimer({ initialTime: 5, onTick }),
      );

      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(1000));

      expect(onTick).toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('marks isComplete when timer reaches 0', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useTimer({ initialTime: 2, onComplete }),
      );

      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(3000));

      expect(result.current.isComplete).toBe(true);
      expect(result.current.isRunning).toBe(false);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('timeRemaining never goes below 0', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 1 }));

      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(5000));

      expect(result.current.timeRemaining).toBe(0);
    });
  });

  describe('reset', () => {
    it('resets to initialTime by default', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 300 }));

      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(2000));
      act(() => result.current.reset());

      expect(result.current.timeRemaining).toBe(300);
      expect(result.current.isPaused).toBe(true);
      expect(result.current.isComplete).toBe(false);
    });

    it('resets to a custom time when provided', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 300 }));

      act(() => result.current.reset(600));

      expect(result.current.timeRemaining).toBe(600);
    });

    it('stops a running timer', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 300 }));

      act(() => result.current.start());
      act(() => result.current.reset());

      expect(result.current.isRunning).toBe(false);
    });

    it('calls onTimeChange callback when resetting', () => {
      const onTimeChange = vi.fn();
      const { result } = renderHook(() =>
        useTimer({ initialTime: 300, onTimeChange }),
      );

      onTimeChange.mockClear();

      act(() => result.current.reset(900));
      expect(onTimeChange).toHaveBeenCalledWith(900);
    });
  });

  describe('addTime', () => {
    it('adds seconds to the current timeRemaining', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 100 }));

      act(() => result.current.addTime(30));

      expect(result.current.timeRemaining).toBe(130);
    });

    it('clears isComplete if time becomes positive', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 1 }));

      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(2000));
      expect(result.current.isComplete).toBe(true);

      act(() => result.current.addTime(10));
      expect(result.current.isComplete).toBe(false);
      expect(result.current.timeRemaining).toBe(10);
    });

    it('calls onTimeChange callback', () => {
      const onTimeChange = vi.fn();
      const { result } = renderHook(() =>
        useTimer({ initialTime: 100, onTimeChange }),
      );

      // Clear calls from initial render
      onTimeChange.mockClear();

      act(() => result.current.addTime(20));
      expect(onTimeChange).toHaveBeenCalledWith(120);
    });
  });

  describe('formatTime', () => {
    it('formats seconds as MM:SS with zero-padding', () => {
      const { result } = renderHook(() => useTimer({ initialTime: 0 }));

      expect(result.current.formatTime(0)).toBe('00:00');
      expect(result.current.formatTime(59)).toBe('00:59');
      expect(result.current.formatTime(60)).toBe('01:00');
      expect(result.current.formatTime(61)).toBe('01:01');
      expect(result.current.formatTime(600)).toBe('10:00');
      expect(result.current.formatTime(1200)).toBe('20:00');
      expect(result.current.formatTime(3599)).toBe('59:59');
    });
  });

  describe('initialTime changes', () => {
    it('updates timeRemaining when initialTime prop changes', () => {
      const { result, rerender } = renderHook(
        ({ initialTime }) => useTimer({ initialTime }),
        { initialProps: { initialTime: 300 } },
      );

      expect(result.current.timeRemaining).toBe(300);

      rerender({ initialTime: 600 });

      expect(result.current.timeRemaining).toBe(600);
      expect(result.current.isComplete).toBe(false);
    });
  });
});
