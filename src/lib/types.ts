import { BlindStructure } from '@/lib/blindStructures';

export type PrizeDistributionType = 'percentage' | 'fixed';

export interface PrizeDistribution {
  type: PrizeDistributionType;
  first: number;
  second: number;
  third: number;
}

export interface TournamentSettings {
  title: string;
  buyInAmount: number;
  reBuyAmount: number;
  rent: number;
  blindStructure: BlindStructure;
  prizeDistribution: PrizeDistribution;
}

export interface TournamentState {
  settings: TournamentSettings;
  buyIns: number;
  reBuys: number;
  currentLevelId: number;
  isBlindChangeAlert: boolean;
  isPanelOpen: boolean;
}
