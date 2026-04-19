// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { MusicProvider } from '@/context/MusicContext';
import { MusicPlayer } from '@/components/layout/MusicPlayer';
import { AnimatePresence, motion } from 'framer-motion';
import '../styles/globals.css';

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
  initial: { opacity: 0, y: 12 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween',
  ease: [0.16, 1, 0.3, 1],
  duration: 0.35,
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Yearbook Angkatan 26 — MTS Wahdah Islamiyah</title>
        <meta name="description" content="Digital Yearbook Angkatan 26 MTS Pondok Pesantren Wahdah Islamiyah Bonebolango — Neutrino & All Axe 2023-2026" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#C9A227" />
        <meta name="application-name" content="YB-A26" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="YB-A26" />
        {/* OG Tags */}
        <meta property="og:title" content="Yearbook Angkatan 26 — MTS Wahdah Islamiyah Bonebolango" />
        <meta property="og:description" content="Kenangan digital Angkatan 26 MTS Pondok Pesantren Wahdah Islamiyah Bonebolango" />
        <meta property="og:type" content="website" />
        {/* Icons */}
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <AuthProvider>
        <MusicProvider>
          <ScrollProgressBar />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={router.asPath}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Component {...pageProps} />
            </motion.div>
          </AnimatePresence>
          <MusicPlayer />
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

