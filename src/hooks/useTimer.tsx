import { useState, useEffect, useCallback, useRef } from 'react';

export interface TimerOptions {
  initialTime: number; // Initial time in seconds
  interval?: number; // Update interval in milliseconds
  autoStart?: boolean; // Whether to start the timer automatically
  onTick?: (timeRemaining: number) => void; // Callback on each tick
  onComplete?: () => void; // Callback when timer reaches zero
  onTimeChange?: (newTime: number) => void; // Callback when time is changed
}

export const useTimer = ({
  initialTime,
  interval = 1000,
  autoStart = false,
  onTick,
  onComplete,
  onTimeChange,
}: TimerOptions) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(!autoStart);

  // Use refs to avoid stale closures in useEffect
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeRemainingRef = useRef<number>(initialTime);
  const isRunningRef = useRef<boolean>(autoStart);
  const callbackRef = useRef({ onTick, onComplete, onTimeChange });

  // Update callback refs when they change
  useEffect(() => {
    callbackRef.current = { onTick, onComplete, onTimeChange };
  }, [onTick, onComplete, onTimeChange]);

  // Timer setup and cleanup
  useEffect(() => {
    // Clear interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Effect to start/stop timer when isRunning changes
  useEffect(() => {
    if (isRunning) {
      console.log('Timer started/resumed! isRunning:', isRunning);
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Anchor: real clock time when this run started, and the value at that moment
      const anchorTime = Date.now();
      const anchorValue = timeRemainingRef.current;

      // Create a new interval
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - anchorTime) / 1000);
        const newRemaining = Math.max(0, anchorValue - elapsed);

        if (newRemaining !== timeRemainingRef.current) {
          timeRemainingRef.current = newRemaining;
          setTimeRemaining(newRemaining);

          // Call onTick callback
          if (callbackRef.current.onTick) {
            callbackRef.current.onTick(newRemaining);
          }

          // Check if timer is complete
          if (newRemaining === 0) {
            // Stop the timer
            setIsRunning(false);
            isRunningRef.current = false;
            setIsComplete(true);

            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }

            // Call onComplete callback
            if (callbackRef.current.onComplete) {
              callbackRef.current.onComplete();
            }
          }
        }
      }, interval);
    } else if (intervalRef.current) {
      console.log('Timer stopped! isRunning:', isRunning);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    isRunningRef.current = isRunning;
  }, [isRunning, interval]);

  // Effect to update timeRemaining when initialTime changes
  useEffect(() => {
    console.log('Timer reset with new initialTime:', initialTime);
    setTimeRemaining(initialTime);
    timeRemainingRef.current = initialTime;
    setIsComplete(false);

    // Call onTimeChange callback
    if (callbackRef.current.onTimeChange) {
      callbackRef.current.onTimeChange(initialTime);
    }
  }, [initialTime]);

  // Start the timer
  const start = useCallback(() => {
    console.log('Timer start called, current state:', {
      isRunning: isRunningRef.current,
      timeRemaining: timeRemainingRef.current,
    });
    if (!isRunningRef.current && timeRemainingRef.current > 0) {
      console.log('Starting timer');
      setIsRunning(true);
      setIsPaused(false);
      setIsComplete(false);
    } else {
      console.log('Cannot start timer - already running or time is 0');
    }
  }, []);

  // Pause the timer
  const pause = useCallback(() => {
    console.log('Timer pause called');
    if (isRunningRef.current) {
      setIsRunning(false);
      setIsPaused(true);
    }
  }, []);

  // Resume the timer
  const resume = useCallback(() => {
    console.log('Timer resume called');
    if (!isRunningRef.current && !isComplete && isPaused) {
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [isComplete, isPaused]);

  // Reset the timer
  const reset = useCallback(
    (newTime?: number) => {
      console.log('Timer reset called with time:', newTime);
      const resetTime = newTime !== undefined ? newTime : initialTime;

      // First stop the timer if it's running
      if (isRunningRef.current) {
        setIsRunning(false);
      }

      // Then update the time
      setTimeRemaining(resetTime);
      timeRemainingRef.current = resetTime;
      setIsPaused(true);
      setIsComplete(false);

      // Call onTimeChange callback
      if (callbackRef.current.onTimeChange) {
        callbackRef.current.onTimeChange(resetTime);
      }
    },
    [initialTime],
  );

  // Add time to the timer
  const addTime = useCallback(
    (seconds: number) => {
      const newTime = timeRemainingRef.current + seconds;
      setTimeRemaining(newTime);
      timeRemainingRef.current = newTime;

      if (newTime > 0 && isComplete) {
        setIsComplete(false);
      }

      // Call onTimeChange callback
      if (callbackRef.current.onTimeChange) {
        callbackRef.current.onTimeChange(newTime);
      }
    },
    [isComplete],
  );

  // Format seconds to MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    isComplete,
    start,
    pause,
    resume,
    reset,
    addTime,
    formatTime,
  };
};
