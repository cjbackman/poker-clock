import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TournamentProvider, useTournament } from '@/hooks/useTournament';
import OrganizerPanel from './OrganizerPanel';

vi.mock('@/lib/audio', () => ({
  playBlindCountdownSound: vi.fn(),
  playBlindRaiseSound: vi.fn(),
  playTournamentStartSound: vi.fn(),
  unlockAudio: vi.fn(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const toggleSettingsPanelMock = vi.fn();
const updateBlindLevelMock = vi.fn();

const baseMock = () => ({
  timer: {
    timeRemaining: 900,
    isRunning: false,
    isPaused: true,
    isComplete: false,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    addTime: vi.fn(),
    formatTime: vi.fn(
      (seconds: number) =>
        `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`,
    ),
  },
  tournament: {
    settings: {
      title: 'Poker Tournament',
      buyInAmount: 20,
      reBuyAmount: 20,
      blindStructure: {
        name: 'Regular',
        levels: [
          { id: 1, smallBlind: 5, bigBlind: 10, ante: 0, duration: 900 },
          { id: 2, smallBlind: 10, bigBlind: 20, ante: 0, duration: 900 },
        ],
      },
      prizeDistribution: {
        type: 'percentage',
        first: 60,
        second: 30,
        third: 10,
      },
    },
    buyIns: 0,
    reBuys: 0,
    currentLevelId: 1,
    isBlindChangeAlert: false,
    isPanelOpen: true,
  },
  currentLevel: { id: 1, smallBlind: 5, bigBlind: 10, ante: 0, duration: 900 },
  nextLevel: { id: 2, smallBlind: 10, bigBlind: 20, ante: 0, duration: 900 },
  prizePool: 0,
  prizes: { first: 0, second: 0, third: 0 },
  updateSettings: vi.fn(),
  updateBlindStructure: vi.fn(),
  addBuyIn: vi.fn(),
  removeBuyIn: vi.fn(),
  addReBuy: vi.fn(),
  removeReBuy: vi.fn(),
  advanceToNextLevel: vi.fn(),
  resetTournament: vi.fn(),
  toggleSettingsPanel: toggleSettingsPanelMock,
  dismissAlert: vi.fn(),
  updatePrizeDistribution: vi.fn(),
  updateCustomBlindStructure: vi.fn(),
  addBlindLevel: vi.fn(),
  removeBlindLevel: vi.fn(),
  updateBlindLevel: updateBlindLevelMock,
  resetCounts: vi.fn(),
  resetLevels: vi.fn(),
  resetTimer: vi.fn(),
});

vi.mock('@/hooks/useTournament', () => {
  const mockUseTournament = vi.fn();
  return {
    TournamentProvider: ({ children }: { children: React.ReactNode }) => children,
    useTournament: mockUseTournament,
  };
});

const expandStructureSection = () => {
  const structureButton = screen.getByText('Blind Structure');
  fireEvent.click(structureButton);
};

describe('OrganizerPanel duration editing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTournament).mockImplementation(baseMock);
  });

  it('allows clearing the duration field', () => {
    render(
      <TournamentProvider>
        <OrganizerPanel />
      </TournamentProvider>,
    );

    expandStructureSection();

    const durationInput = screen.getById
      ? screen.getByRole('textbox', { name: /min/i })
      : (document.getElementById('duration-1') as HTMLInputElement);

    // Initially shows 15 (900s / 60)
    expect(durationInput).toHaveValue('15');

    // Clear the field
    fireEvent.change(durationInput, { target: { value: '' } });

    // Field should now be empty
    expect(durationInput).toHaveValue('');
  });

  it('shows warning when duration is empty', () => {
    render(
      <TournamentProvider>
        <OrganizerPanel />
      </TournamentProvider>,
    );

    expandStructureSection();

    const durationInput = document.getElementById('duration-1') as HTMLInputElement;

    // Clear the field
    fireEvent.change(durationInput, { target: { value: '' } });

    // Warning should appear
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('applies red border when duration is invalid', () => {
    render(
      <TournamentProvider>
        <OrganizerPanel />
      </TournamentProvider>,
    );

    expandStructureSection();

    const durationInput = document.getElementById('duration-1') as HTMLInputElement;

    fireEvent.change(durationInput, { target: { value: '' } });

    expect(durationInput.className).toContain('border-red-500');
  });

  it('blocks panel close when duration is invalid', () => {
    render(
      <TournamentProvider>
        <OrganizerPanel />
      </TournamentProvider>,
    );

    expandStructureSection();

    const durationInput = document.getElementById('duration-1') as HTMLInputElement;

    // Clear the field to make it invalid
    fireEvent.change(durationInput, { target: { value: '' } });

    // Try to close via X button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // toggleSettingsPanel should NOT have been called
    expect(toggleSettingsPanelMock).not.toHaveBeenCalled();
  });

  it('blocks panel close via overlay click when duration is invalid', () => {
    const { container } = render(
      <TournamentProvider>
        <OrganizerPanel />
      </TournamentProvider>,
    );

    expandStructureSection();

    const durationInput = document.getElementById('duration-1') as HTMLInputElement;
    fireEvent.change(durationInput, { target: { value: '' } });

    // Click the overlay (the outer backdrop div)
    const overlay = container.parentElement!.querySelector('.fixed.inset-0') as HTMLElement;
    fireEvent.click(overlay);

    expect(toggleSettingsPanelMock).not.toHaveBeenCalled();
  });

  it('commits valid duration on blur', () => {
    render(
      <TournamentProvider>
        <OrganizerPanel />
      </TournamentProvider>,
    );

    expandStructureSection();

    const durationInput = document.getElementById('duration-1') as HTMLInputElement;

    // Type a new value
    fireEvent.change(durationInput, { target: { value: '10' } });

    // Blur to commit
    fireEvent.blur(durationInput);

    // Should call updateBlindLevel with 10 minutes = 600 seconds
    expect(updateBlindLevelMock).toHaveBeenCalledWith(1, 'duration', 600);
  });

  it('commits valid seconds duration on blur', () => {
    render(
      <TournamentProvider>
        <OrganizerPanel />
      </TournamentProvider>,
    );

    expandStructureSection();

    const durationInput = document.getElementById('duration-1') as HTMLInputElement;

    // Type seconds value
    fireEvent.change(durationInput, { target: { value: '45s' } });

    // Blur to commit
    fireEvent.blur(durationInput);

    // Should call updateBlindLevel with 45 seconds
    expect(updateBlindLevelMock).toHaveBeenCalledWith(1, 'duration', 45);
  });

  it('does not commit invalid duration on blur', () => {
    render(
      <TournamentProvider>
        <OrganizerPanel />
      </TournamentProvider>,
    );

    expandStructureSection();

    const durationInput = document.getElementById('duration-1') as HTMLInputElement;

    // Clear the field
    fireEvent.change(durationInput, { target: { value: '' } });

    // Blur
    fireEvent.blur(durationInput);

    // Should NOT call updateBlindLevel
    expect(updateBlindLevelMock).not.toHaveBeenCalled();

    // Warning should still be visible
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('allows panel close after fixing invalid duration', () => {
    render(
      <TournamentProvider>
        <OrganizerPanel />
      </TournamentProvider>,
    );

    expandStructureSection();

    const durationInput = document.getElementById('duration-1') as HTMLInputElement;

    // Clear the field
    fireEvent.change(durationInput, { target: { value: '' } });

    // Try to close - should be blocked
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(toggleSettingsPanelMock).not.toHaveBeenCalled();

    // Fix the value
    fireEvent.change(durationInput, { target: { value: '5' } });

    // Blur to commit
    fireEvent.blur(durationInput);

    // Now close should work
    fireEvent.click(closeButton);
    expect(toggleSettingsPanelMock).toHaveBeenCalledTimes(1);
  });
});
