import { describe, it, expect } from 'vitest';
import { getNextLevel, blindStructures, BlindStructure } from './blindStructures';

describe('blindStructures', () => {
  describe('predefined structures', () => {
    it('regular structure has sequential level ids starting at 1', () => {
      const { levels } = blindStructures.regular;
      levels.forEach((level, index) => {
        expect(level.id).toBe(index + 1);
      });
    });

    it('regular structure has 20 levels', () => {
      expect(blindStructures.regular.levels).toHaveLength(20);
    });

    it('every level has positive smallBlind, bigBlind, and duration', () => {
      for (const level of blindStructures.regular.levels) {
        expect(level.smallBlind).toBeGreaterThan(0);
        expect(level.bigBlind).toBeGreaterThan(0);
        expect(level.duration).toBeGreaterThan(0);
      }
    });

    it('bigBlind is always greater than smallBlind', () => {
      for (const level of blindStructures.regular.levels) {
        expect(level.bigBlind).toBeGreaterThan(level.smallBlind);
      }
    });

    it('blinds increase monotonically across levels', () => {
      const { levels } = blindStructures.regular;
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i].smallBlind).toBeGreaterThan(levels[i - 1].smallBlind);
        expect(levels[i].bigBlind).toBeGreaterThan(levels[i - 1].bigBlind);
      }
    });
  });

  describe('getNextLevel', () => {
    const structure: BlindStructure = {
      name: 'Test',
      levels: [
        { id: 1, smallBlind: 10, bigBlind: 20, ante: 0, duration: 600 },
        { id: 2, smallBlind: 20, bigBlind: 40, ante: 0, duration: 600 },
        { id: 3, smallBlind: 50, bigBlind: 100, ante: 0, duration: 600 },
      ],
    };

    it('returns the next level when current level is not the last', () => {
      const next = getNextLevel(structure, 1);
      expect(next).toEqual(structure.levels[1]);
    });

    it('returns the third level when current is second', () => {
      const next = getNextLevel(structure, 2);
      expect(next).toEqual(structure.levels[2]);
    });

    it('returns null when current level is the last', () => {
      const next = getNextLevel(structure, 3);
      expect(next).toBeNull();
    });

    it('returns null when currentLevelId is not found', () => {
      const next = getNextLevel(structure, 999);
      expect(next).toBeNull();
    });

    it('works with a single-level structure', () => {
      const single: BlindStructure = {
        name: 'Single',
        levels: [{ id: 1, smallBlind: 10, bigBlind: 20, ante: 0, duration: 600 }],
      };
      expect(getNextLevel(single, 1)).toBeNull();
    });
  });
});
