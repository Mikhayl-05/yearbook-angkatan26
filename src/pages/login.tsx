// src/pages/login.tsx
// Fix: register button bug (captcha token timing), improved UX
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Head from 'next/head';

type AuthMode = 'login' | 'register';

// ── Cloudflare Turnstile (CDN, no npm needed) ─────────────────────
// Uses global callback approach — more reliable than ref-based rendering
// because it doesn't depend on DOM timing.
const CALLBACK_PREFIX = '__ts_cb_';

function TurnstileWidget({ siteKey, onVerify }: { siteKey: string; onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const cbName = useRef(`${CALLBACK_PREFIX}${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    // Register global callback
    (window as any)[cbName.current] = onVerify;

    const renderWidget = () => {
      const win = window as any;
      if (!containerRef.current || !win.turnstile) return;
      if (widgetIdRef.current !== null) return; // already rendered

      widgetIdRef.current = win.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        callback: cbName.current,
        'expired-callback': () => onVerify(''),
        'error-callback': () => onVerify(''),
      });
    };

    // Script might already be loaded
    if ((window as any).turnstile) {
      renderWidget();
    } else if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else {
      // Script tag exists but not yet loaded — poll
      const timer = setInterval(() => {
        if ((window as any).turnstile) { clearInterval(timer); renderWidget(); }
      }, 200);
      return () => clearInterval(timer);
    }

    return () => {
      delete (window as any)[cbName.current];
      const win = window as any;
      if (win.turnstile && widgetIdRef.current !== null) {
        try { win.turnstile.remove(widgetIdRef.current); } catch { /* */ }
        widgetIdRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  return <div ref={containerRef} />;
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginToken, setLoginToken] = useState('');
  const [registerToken, setRegisterToken] = useState('');
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const captchaEnabled = !!TURNSTILE_KEY;

  // Reset tokens when switching mode
  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setEmail(''); setPassword(''); setConfirmPassword(''); setFullName('');
    setLoginToken(''); setRegisterToken('');
  };

  // ── VALIDATION ────────────────────────────────────────────────────
  const loginReady =
    email.trim().length > 0 &&
    password.length >= 1 &&
    (!captchaEnabled || loginToken.length > 0) &&
    !loading;

  const registerReady =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    confirmPassword === password &&
    (!captchaEnabled || registerToken.length > 0) &&
    !loading;

  // ── HANDLERS ─────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Isi email dan password!'); return; }
    if (captchaEnabled && !loginToken) { toast.error('Selesaikan verifikasi CAPTCHA!'); return; }
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error('Email atau password salah!');
        setLoginToken(''); // reset captcha on fail
      } else {
        toast.success('Selamat datang! ✨');
        router.push((router.query.redirect as string) || '/');
      }
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error('Isi nama lengkap!'); return; }
    if (!email || !password) { toast.error('Isi email dan password!'); return; }
    if (password.length < 6) { toast.error('Password minimal 6 karakter!'); return; }
    if (password !== confirmPassword) { toast.error('Password tidak cocok!'); return; }
    if (captchaEnabled && !registerToken) { toast.error('Selesaikan verifikasi CAPTCHA!'); return; }
    setLoading(true);
    try {
      const { error } = await signUp(email, password, fullName.trim());
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Email sudah terdaftar! Silakan login.');
        } else {
          toast.error(error.message || 'Gagal mendaftar!');
        }
        setRegisterToken('');
      } else {
        toast.success('Akun berhasil dibuat! 🎉 Cek email untuk verifikasi.');
        handleModeSwitch('login');
      }
    } finally { setLoading(false); }
  };

  return (
    <>
      <Head>
        <title>Masuk — Yearbook Angkatan 26</title>
      </Head>

      <div className="min-h-screen dark-paper flex items-center justify-center px-4 py-12">
        {/* BG DECORATION */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold/3 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold/5" />
        </div>

        <div className="relative w-full max-w-md">
          {/* CARD */}
          <div className="card-dark p-8 md:p-10 corner-ornament" style={{ background: 'rgba(20, 18, 16, 0.9)' }}>
            {/* LOGO */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full border-2 border-gold bg-gold/10 flex flex-col items-center justify-center mx-auto mb-4 shadow-gold">
                <span className="text-gold font-heading font-bold text-xl">26</span>
              </div>
              <h1 className="font-display font-bold text-cream text-2xl mb-1">
                {mode === 'login' ? 'Masuk ke Yearbook' : 'Daftar Akun Baru'}
              </h1>
              <p className="text-cream/40 text-xs font-body">Angkatan 26 · Wahdah Islamiyah</p>
            </div>

            {/* MODE TABS */}
            <div className="flex mb-6 bg-charcoal-mid/40 rounded-lg p-1">
              {(['login', 'register'] as AuthMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => handleModeSwitch(m)}
                  className={`flex-1 py-2.5 text-xs font-heading tracking-wider uppercase rounded-md transition-all duration-300 ${
                    mode === m
                      ? 'bg-gold/20 text-gold shadow-sm border border-gold/30'
                      : 'text-cream/40 hover:text-cream/60'
                  }`}
                >
                  {m === 'login' ? 'Masuk' : 'Daftar'}
                </button>
              ))}
            </div>

            {/* ── LOGIN FORM ─────────────────────────── */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                <div>
                  <label className="section-label text-[10px] block mb-2">Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">📧</span>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="email@contoh.com" required autoComplete="email"
                      className="admin-input pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="section-label text-[10px] block mb-2">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">🔒</span>
                    <input
                      type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required autoComplete="current-password"
                      className="admin-input pl-9"
                    />
                  </div>
                </div>

                {captchaEnabled && TURNSTILE_KEY && (
                  <div className="flex flex-col items-center">
                    <TurnstileWidget siteKey={TURNSTILE_KEY} onVerify={setLoginToken} />
                    {!loginToken && <p className="text-cream/30 text-[10px] text-center mt-1">🛡️ Verifikasi keamanan diperlukan</p>}
                  </div>
                )}

                <button
                  type="submit" disabled={!loginReady}
                  className="w-full btn-gold py-3 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-charcoal-dark border-t-transparent rounded-full animate-spin" /> Masuk...</>
                    : 'Masuk ke Yearbook'
                  }
                </button>
              </form>
            )}

            {/* ── REGISTER FORM ──────────────────────── */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                <div>
                  <label className="section-label text-[10px] block mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">👤</span>
                    <input
                      type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Muhammad Fulan" required autoComplete="name"
                      className="admin-input pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="section-label text-[10px] block mb-2">Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">📧</span>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="email@contoh.com" required autoComplete="email"
                      className="admin-input pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="section-label text-[10px] block mb-2">Password <span className="text-cream/30">(min. 6 karakter)</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">🔒</span>
                    <input
                      type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter" required minLength={6}
                      autoComplete="new-password" className="admin-input pl-9"
                    />
                  </div>
                  {/* Inline password strength hint */}
                  {password.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`flex-1 h-0.5 rounded-full transition-colors ${
                          i < Math.min(Math.floor(password.length / 2), 5)
                            ? password.length >= 8 ? 'bg-green-500' : 'bg-gold'
                            : 'bg-gold/15'
                        }`} />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="section-label text-[10px] block mb-2">Konfirmasi Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">🔒</span>
                    <input
                      type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password" required autoComplete="new-password"
                      className="admin-input pl-9"
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <span>⚠️</span> Password tidak cocok
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && password.length >= 6 && (
                    <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                      <span>✓</span> Password cocok
                    </p>
                  )}
                </div>

                {captchaEnabled && TURNSTILE_KEY && (
                  <div className="flex flex-col items-center">
                    <TurnstileWidget siteKey={TURNSTILE_KEY} onVerify={setRegisterToken} />
                    {!registerToken && <p className="text-cream/30 text-[10px] text-center mt-1">🛡️ Verifikasi keamanan diperlukan</p>}
                  </div>
                )}

                <button
                  type="submit" disabled={!registerReady}
                  className="w-full btn-gold py-3 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-charcoal-dark border-t-transparent rounded-full animate-spin" /> Mendaftar...</>
                    : 'Buat Akun'
                  }
                </button>

                {/* Helper: why button is disabled */}
                {!registerReady && !loading && (
                  <p className="text-cream/25 text-[10px] text-center font-body">
                    {!fullName.trim() ? 'Isi nama lengkap' :
                     !email ? 'Isi email' :
                     password.length < 6 ? 'Password minimal 6 karakter' :
                     confirmPassword !== password ? 'Konfirmasi password harus sama' :
                     captchaEnabled && !registerToken ? 'Selesaikan verifikasi CAPTCHA' :
                     'Lengkapi semua field'}
                  </p>
                )}
              </form>
            )}

            <div className="divider-gold mt-6 mb-4" />
            <p className="text-center text-cream/30 text-[10px] font-body">
              Untuk santri & alumni Angkatan 26 Wahdah Islamiyah
            </p>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-cream/30 hover:text-gold transition-colors text-xs font-heading tracking-wider">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
