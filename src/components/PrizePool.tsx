import { useTournament } from '@/hooks/useTournament';
import { Trophy } from 'lucide-react';
import { STARTING_STACK_TOTAL } from '@/lib/chips';

const PrizePool = () => {
  const { tournament, prizePool, prizes } = useTournament();

  // Format amount without currency
  const formatAmount = (amount: number) => {
    return Number.isInteger(amount) ? `${amount}` : `${amount.toFixed(2)}`;
  };

  return (
    <div className="glass p-6 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Prize Pool</h2>
        <Trophy className="h-5 w-5 text-poker-gold" />
      </div>

      {/* Total Prize Pool */}
      <div className="mb-5">
        <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
        <div className="text-3xl md:text-4xl font-semibold">{formatAmount(prizePool)}</div>
      </div>

      {/* Prize Distribution */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="prize-badge prize-badge-1st">1st Place</div>
          <div className="text-xl font-medium">{formatAmount(prizes.first)}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="prize-badge prize-badge-2nd">2nd Place</div>
          <div className="text-xl font-medium">{formatAmount(prizes.second)}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="prize-badge prize-badge-3rd">3rd Place</div>
          <div className="text-xl font-medium">{formatAmount(prizes.third)}</div>
        </div>
      </div>

      {/* Total Chips in Play */}
      <div className="mt-5">
        <div className="text-sm text-muted-foreground mb-1">Total Chips in Play</div>
        <div className="text-3xl md:text-4xl font-semibold">
          {((tournament.buyIns + tournament.reBuys) * STARTING_STACK_TOTAL).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default PrizePool;
