import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiry: Date | string;
  variant?: 'hero' | 'inline' | 'compact';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiry, variant = 'hero' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = typeof expiry === 'string' ? new Date(expiry) : expiry;
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [expiry]);

  const Item = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="absolute inset-0 bg-gold/20 blur-xl group-hover:bg-gold/40 transition-all rounded-full" />
        <div className="relative bg-white/5 backdrop-blur-2xl px-4 py-3 rounded-2xl flex flex-col items-center min-w-[70px] lg:min-w-[90px] shadow-2xl shadow-black/10">
          <AnimatePresence mode="popLayout">
            <motion.span 
              key={value}
              initial={{ y: 10, opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: -10, opacity: 0, filter: 'blur(4px)' }}
              className="text-paper text-2xl lg:text-4xl font-serif italic font-bold tracking-tighter tabular-nums"
            >
              {value.toString().padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <span className="text-paper/40 text-[8px] lg:text-[10px] uppercase tracking-[0.3em] font-bold mt-3">{label}</span>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className="flex bg-transparent items-center gap-4">
        <div className="flex items-center gap-2">
           <span className="text-ink text-sm font-bold tracking-tighter tabular-nums">{timeLeft.days.toString().padStart(2, '0')}</span>
           <span className="text-muted text-[8px] uppercase tracking-widest cursor-default">D</span>
        </div>
        <div className="w-1 h-1 bg-gold/30 rounded-full" />
        <div className="flex items-center gap-2">
           <span className="text-ink text-sm font-bold tracking-tighter tabular-nums">{timeLeft.hours.toString().padStart(2, '0')}</span>
           <span className="text-muted text-[8px] uppercase tracking-widest cursor-default">H</span>
        </div>
        <div className="w-1 h-1 bg-gold/30 rounded-full" />
        <div className="flex items-center gap-2">
           <span className="text-ink text-sm font-bold tracking-tighter tabular-nums">{timeLeft.minutes.toString().padStart(2, '0')}</span>
           <span className="text-muted text-[8px] uppercase tracking-widest cursor-default">M</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
      return (
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold">
            <span className="animate-pulse">●</span>
            <span>Ends In:</span>
            <span className="text-ink tabular-nums">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</span>
        </div>
      )
  }

  if (variant === 'button') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative group h-16 w-80"
      >
        <div 
          className="relative h-full w-full flex items-center bg-topbarBg border-none shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden transition-transform duration-500 hover:scale-[1.01] rounded-none cursor-default"
        >
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-[2px] h-full bg-gold animate-pulse" />
          
          <div className="flex w-full items-center">
            {/* Stock Label */}
            <div className="flex flex-col px-6 border-r border-ink/5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink whitespace-nowrap">Limited Stock</span>
              <span className="text-[8px] uppercase tracking-[0.1em] text-gold font-bold">Only 12 items left</span>
            </div>

            {/* Timer Section */}
            <div className="flex flex-1 items-center justify-around px-2">
              <div className="flex flex-col items-center">
                <span className="font-serif italic text-xl text-ink leading-tight tabular-nums">{timeLeft.days}</span>
                <span className="text-[6px] uppercase tracking-widest font-bold text-ink/30">D</span>
              </div>
              <span className="text-ink/10 text-xs">:</span>
              <div className="flex flex-col items-center">
                <span className="font-serif italic text-xl text-ink leading-tight tabular-nums">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="text-[6px] uppercase tracking-widest font-bold text-ink/30">H</span>
              </div>
              <span className="text-ink/10 text-xs">:</span>
              <div className="flex flex-col items-center">
                <span className="font-serif italic text-xl text-ink leading-tight tabular-nums">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="text-[6px] uppercase tracking-widest font-bold text-ink/30">M</span>
              </div>
              <span className="text-ink/10 text-xs">:</span>
              <div className="flex flex-col items-center">
                <span className="font-serif italic text-xl text-gold leading-tight tabular-nums animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="text-[6px] uppercase tracking-widest font-bold text-gold/40">S</span>
              </div>
            </div>
          </div>
          
          {/* Subtle Shine */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 lg:gap-8 py-6">
      <Item value={timeLeft.days} label="Days" />
      <div className="h-6 w-[1px] bg-white/10 mt-[-20px]" />
      <Item value={timeLeft.hours} label="Hours" />
      <div className="h-6 w-[1px] bg-white/10 mt-[-20px]" />
      <Item value={timeLeft.minutes} label="Mins" />
      <div className="h-6 w-[1px] bg-white/10 mt-[-20px]" />
      <Item value={timeLeft.seconds} label="Secs" />
    </div>
  );
};

