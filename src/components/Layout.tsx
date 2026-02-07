import { ReactNode } from 'react';
import TournamentTitle from './TournamentTitle';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background poker-bg">
      {/* Header with title */}
      <header className="w-full py-4 px-6 border-b border-white/10 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <TournamentTitle />
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 container">{children}</main>
    </div>
  );
};

export default Layout;
