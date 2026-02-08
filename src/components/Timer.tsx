import { useState, useEffect } from 'react';
import { useTournament } from '@/hooks/useTournament';
import { Play, Pause } from 'lucide-react';
import { playTournamentStartSound, unlockAudio } from '@/lib/audio';
import { Button } from '@/components/ui/button';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { shouldShowBlindChangeAlert } from '@/lib/timerUtils';

const Timer = () => {
  const { timer, tournament, currentLevel, nextLevel } = useTournament();
  const { isBlindChangeAlert } = tournament;
  const [animate, setAnimate] = useState(false);
  const [blindAnimate, setBlindAnimate] = useState(false);

  const handlePlayPause = () => {
    unlockAudio();
    if (timer.isRunning) {
      timer.pause();
    } else {
      if (currentLevel.id === 1 && timer.timeRemaining === currentLevel.duration) {
        playTournamentStartSound();
      }
      if (timer.isPaused) {
        timer.resume();
      } else {
        timer.start();
      }
    }
  };

  // Set up keyboard controls for play/pause with spacebar
  useKeyboardControls({
    onSpacePress: handlePlayPause,
  });

  // Blind change alert animation
  useEffect(() => {
    if (isBlindChangeAlert) {
      const interval = setInterval(() => {
        setBlindAnimate((prev) => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setBlindAnimate(false);
    }
  }, [isBlindChangeAlert]);

  // Create a visual timer display
  const minutes = Math.floor(timer.timeRemaining / 60);
  const seconds = timer.timeRemaining % 60;

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  // Determine if we're near the end of the timer (using timerUtils)
  const isNearEnd = shouldShowBlindChangeAlert(timer.timeRemaining);

  return (
    <div className="flex items-center justify-between w-full h-full gap-4 md:gap-6">
      {/* Left Column: Current Blinds */}
      <div
        className={`flex flex-col items-center justify-center flex-1 transition-all duration-300
          ${isBlindChangeAlert ? 'animate-pulse-alert' : ''}`}
      >
        <div className="px-3 py-1 bg-secondary rounded-full text-xs md:text-sm font-medium mb-2">
          Level {currentLevel.id}
        </div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          Current Blinds
        </div>
        <div
          className={`text-xl sm:text-2xl md:text-4xl font-semibold transition-colors duration-300
            ${isBlindChangeAlert ? 'text-poker-red' : 'text-poker-gold'}`}
        >
          {currentLevel.smallBlind} / {currentLevel.bigBlind}
        </div>
        {currentLevel.ante > 0 && (
          <div className="text-xs mt-1 text-muted-foreground">Ante: {currentLevel.ante}</div>
        )}
      </div>

      {/* Center: Timer */}
      <div className="flex flex-col items-center justify-center flex-shrink-0">
        <div
          role="timer"
          className={`text-7xl sm:text-8xl md:text-[12rem] xl:text-[14rem] font-mono tracking-tight transition-all duration-300 ease-in-out
            ${animate ? 'scale-105 text-primary' : 'scale-100'}
            ${isNearEnd ? 'text-poker-red' : 'text-poker-gold'}`}
        >
          <span className={`inline-block ${animate ? 'digit-change' : ''}`}>
            {formattedMinutes}
          </span>
          <span className="mx-1">:</span>
          <span className={`inline-block ${animate ? 'digit-change' : ''}`}>
            {formattedSeconds}
          </span>
        </div>

        {/* Timer Controls - Play/pause button only */}
        <div className="flex gap-5 items-center mt-4 md:mt-10">
          {timer.isRunning ? (
            <Button
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-full shadow-button hover:shadow-button-hover transition-all duration-300 border-2"
              onClick={handlePlayPause}
            >
              <Pause className="h-8 w-8" />
              <span className="sr-only">Pause</span>
            </Button>
          ) : (
            <Button
              variant="default"
              size="lg"
              className="h-16 w-16 rounded-full shadow-button hover:shadow-button-hover transition-all duration-300 bg-poker-accent hover:bg-poker-accent/90 border-2 border-poker-accent/20"
              onClick={handlePlayPause}
            >
              <Play className="h-8 w-8 ml-1" />
              <span className="sr-only">Play</span>
            </Button>
          )}
        </div>
      </div>

      {/* Right Column: Next Level */}
      <div className="flex flex-col items-center justify-center flex-1">
        {nextLevel ? (
          <>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Next Level
            </div>
            <div className="text-xl sm:text-2xl md:text-4xl font-medium">
              {nextLevel.smallBlind} / {nextLevel.bigBlind}
            </div>
            {nextLevel.ante > 0 && (
              <div className="text-xs mt-1 text-muted-foreground">Ante: {nextLevel.ante}</div>
            )}
          </>
        ) : (
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Final Level</div>
        )}
      </div>
    </div>
  );
};

export default Timer;
