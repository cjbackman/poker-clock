import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium tracking-wide transition-colors ${
      isActive ? 'text-poker-gold' : 'text-muted-foreground hover:text-poker-gold/80'
    }`;

  return (
    <nav className="flex items-center gap-6">
      <NavLink to="/" className="shrink-0">
        <img src="/logo.png" alt="Home" className="h-8 w-auto" />
      </NavLink>
      <NavLink to="/" end className={linkClass}>
        Home
      </NavLink>
      <NavLink to="/clock" className={linkClass}>
        Poker Clock
      </NavLink>
    </nav>
  );
};

export default Navbar;
