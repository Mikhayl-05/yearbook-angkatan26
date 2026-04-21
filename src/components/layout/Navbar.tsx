// src/components/layout/Navbar.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useMusic } from '@/context/MusicContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/kelas/neutrino', label: 'Neutrino' },
  { href: '/kelas/all-axe', label: 'All Axe' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/quotes', label: 'Quotes Wall' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { isPlaying, currentTrack, setIsMinimized, isMinimized } = useMusic();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [router.pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${
        scrolled
          ? 'bg-charcoal-900/95 backdrop-blur-md border-b border-gold/20 shadow-lg'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 rounded-full border border-gold/60 flex items-center justify-center group-hover:border-gold transition-colors flex-shrink-0">
                <span className="text-gold text-xs font-heading font-bold">26</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-gold font-heading text-[10px] tracking-[0.3em] uppercase">Angkatan</div>
                <div className="text-cream font-display text-sm font-bold -mt-0.5">Wahdah Islamiyah</div>
                <span
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open('https://maps.google.com/?q=Pesantren+Wahdah+Islamiyah+Bonebolango+Gorontalo', '_blank');
                  }}
                  className="text-cream/30 hover:text-gold/70 text-[8px] font-body tracking-wide transition-colors flex items-center gap-1 -mt-0.5 cursor-pointer"
                >
                  📍 MTS Wahdah Islamiyah (Bonebolango)
                </span>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => {
                const isActive = router.pathname === link.href || router.asPath === link.href || router.asPath.startsWith(link.href + '/') || (link.href !== '/' && router.asPath === link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-heading text-xs tracking-[0.2em] uppercase transition-all duration-300 relative group ${
                      isActive ? 'text-gold' : 'text-cream/70 hover:text-gold'
                    }`}
                  >
                    {link.label}
                    <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </Link>
                );
              })}
            </div>

            {/* RIGHT CONTROLS */}
            <div className="flex items-center gap-1.5 sm:gap-3">

              {/* MUSIC TOGGLE BUTTON */}
              <button
                onClick={() => { setIsMinimized(!isMinimized); }}
                className="relative flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border border-gold/30 hover:border-gold/60 transition-all group flex-shrink-0"
                title="Music Player"
              >
                {/* Equalizer animation */}
                <div className="flex items-end gap-0.5 h-4">
                  {[1,2,3].map(i => (
                    <div
                      key={i}
                      className={`w-0.5 bg-gold rounded-full transition-all ${
                        isPlaying ? 'animate-bounce' : 'h-1'
                      }`}
                      style={{
                        height: isPlaying ? undefined : '4px',
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '0.6s',
                      }}
                    />
                  ))}
                </div>
                <span className="text-gold/70 group-hover:text-gold text-xs font-heading tracking-wider hidden sm:block">
                  {isPlaying && currentTrack ? currentTrack.title.slice(0, 12) + '…' : 'Music'}
                </span>
              </button>

              {/* AUTH */}
              <div className="hidden sm:flex items-center gap-2">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link href="/admin" className="text-gold/70 hover:text-gold text-xs font-heading tracking-wider transition-colors flex items-center h-8">
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="text-cream/50 hover:text-red-400 text-xs transition-colors"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="btn-outline-gold text-xs py-1.5 px-4">
                    Login
                  </Link>
                )}
              </div>

              {/* HAMBURGER */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden flex flex-col gap-1.5 p-2 group relative z-[60]"
              >
                <span className={`block w-6 h-px bg-gold transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block w-4 h-px bg-gold transition-all duration-300 ${menuOpen ? 'opacity-0 translate-x-4' : ''}`} />
                <span className={`block w-6 h-px bg-gold transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <div 
        className={`mobile-menu-overlay ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* MOBILE MENU PANEL */}
      <div className={`fixed top-0 right-0 bottom-0 w-72 z-50 transition-transform duration-500 ease-out ${
        menuOpen ? 'translate-x-0' : 'translate-x-full'
      }`} style={{ background: 'rgba(12, 10, 9, 0.98)', borderLeft: '1px solid rgba(201,162,39,0.2)' }}>
        <div className="pt-20 px-6 flex flex-col h-full">
          {/* NAV LINKS */}
          <div className="flex flex-col gap-1">
            {navLinks.map(link => {
              const isActive = router.pathname === link.href || router.asPath === link.href || router.asPath.startsWith(link.href + '/') || (link.href !== '/' && router.asPath === link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`mobile-nav-link font-heading text-sm tracking-[0.15em] uppercase ${
                    isActive
                      ? 'active text-gold'
                      : 'text-cream/70 hover:text-gold'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* DIVIDER */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent my-6" />

          {/* AUTH SECTION */}
          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <div className="text-cream/40 text-xs font-body px-1">
                  Masuk sebagai: <span className="text-cream/70">{user.email}</span>
                </div>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="mobile-nav-link font-heading text-sm tracking-[0.15em] uppercase text-gold/80 hover:text-gold"
                  >
                    ⚙️ Panel Admin
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="mobile-nav-link font-heading text-sm tracking-[0.15em] uppercase text-red-400/70 hover:text-red-400"
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-gold text-xs py-3 text-center"
              >
                Login / Daftar
              </Link>
            )}
          </div>

          {/* FOOTER */}
          <div className="mt-auto pb-8">
            <div className="text-cream/20 text-[10px] font-body text-center">
              Yearbook Angkatan 26 · XVI
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
