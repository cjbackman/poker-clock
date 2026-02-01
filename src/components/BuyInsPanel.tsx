
import { useTournament } from '@/hooks/useTournament';
import { Plus, Minus, DollarSign, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playButtonClickSound } from '@/lib/audio';

const BuyInsPanel = () => {
  const { 
    tournament, 
    addBuyIn,
    removeBuyIn,
    addReBuy,
    removeReBuy,
    resetCounts
  } = useTournament();
  
  const { buyIns, reBuys } = tournament;
  const { buyInAmount, reBuyAmount } = tournament.settings;
  
  return (
    <div className="glass p-6 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Buy-ins & Rebuys</h2>
        <DollarSign className="h-5 w-5 text-poker-accent" />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Buy-ins */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Buy-ins ({buyInAmount})</div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => {
                  removeBuyIn();
                  playButtonClickSound();
                }}
                disabled={buyIns === 0}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Remove Buy-in</span>
              </Button>
              
              <div className="text-xl font-medium w-10 text-center">
                {buyIns}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => {
                  addBuyIn();
                  playButtonClickSound();
                }}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add Buy-in</span>
              </Button>
            </div>
          </div>
          
          <div className="text-sm">
            Total: {buyIns * buyInAmount}
          </div>
        </div>
        
        {/* Rebuys */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Rebuys ({reBuyAmount})</div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => {
                  removeReBuy();
                  playButtonClickSound();
                }}
                disabled={reBuys === 0}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Remove Rebuy</span>
              </Button>
              
              <div className="text-xl font-medium w-10 text-center">
                {reBuys}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => {
                  addReBuy();
                  playButtonClickSound();
                }}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add Rebuy</span>
              </Button>
            </div>
          </div>
          
          <div className="text-sm">
            Total: {reBuys * reBuyAmount}
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-auto flex items-center justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground"
          onClick={() => {
            resetCounts();
            playButtonClickSound();
          }}
        >
          <RefreshCcw className="h-3 w-3 mr-1" />
          Reset Counts
        </Button>
      </div>
    </div>
  );
};

export default BuyInsPanel;
