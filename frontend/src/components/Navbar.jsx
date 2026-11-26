import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  PlusCircle,
  Compass,
  User,
  Info,
  ShieldAlert,
  LogOut,
  Home,
} from 'lucide-react';
import Logo from './Logo';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    showToast('You have been logged out.', 'info');
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? 'bg-njia-50 text-njia-800'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" onClick={() => setMobileOpen(false)}>
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <NavLink to="/" end className={navLinkClass}>
            <Home className="h-4 w-4" />
            Home
          </NavLink>
          <NavLink to="/feed" className={navLinkClass}>
            <Compass className="h-4 w-4" />
            Community Feed
          </NavLink>
          <NavLink to="/share" className={navLinkClass}>
            <PlusCircle className="h-4 w-4" />
            Share Update
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/profile" className={navLinkClass}>
              <User className="h-4 w-4" />
              My Profile
            </NavLink>
          )}
          <NavLink to="/about" className={navLinkClass}>
            <Info className="h-4 w-4" />
            About
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Admin
            </NavLink>
          )}
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1.5 pr-3 text-xs font-semibold text-slate-800 hover:bg-slate-100"
              >
                <Avatar name={user?.fullName} src={user?.avatarUrl} size="sm" />
                <span className="max-w-[110px] truncate">{user?.fullName?.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary py-2">
                Log In
              </Link>
              <Link to="/register" className="btn-primary py-2">
                Join Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1.5">
            <NavLink to="/" end onClick={() => setMobileOpen(false)} className={navLinkClass}>
              <Home className="h-4 w-4" />
              Home
            </NavLink>
            <NavLink to="/feed" onClick={() => setMobileOpen(false)} className={navLinkClass}>
              <Compass className="h-4 w-4" />
              Community Feed
            </NavLink>
            <NavLink to="/share" onClick={() => setMobileOpen(false)} className={navLinkClass}>
              <PlusCircle className="h-4 w-4" />
              Share Update
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={navLinkClass}>
                <User className="h-4 w-4" />
                My Profile
              </NavLink>
            )}
            <NavLink to="/about" onClick={() => setMobileOpen(false)} className={navLinkClass}>
              <Info className="h-4 w-4" />
              About
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={navLinkClass}>
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                Admin Moderation
              </NavLink>
            )}
          </nav>

          <div className="mt-4 border-t border-slate-100 pt-4">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <Avatar name={user?.fullName} src={user?.avatarUrl} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                    <p className="text-xs text-slate-500">@{user?.username}</p>
                  </div>
                </Link>
                <button type="button" onClick={handleLogout} className="btn-secondary py-2 text-xs">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary text-center"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
