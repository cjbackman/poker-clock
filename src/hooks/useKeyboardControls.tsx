import { useEffect } from 'react';

interface KeyboardControlsProps {
  onSpacePress: () => void;
}

export const useKeyboardControls = ({ onSpacePress }: KeyboardControlsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the key pressed is spacebar and not in an input field
      if (
        event.code === 'Space' &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        event.preventDefault();
        onSpacePress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSpacePress]);
};
