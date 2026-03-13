import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BookingHomepagePanel from "./BookingHomepagePanel";

export default function BicycleIntroAnimation({ bookings, totalBikes, onCreateBooking }) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 5200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <style>{`
        @keyframes bikeTraverse {
          0% { transform: translateX(-42vw); }
          100% { transform: translateX(125vw); }
        }

        @keyframes wheelRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pedalRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }

        @keyframes flagWave {
          0%, 100% { transform: skewY(0deg) rotate(0deg); }
          25% { transform: skewY(2deg) rotate(1deg); }
          50% { transform: skewY(-3deg) rotate(-1deg); }
          75% { transform: skewY(1deg) rotate(.5deg); }
        }

        @keyframes softFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-240px); }
        }

        @keyframes roadFlow {
          0% { background-position: 0 0; }
          100% { background-position: 300px 0; }
        }

        @keyframes shimmer {
          0%,100% { opacity: .45; }
          50% { opacity: .8; }
        }

        .bike-motion {
          animation: bikeTraverse 4.8s cubic-bezier(.35,.02,.25,1) forwards;
        }

        .bike-float {
          animation: softFloat 1.8s ease-in-out infinite;
        }

        .wheel-spin {
          animation: wheelRotate .7s linear infinite;
          transform-origin: center;
          transform-box: fill-box;
        }

        .pedal-spin {
          animation: pedalRotate 1s linear infinite;
          transform-origin: center;
          transform-box: fill-box;
        }

        .flag-wave {
          animation: flagWave .9s ease-in-out infinite;
          transform-origin: left center;
          transform-box: fill-box;
        }

        .parallax-far {
          animation: drift 18s linear infinite;
        }

        .parallax-mid {
          animation: drift 10s linear infinite;
        }

        .road-dash {
          animation: roadFlow 1s linear infinite;
          background-image: repeating-linear-gradient(
            90deg,
            rgba(255,255,255,.86) 0px,
            rgba(255,255,255,.86) 54px,
            transparent 54px,
            transparent 120px
          );
          background-size: 300px 6px;
        }

        .ambient {
          animation: shimmer 2.6s ease-in-out infinite;
        }
      `}</style>

      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.section
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.015, filter: "blur(8px)" }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#fde68a_0%,_#86efac_32%,_#7dd3fc_62%,_#d9f99d_100%)]"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="ambient absolute left-[10%] top-[8%] h-44 w-44 rounded-full bg-yellow-300/45 blur-3xl" />
              <div className="ambient absolute right-[12%] top-[16%] h-64 w-64 rounded-full bg-orange-200/35 blur-3xl" />
              <div className="ambient absolute bottom-[24%] left-[18%] h-56 w-56 rounded-full bg-lime-300/20 blur-3xl" />

              <div className="absolute left-[8%] top-[10%] h-24 w-24 rounded-full bg-yellow-200/90 shadow-[0_0_120px_rgba(253,224,71,0.85)]" />

              <div className="parallax-far absolute top-[16%] left-0 flex min-w-[150%] gap-16 opacity-70">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-10 w-16 rounded-full bg-white/80 blur-[1px]" />
                    <div className="-ml-4 h-8 w-14 rounded-full bg-white/80 blur-[1px]" />
                  </div>
                ))}
              </div>

              <div className="absolute left-1/2 top-[18%] z-10 -translate-x-1/2 opacity-80">
                <svg width="280" height="110" viewBox="0 0 280 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 74C74 30 132 18 172 44C206 66 231 66 252 52" stroke="#f472b6" strokeWidth="8" strokeLinecap="round" opacity="0.7"/>
                  <path d="M42 80C76 36 134 24 174 50C208 72 233 72 254 58" stroke="#fb7185" strokeWidth="8" strokeLinecap="round" opacity="0.7"/>
                  <path d="M44 86C78 42 136 30 176 56C210 78 235 78 256 64" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" opacity="0.7"/>
                  <path d="M46 92C80 48 138 36 178 62C212 84 237 84 258 70" stroke="#facc15" strokeWidth="8" strokeLinecap="round" opacity="0.7"/>
                  <path d="M48 98C82 54 140 42 180 68C214 90 239 90 260 76" stroke="#4ade80" strokeWidth="8" strokeLinecap="round" opacity="0.7"/>
                </svg>
              </div>

              <div className="absolute left-[6%] top-[22%] opacity-70">
                <svg width="92" height="40" viewBox="0 0 92 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 23C18 16 24 16 28 23" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M28 23C32 16 38 16 42 23" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M44 18C48 11 54 11 58 18" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M58 18C62 11 68 11 72 18" stroke="#334155" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>

              <div className="absolute right-[10%] top-[30%] opacity-80">
                <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path d="M32 48C36 38 44 32 52 34C50 42 42 48 32 48Z" fill="#f59e0b"/>
                    <path d="M52 34C64 28 74 32 80 40C68 42 58 40 52 34Z" fill="#fb7185"/>
                    <path d="M48 42C56 44 62 50 62 58C54 56 48 50 48 42Z" fill="#a3e635"/>
                    <line x1="51" y1="39" x2="40" y2="27" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
                  </g>
                  <g transform="translate(42,6) scale(0.9)">
                    <path d="M32 48C36 38 44 32 52 34C50 42 42 48 32 48Z" fill="#60a5fa"/>
                    <path d="M52 34C64 28 74 32 80 40C68 42 58 40 52 34Z" fill="#f472b6"/>
                    <path d="M48 42C56 44 62 50 62 58C54 56 48 50 48 42Z" fill="#facc15"/>
                    <line x1="51" y1="39" x2="40" y2="27" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
                  </g>
                </svg>
              </div>

              <div className="absolute inset-x-0 bottom-[90px] h-[120px] bg-gradient-to-r from-transparent via-cyan-100/40 to-transparent opacity-70 blur-2xl" />

              <div className="parallax-mid absolute bottom-24 left-0 flex min-w-[190%] items-end gap-12 opacity-95">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="relative flex items-end">
                    <div className="h-28 w-5 rounded-full bg-amber-900/75 shadow-[0_0_20px_rgba(120,53,15,0.18)]" />
                    <div className="absolute bottom-20 -left-8 h-20 w-24 rounded-full bg-emerald-600/80 blur-[1px] shadow-[0_10px_30px_rgba(16,185,129,0.22)]" />
                    <div className="absolute bottom-28 -left-1 h-16 w-20 rounded-full bg-lime-400/75 blur-[1px] shadow-[0_10px_26px_rgba(132,204,22,0.18)]" />
                    <div className="absolute bottom-16 left-3 h-14 w-16 rounded-full bg-green-700/65 blur-[1px]" />
                  </div>
                ))}
              </div>

              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-teal-300/50 via-cyan-200/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-green-900/45 via-emerald-700/10 to-transparent" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col justify-between px-6 py-8 sm:px-10 lg:px-16">
              <div className="pt-4">
                <motion.div
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.7 }}
                  className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.38em] text-cyan-100 backdrop-blur"
                >
                  Premium Ride Booking
                </motion.div>
              </div>

              <div className="relative z-20 max-w-3xl pb-40 sm:pb-44">
                <motion.h1
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.8 }}
                  className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
                >
                  Let the journey start before the booking.
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.8 }}
                  className="mt-5 max-w-xl text-sm leading-6 text-slate-200 sm:text-base"
                >
                  A cinematic bicycle intro with corrected wheel motion, a more realistic bicycle silhouette, and a premium fade into the live booking homepage.
                </motion.p>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-14 z-30 h-[260px] sm:h-[290px]">
                <div className="bike-motion absolute bottom-5 left-0">
                  <div className="bike-float">
                    <svg width="660" height="280" viewBox="0 0 660 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="frameGrad" x1="160" y1="70" x2="410" y2="200" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#7DD3FC" />
                          <stop offset="1" stopColor="#38BDF8" />
                        </linearGradient>
                        <linearGradient id="flagGrad" x1="0" y1="0" x2="150" y2="0" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#67E8F9" />
                          <stop offset="1" stopColor="#22D3EE" />
                        </linearGradient>
                      </defs>

                      <g>
                        <line x1="258" y1="82" x2="258" y2="28" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />
                        <g className="flag-wave">
                          <path d="M263 31C315 10 361 15 420 42C362 66 316 62 263 45V31Z" fill="url(#flagGrad)" />
                          <text x="283" y="42" fill="#082F49" fontSize="20" fontWeight="800" fontFamily="Arial, sans-serif">
                            rideclub868
                          </text>
                        </g>
                      </g>

                      <g className="wheel-spin">
                        <circle cx="180" cy="198" r="58" stroke="#F8FAFC" strokeWidth="7" />
                        <circle cx="180" cy="198" r="6" fill="#F8FAFC" />
                        <line x1="180" y1="140" x2="180" y2="256" stroke="#CBD5E1" strokeWidth="3" />
                        <line x1="122" y1="198" x2="238" y2="198" stroke="#CBD5E1" strokeWidth="3" />
                        <line x1="139" y1="157" x2="221" y2="239" stroke="#CBD5E1" strokeWidth="3" />
                        <line x1="221" y1="157" x2="139" y2="239" stroke="#CBD5E1" strokeWidth="3" />
                      </g>

                      <g className="wheel-spin">
                        <circle cx="410" cy="198" r="58" stroke="#F8FAFC" strokeWidth="7" />
                        <circle cx="410" cy="198" r="6" fill="#F8FAFC" />
                        <line x1="410" y1="140" x2="410" y2="256" stroke="#CBD5E1" strokeWidth="3" />
                        <line x1="352" y1="198" x2="468" y2="198" stroke="#CBD5E1" strokeWidth="3" />
                        <line x1="369" y1="157" x2="451" y2="239" stroke="#CBD5E1" strokeWidth="3" />
                        <line x1="451" y1="157" x2="369" y2="239" stroke="#CBD5E1" strokeWidth="3" />
                      </g>

                      <path d="M180 198L258 126L332 126L292 198H180Z" stroke="url(#frameGrad)" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
                      <path d="M258 126L228 83" stroke="#F8FAFC" strokeWidth="8" strokeLinecap="round" />
                      <path d="M212 83H245" stroke="#F8FAFC" strokeWidth="8" strokeLinecap="round" />
                      <path d="M332 126L370 84" stroke="#F8FAFC" strokeWidth="8" strokeLinecap="round" />
                      <path d="M370 84H430" stroke="#F8FAFC" strokeWidth="8" strokeLinecap="round" />
                      <path d="M332 126L410 198" stroke="#F8FAFC" strokeWidth="8" strokeLinecap="round" />
                      <path d="M258 126L180 198" stroke="#F8FAFC" strokeWidth="8" strokeLinecap="round" />
                      <path d="M292 198L410 198" stroke="#F8FAFC" strokeWidth="8" strokeLinecap="round" />
                      <path d="M300 118L320 78" stroke="#38BDF8" strokeWidth="8" strokeLinecap="round" />
                      <path d="M316 78H347" stroke="#F8FAFC" strokeWidth="8" strokeLinecap="round" />

                      <g className="pedal-spin">
                        <circle cx="292" cy="198" r="14" stroke="#F8FAFC" strokeWidth="5" />
                        <line x1="292" y1="198" x2="313" y2="184" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round" />
                        <line x1="292" y1="198" x2="273" y2="213" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round" />
                        <rect x="311" y="179" width="18" height="6" rx="3" fill="#E2E8F0" />
                        <rect x="256" y="212" width="18" height="6" rx="3" fill="#E2E8F0" />
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 lg:px-16">
                  <div className="h-[8px] rounded-full bg-white/10 backdrop-blur" />
                  <div className="road-dash mt-[-7px] h-[6px]" />
                </div>
              </div>
            </div>
          </motion.section>
        ) : (
          <BookingHomepagePanel
            key="homepage"
            bookings={bookings}
            totalBikes={totalBikes}
            onCreateBooking={onCreateBooking}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
