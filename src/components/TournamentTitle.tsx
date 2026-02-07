import { ReactNode } from 'react';
import { useTournament } from '@/hooks/useTournament';

const suitStyles: Record<string, { className: string; style?: React.CSSProperties }> = {
  '♣': {
    className: 'text-poker-black',
    style: {
      textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
    },
  },
  '♠': {
    className: 'text-poker-black',
    style: {
      textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
    },
  },
  '♥': {
    className: 'text-poker-red',
    style: {
      textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
    },
  },
  '♦': {
    className: 'text-poker-red',
    style: {
      textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
    },
  },
};

const suitPattern = /([♣♠♥♦])/g;

const renderColoredTitle = (title: string): ReactNode[] => {
  const parts = title.split(suitPattern);
  return parts.map((part, i) => {
    const suit = suitStyles[part];
    if (suit) {
      return (
        <span key={i} className={suit.className} style={suit.style}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const TournamentTitle = () => {
  const { tournament } = useTournament();

  return (
    <div className="flex items-center justify-center">
      <h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold italic py-2 text-poker-gold tracking-wide text-center"
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      >
        {renderColoredTitle(tournament.settings.title)}
      </h1>
    </div>
  );
};

export default TournamentTitle;
