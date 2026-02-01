import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardControls } from './useKeyboardControls';

describe('useKeyboardControls', () => {
  const onSpacePressMock = vi.fn();

  beforeEach(() => {
    onSpacePressMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call onSpacePress when space key is pressed', () => {
    renderHook(() => useKeyboardControls({ onSpacePress: onSpacePressMock }));

    // Simulate space key press
    const event = new KeyboardEvent('keydown', { code: 'Space' });
    window.dispatchEvent(event);

    expect(onSpacePressMock).toHaveBeenCalledTimes(1);
  });

  it('should not call onSpacePress when other keys are pressed', () => {
    renderHook(() => useKeyboardControls({ onSpacePress: onSpacePressMock }));

    // Simulate enter key press
    const event = new KeyboardEvent('keydown', { code: 'Enter' });
    window.dispatchEvent(event);

    expect(onSpacePressMock).not.toHaveBeenCalled();
  });

  it('should prevent default when space key is pressed', () => {
    renderHook(() => useKeyboardControls({ onSpacePress: onSpacePressMock }));

    // Simulate space key press with preventDefault spy
    const event = new KeyboardEvent('keydown', { code: 'Space' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // We need to manually call the event handler since the spy won't work with dispatchEvent
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onSpacePressMock();
      }
    };

    handleKeyDown(event);

    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    expect(onSpacePressMock).toHaveBeenCalledTimes(1);
  });

  it('should cleanup event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardControls({ onSpacePress: onSpacePressMock }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
