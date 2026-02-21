import { TournamentProvider } from '@/hooks/useTournament';
import TournamentTitle from '@/components/TournamentTitle';
import Timer from '@/components/Timer';
import StartStack from '@/components/StartStack';
import PrizePool from '@/components/PrizePool';
import EntriesPanel from '@/components/EntriesPanel';
import OrganizerPanel from '@/components/OrganizerPanel';

const PokerClock = () => {
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
            <div
              className="glass rounded-3xl p-4 md:p-10 w-full h-full flex items-center justify-center shadow-lg"
              style={{ containerType: 'inline-size' }}
            >
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

            {/* Entries - Right */}
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
