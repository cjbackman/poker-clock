import { useState, useEffect } from 'react';
import { TournamentProvider } from '@/hooks/useTournament';
import Layout from '@/components/Layout';
import Timer from '@/components/Timer';
import BlindDisplay from '@/components/BlindDisplay';
import PrizePool from '@/components/PrizePool';
import BuyInsPanel from '@/components/BuyInsPanel';
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
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Poker Clock"
            className="h-24 w-24 rounded-full"
          />
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <h1 className="text-2xl font-medium">Loading Poker Clock...</h1>
        </div>
      </div>
    );
  }

  return (
    <TournamentProvider>
      <Layout>
        {/* Timer - Top Half */}
        <div className="mb-8 h-[45vh]">
          <div className="glass rounded-3xl p-6 md:p-10 w-full h-full flex items-center justify-center shadow-lg">
            <Timer />
          </div>
        </div>

        {/* Bottom Half - Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[35vh]">
          {/* Prize Pool - Left */}
          <div className="h-full">
            <PrizePool />
          </div>

          {/* Blinds - Middle */}
          <div className="h-full flex items-center justify-center">
            <BlindDisplay />
          </div>

          {/* Buy-ins and Rebuys - Right */}
          <div className="h-full">
            <BuyInsPanel />
          </div>
        </div>

        {/* Organizer Panel (Settings) */}
        <OrganizerPanel />
      </Layout>
    </TournamentProvider>
  );
};

export default PokerClock;
