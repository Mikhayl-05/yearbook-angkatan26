// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { MusicProvider } from '@/context/MusicContext';
import { MusicPlayer } from '@/components/layout/MusicPlayer';
import dynamic from 'next/dynamic';
import '../styles/globals.css';

// ── Dynamic import framer-motion — hapus dari initial bundle (~50KB gzip) ──
// Sebelumnya: import static → masuk ke bundle pertama → semua halaman kena
// Sekarang: lazy load setelah hydration → tidak block first render
const AnimatePresence: any = dynamic(
  () => import('framer-motion').then(m => m.AnimatePresence),
  { ssr: false }
);
const MotionDiv: any = dynamic(
  () => import('framer-motion').then(m => m.motion.div as any),
  { ssr: false }
);

function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[999] h-[2px]">
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #8B6914, #C9A227, #F0C040, #C9A227)',
        }}
      />
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -6 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: [0.16, 1, 0.3, 1],
  duration: 0.3, // Sedikit lebih cepat dari sebelumnya (0.35 → 0.3)
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith('/admin');

  useEffect(() => {
    // Unregister service worker aggressively in development to prevent caching loops
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('Stale ServiceWorker unregistered in dev mode.');
        }
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Yearbook Angkatan 26 — MTS Wahdah Islamiyah</title>
        <meta name="description" content="Digital Yearbook Angkatan 26 MTS Pondok Pesantren Wahdah Islamiyah Bonebolango — Neutrino 2023-2026" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Dynamic OG Image handling from pageProps */}
        {pageProps?.ogImageUrl && (
          <>
            <meta property="og:image" content={pageProps.ogImageUrl} />
            <meta property="og:image:secure_url" content={pageProps.ogImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta name="twitter:image" content={pageProps.ogImageUrl} />
          </>
        )}
      </Head>

      <AuthProvider>
        <MusicProvider>
          <ScrollProgressBar />
          <AnimatePresence mode="wait" initial={false}>
            <MotionDiv
              key={router.asPath}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Component {...pageProps} />
            </MotionDiv>
          </AnimatePresence>
          {!isAdmin && <MusicPlayer />}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(28,25,23,0.95)',
                color: '#F5F0E8',
                border: '1px solid rgba(201,162,39,0.4)',
                backdropFilter: 'blur(12px)',
                fontFamily: 'Lato, sans-serif',
              },
            }}
          />
        </MusicProvider>
      </AuthProvider>
    </>
  );
}

