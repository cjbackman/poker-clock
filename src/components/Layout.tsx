import { ReactNode } from 'react';
import TournamentTitle from './TournamentTitle';
import { useTournament } from '@/hooks/useTournament';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { tournament } = useTournament();

  return (
    <div className="min-h-screen w-full flex flex-col bg-background poker-bg">
      {/* Header with title */}
      <header className="w-full py-4 px-6 border-b border-white/10 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <TournamentTitle />
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 container">{children}</main>

      {/* Footer */}
      <footer className="w-full py-3 border-t border-white/10 text-center text-sm text-muted-foreground">
        <p>
          <span className="opacity-60">
            Level {tournament.currentLevelId} of {tournament.settings.blindStructure.levels.length}
          </span>
        </p>
      </footer>
    </div>
  );
};

export default Layout;
