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

  // Menyiapkan metadata untuk Open Graph
  const domain = 'https://yearbook-neutrino.vercel.app';
  const currentUrl = `${domain}${router.asPath === '/' ? '' : router.asPath}`;
  const title = 'Yearbook Angkatan 26 - Neutrino MTS Wahdah Islamiyah';
  const description = 'Kenangan digital Angkatan 26 - Neutrino MTS Pondok Pesantren Wahdah Islamiyah Bonebolango 2023-2026';
  
  // Mencari gambar yang valid untuk preview.
  let ogImage = `${domain}/icons/icon-512x512.png`;
  if (pageProps?.ogImageUrl) ogImage = pageProps.ogImageUrl;
  else if (pageProps?.neutrinoLogo) ogImage = pageProps.neutrinoLogo;
  
  // Pastikan URL gambar adalah absolute (wajib untuk WhatsApp)
  if (!ogImage.startsWith('http')) {
    ogImage = `${domain}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
  }

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
        <title key="title">{title}</title>
        <meta name="description" content={description} key="description" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* ── OPEN GRAPH (Dinamis & Terpusat) ── */}
        <meta property="og:title" content={title} key="og-title" />
        <meta property="og:description" content={description} key="og-desc" />
        <meta property="og:type" content="website" key="og-type" />
        <meta property="og:url" content={currentUrl} key="og-url" />
        <meta property="og:site_name" content="Yearbook Angkatan 26" key="og-site" />
        <meta property="og:locale" content="id_ID" key="og-locale" />
        
        {/* Gambar wajib absolut untuk WhatsApp & Instagram */}
        <meta property="og:image" itemProp="image" content={ogImage} key="og-image" />
        <meta property="og:image:secure_url" itemProp="image" content={ogImage} key="og-image-secure" />
        <meta property="og:image:type" content="image/png" key="og-image-type" />
        <meta property="og:image:width" content="1200" key="og-image-width" />
        <meta property="og:image:height" content="630" key="og-image-height" />
        
        {/* ── TWITTER CARD ── */}
        <meta name="twitter:card" content="summary_large_image" key="tw-card" />
        <meta name="twitter:title" content={title} key="tw-title" />
        <meta name="twitter:description" content={description} key="tw-desc" />
        <meta name="twitter:image" content={ogImage} key="tw-image" />
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

