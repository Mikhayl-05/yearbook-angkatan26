// src/components/ui/CountdownTimer.tsx
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

const getTimeLeft = (target: Date): TimeLeft => {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
};

// Komponen utama
const CountdownTimerComponent = ({ targetDate }: { targetDate: Date }) => {
  // Gunakan state awal null atau objek kosong untuk menghindari perbedaan angka saat hydration
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Set waktu pertama kali saat sudah di browser
    setTime(getTimeLeft(new Date(targetDate)));
    
    const id = setInterval(() => {
      setTime(getTimeLeft(new Date(targetDate)));
    }, 1000);
    
    return () => clearInterval(id);
  }, [targetDate]);

  // Jika belum di-mount (masih proses render server), tampilkan loading atau kosong agar tidak error
  if (!time) return <div className="min-h-[200px]" />;

  const units = [
    { label: 'Hari',   value: time.days },
    { label: 'Jam',    value: time.hours },
    { label: 'Menit',  value: time.minutes },
    { label: 'Detik',  value: time.seconds },
  ];

  return (
    <div className="text-center">
      <h2 className="section-title text-gold mb-2">Hampir Lulus!</h2>
      <p className="text-cream/50 font-body text-sm mb-8 md:mb-10">
        Hitung mundur menuju hari kelulusan Angkatan 26
      </p>

      <div className="flex justify-center gap-2 sm:gap-3 md:gap-6 lg:gap-8">
        {units.map(({ label, value }) => (
          <div key={label} className="card-dark px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 min-w-[60px] sm:min-w-[70px] md:min-w-[90px] text-center corner-ornament overflow-visible">
            <div
              className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gold-gradient tabular-nums leading-none overflow-visible"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {String(value).padStart(2, '0')}
            </div>
            <div className="section-label text-[8px] sm:text-[9px] md:text-[10px] mt-2 md:mt-3">{label}</div>
          </div>
        ))}
      </div>

      <p className="mt-6 md:mt-8 font-script text-gold/60 text-lg md:text-xl px-4">
        &ldquo;Shaped by time, brought together by a shared purpose.&rdquo;
      </p>
    </div>
  );
};

// Bungkus dengan dynamic import agar HANYA jalan di browser (Client Side)
export default dynamic(() => Promise.resolve(CountdownTimerComponent), { ssr: false });