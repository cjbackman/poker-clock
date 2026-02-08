import { useState, useEffect } from 'react';
import { TournamentProvider } from '@/hooks/useTournament';
import TournamentTitle from '@/components/TournamentTitle';
import Timer from '@/components/Timer';
import StartStack from '@/components/StartStack';
import PrizePool from '@/components/PrizePool';
import EntriesPanel from '@/components/EntriesPanel';
import OrganizerPanel from '@/components/OrganizerPanel';
import { Loader2 } from 'lucide-react';

const PokerClock = () => {
  const [loading, setLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background poker-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <h1 className="text-2xl font-medium">Getting ready to shuffle up and deal...</h1>
        </div>
      </div>
    );
  }

  return (
    <TournamentProvider>
      <div className="min-h-screen w-full flex flex-col bg-background poker-bg">
        <main className="flex-1 p-4 md:p-6 lg:p-8 container">
          {/* Tournament Title */}
          <div className="mb-4 md:mb-6">
            <TournamentTitle />
          </div>

          {/* Timer - Top Half */}
          <div className="mb-4 md:mb-8 h-[35vh] md:h-[45vh]">
            <div className="glass rounded-3xl p-4 md:p-10 w-full h-full flex items-center justify-center shadow-lg">
              <Timer />
            </div>
          </div>

          {/* Bottom Half - Three Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 md:h-[35vh]">
            {/* Prize Pool - Left */}
            <div className="h-full">
              <PrizePool />
            </div>

            {/* Start Stack - Middle */}
            <div className="h-full">
              <StartStack />
            </div>

            {/* Buy-ins and Rebuys - Right */}
            <div className="h-full">
              <EntriesPanel />
            </div>
          </div>

          {/* Organizer Panel (Settings) */}
          <OrganizerPanel />
        </main>
      </div>
    </TournamentProvider>
  );
};

export default PokerClock;
