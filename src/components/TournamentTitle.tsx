import { useState, useRef, useEffect, ReactNode } from 'react';
import { useTournament } from '@/hooks/useTournament';
import { Edit, Check } from 'lucide-react';

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
  const { tournament, updateSettings } = useTournament();
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(tournament.settings.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when switching to edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle save title
  const saveTitle = () => {
    if (titleValue.trim()) {
      updateSettings({ title: titleValue.trim() });
    } else {
      // Reset to current title if empty
      setTitleValue(tournament.settings.title);
    }
    setIsEditing(false);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      setTitleValue(tournament.settings.title);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      {isEditing ? (
        <div className="relative w-full max-w-lg">
          <input
            ref={inputRef}
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={saveTitle}
            className="w-full text-2xl sm:text-3xl md:text-4xl font-semibold text-center py-2 px-4 bg-transparent border-b-2 border-primary/20 focus:border-primary focus:outline-none transition-all duration-300"
            maxLength={40}
            aria-label="Tournament Title"
          />
          <button
            onClick={saveTitle}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors duration-300"
            aria-label="Save Title"
          >
            <Check className="h-5 w-5 text-primary" />
          </button>
        </div>
      ) : (
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold italic py-2 flex items-center gap-2 cursor-pointer group text-poker-gold tracking-wide"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          onClick={() => setIsEditing(true)}
        >
          {renderColoredTitle(tournament.settings.title)}
          <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </h1>
      )}
    </div>
  );
};

export default TournamentTitle;
