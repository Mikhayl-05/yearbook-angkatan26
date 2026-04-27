// src/pages/login.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Head from 'next/head';

type AuthMode = 'login' | 'register';

// ── Cloudflare Turnstile (via CDN script, no npm install needed) ──
// Widget renders itself into a div with this ref.
// Returns a token string when solved, or null if not yet solved.
function useTurnstile(siteKey: string | undefined) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load Cloudflare Turnstile script once
  useEffect(() => {
    if (!siteKey) { setLoaded(true); return; } // No site key → skip
    if (document.getElementById('cf-turnstile-script')) { setLoaded(true); return; }

    const script = document.createElement('script');
    script.id = 'cf-turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, [siteKey]);

  // Render widget when script is loaded and container is ready
  useEffect(() => {
    if (!loaded || !siteKey || !containerRef.current) return;
    const win = window as any;
    if (!win.turnstile) return;

    // Clean up old widget if exists
    if (widgetIdRef.current !== null) {
      try { win.turnstile.remove(widgetIdRef.current); } catch { /* */ }
    }

    widgetIdRef.current = win.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'dark',
      callback: (t: string) => setToken(t),
      'expired-callback': () => setToken(null),
      'error-callback': () => setToken(null),
    });
  }, [loaded, siteKey]);

  const reset = useCallback(() => {
    const win = window as any;
    if (win.turnstile && widgetIdRef.current !== null) {
      try { win.turnstile.reset(widgetIdRef.current); } catch { /* */ }
    }
    setToken(null);
  }, []);

  return { containerRef, token, reset };
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  // Turnstile CAPTCHA — hanya aktif jika env var ada
  const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const { containerRef: loginCaptchaRef, token: loginToken, reset: resetLoginCaptcha } = useTurnstile(TURNSTILE_KEY);
  const { containerRef: registerCaptchaRef, token: registerToken, reset: resetRegisterCaptcha } = useTurnstile(TURNSTILE_KEY);

  // Jika tidak ada site key → skip CAPTCHA (backward-compatible)
  const captchaEnabled = !!TURNSTILE_KEY;
  const loginCaptchaOk = !captchaEnabled || !!loginToken;
  const registerCaptchaOk = !captchaEnabled || !!registerToken;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Isi email dan password!'); return; }
    if (!loginCaptchaOk) { toast.error('Selesaikan verifikasi CAPTCHA terlebih dahulu!'); return; }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error('Email atau password salah!');
        resetLoginCaptcha();
      } else {
        toast.success('Selamat datang! ✨');
        router.push((router.query.redirect as string) || '/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error('Isi nama lengkap!'); return; }
    if (!email || !password) { toast.error('Isi email dan password!'); return; }
    if (password.length < 6) { toast.error('Password minimal 6 karakter!'); return; }
    if (password !== confirmPassword) { toast.error('Password tidak cocok!'); return; }
    if (!registerCaptchaOk) { toast.error('Selesaikan verifikasi CAPTCHA terlebih dahulu!'); return; }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, fullName.trim());
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Email sudah terdaftar! Silakan login.');
        } else {
          toast.error(error.message || 'Gagal mendaftar!');
        }
        resetRegisterCaptcha();
      } else {
        toast.success('Akun berhasil dibuat! 🎉 Cek email untuk verifikasi.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Masuk — Yearbook Angkatan 26</title>
      </Head>

      <div className="min-h-screen dark-paper flex items-center justify-center px-4">
        {/* BG DECORATION */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold/3 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-gold/3" />
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
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 text-xs font-heading tracking-wider uppercase rounded-md transition-all duration-300 ${
                  mode === 'login'
                    ? 'bg-gold/20 text-gold shadow-sm border border-gold/30'
                    : 'text-cream/40 hover:text-cream/60'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-2.5 text-xs font-heading tracking-wider uppercase rounded-md transition-all duration-300 ${
                  mode === 'register'
                    ? 'bg-gold/20 text-gold shadow-sm border border-gold/30'
                    : 'text-cream/40 hover:text-cream/60'
                }`}
              >
                Daftar
              </button>
            </div>

            {/* ── LOGIN FORM ─────────────────────────────────── */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                <div>
                  <label className="section-label text-[10px] block mb-2">Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">📧</span>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      required
                      autoComplete="email"
                      className="admin-input pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="section-label text-[10px] block mb-2">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">🔒</span>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="admin-input pl-9"
                    />
                  </div>
                </div>

                {/* CAPTCHA — hanya render jika TURNSTILE_KEY ada */}
                {captchaEnabled && (
                  <div className="flex flex-col items-center gap-1.5">
                    <div ref={loginCaptchaRef} className="cf-turnstile" />
                    {!loginToken && (
                      <p className="text-cream/30 text-[10px] font-body text-center">
                        🛡️ Selesaikan verifikasi di atas untuk melanjutkan
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !loginCaptchaOk}
                  className="w-full btn-gold py-3 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-charcoal-dark border-t-transparent rounded-full animate-spin" />
                      Masuk...
                    </>
                  ) : (
                    'Masuk ke Yearbook'
                  )}
                </button>
              </form>
            )}

            {/* ── REGISTER FORM ──────────────────────────────── */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                <div>
                  <label className="section-label text-[10px] block mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">👤</span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Muhammad Fulan"
                      required
                      autoComplete="name"
                      className="admin-input pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="section-label text-[10px] block mb-2">Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">📧</span>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      required
                      autoComplete="email"
                      className="admin-input pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="section-label text-[10px] block mb-2">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">🔒</span>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="admin-input pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="section-label text-[10px] block mb-2">Konfirmasi Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-sm">🔒</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password"
                      required
                      autoComplete="new-password"
                      className="admin-input pl-9"
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">Password tidak cocok</p>
                  )}
                </div>

                {/* CAPTCHA — hanya render jika TURNSTILE_KEY ada */}
                {captchaEnabled && (
                  <div className="flex flex-col items-center gap-1.5">
                    <div ref={registerCaptchaRef} className="cf-turnstile" />
                    {!registerToken && (
                      <p className="text-cream/30 text-[10px] font-body text-center">
                        🛡️ Selesaikan verifikasi di atas untuk melanjutkan
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !registerCaptchaOk || (confirmPassword !== '' && password !== confirmPassword)}
                  className="w-full btn-gold py-3 text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-charcoal-dark border-t-transparent rounded-full animate-spin" />
                      Mendaftar...
                    </>
                  ) : (
                    'Buat Akun'
                  )}
                </button>
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
