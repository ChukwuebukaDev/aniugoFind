import { motion, AnimatePresence } from "framer-motion";
import { Wrench, X, Calendar, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function MaintenanceNotice() {
  const [visible, setVisible] = useState(true);

  // Maintenance starts May 21, 2026 (Lagos timezone UTC+1)
  const maintenanceDate = new Date("2026-05-21T00:00:00+01:00");

  const getTimeRemaining = () => {
    const now = Date.now();
    const diff = maintenanceDate.getTime() - now;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, total: 0 };

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      total: diff,
    };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  if (!visible || timeLeft.total <= 0) return null;

  const { days, hours, minutes } = timeLeft;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{
          duration: 0.5,
          ease: [0.23, 1, 0.32, 1],
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        className="fixed top-5 left-1/2 z-[9999]
                   -translate-x-1/2
                   w-[calc(100%-2rem)] max-w-2xl
                   mx-auto"
      >
        {/* Main container with solid background for readability */}
        <div
          className="relative overflow-hidden rounded-2xl
                      bg-gray-900/95 backdrop-blur-xl
                      border border-gray-700/50
                      shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]
                      hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)]
                      transition-all duration-500"
        >
          {/* Premium glow effects - subtle, not interfering with text */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />

          {/* Top accent line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          <div className="relative p-5 md:p-6">
            {/* Header section */}
            <div className="flex items-start gap-4">
              {/* Icon container */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="relative shrink-0"
              >
                <div
                  className="relative flex h-12 w-12 md:h-14 md:w-14
                              items-center justify-center
                              rounded-xl bg-gradient-to-br
                              from-amber-400/20 to-amber-500/10
                              border border-amber-400/30
                              shadow-[0_8px_20px_-8px_rgba(245,158,11,0.2)]"
                >
                  <Wrench className="text-amber-400" size={22} />
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base md:text-lg font-bold text-white">
                    Scheduled System Upgrade
                  </h3>

                  {/* Days badge */}
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="relative inline-flex items-center px-3 py-1
                             rounded-full
                             bg-amber-500/20
                             border border-amber-400/40
                             text-xs font-semibold text-amber-300"
                  >
                    <Calendar size={12} className="mr-1" />
                    {days} day{days !== 1 ? "s" : ""} left
                  </motion.span>
                </div>

                <p className="mt-2 text-sm md:text-base text-gray-200 leading-relaxed">
                  We're performing a major system upgrade to enhance
                  performance, security, and user experience. During this time,
                  some services may be temporarily unavailable.
                </p>

                {/* Countdown timer */}
                {(hours > 0 || minutes > 0) && days <= 3 && (
                  <div
                    className="mt-3 flex items-center gap-4
                                pt-3 border-t border-gray-700/50"
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-400" />
                      <span className="text-xs text-gray-400">
                        Exact timing:
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-mono font-bold text-amber-400">
                          {hours.toString().padStart(2, "0")}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase">
                          hrs
                        </span>
                      </div>
                      <span className="text-gray-600 text-sm">:</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-mono font-bold text-amber-400">
                          {minutes.toString().padStart(2, "0")}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase">
                          min
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info note */}
                <div
                  className="mt-3 flex items-start gap-2
                              text-[11px] md:text-xs text-gray-400"
                >
                  <AlertCircle
                    size={12}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />
                  <p>
                    Estimated downtime: 2-4 hours • We'll notify you when
                    services are restored
                  </p>
                </div>
              </div>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVisible(false)}
                className="shrink-0 rounded-lg p-2
                         text-gray-400 hover:text-white
                         bg-gray-800/0 hover:bg-gray-800/50
                         transition-all duration-300"
              >
                <X size={18} />
              </motion.button>
            </div>
          </div>

          {/* Bottom subtle accent */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-700/30 to-transparent" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
