import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBooking, getAvailability } from "../lib/api";
import {
  DEFAULT_TOTAL_BIKES,
  MONTH_NAMES,
  WEEK_DAYS,
  formatDateLabel,
  formatDateValue,
  getCalendarDays,
} from "../lib/bookingData";

function BookingDayCell({ day, isSelected, availability, onSelect }) {
  const dateKey = formatDateValue(day);
  const isBooked = availability.isFullyBooked;

  return (
    <button
      type="button"
      onClick={() => {
        if (!isBooked) {
          onSelect(dateKey);
        }
      }}
      disabled={isBooked}
      className={[
        "min-h-[7.25rem] rounded-3xl border p-3 text-left transition",
        isBooked
          ? "cursor-not-allowed border-red-200 bg-red-50/90"
          : isSelected
            ? "border-emerald-400 bg-emerald-100/80 shadow-lg shadow-emerald-200/60"
            : "border-white/40 bg-white/70 hover:bg-white",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-sm font-semibold text-slate-800 shadow-sm">
          {day.getDate()}
        </span>
      </div>

      <div className="mt-3 flex min-h-[4.2rem] items-center justify-center">
        {isBooked ? (
          <div className="flex w-full max-w-[4.75rem] flex-col items-center gap-1">
            <div className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white">
              Booked
            </div>
            <svg
              width="34"
              height="22"
              viewBox="0 0 68 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="15" cy="31" r="9" stroke="#0F172A" strokeWidth="3" />
              <circle cx="52" cy="31" r="9" stroke="#0F172A" strokeWidth="3" />
              <path
                d="M15 31L27 19H39L32 31H15Z"
                stroke="#0F172A"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M27 19L23 13H31" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
              <path d="M39 19L52 31" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
              <path d="M32 31H52" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        ) : (
          <div className="h-6" />
        )}
      </div>
    </button>
  );
}

export default function BookingHomepagePanel() {
  const today = useMemo(() => {
    const nextToday = new Date();
    nextToday.setHours(0, 0, 0, 0);
    return nextToday;
  }, []);

  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [totalBikes, setTotalBikes] = useState(DEFAULT_TOTAL_BIKES);
  const [availabilityByDate, setAvailabilityByDate] = useState({});
  const [selectedRentalDate, setSelectedRentalDate] = useState(() => formatDateValue(today));
  const [activeMonth, setActiveMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [pickupSlot, setPickupSlot] = useState("8:00 AM");

  const calendarDays = useMemo(() => getCalendarDays(activeMonth), [activeMonth]);
  const monthValue = `${activeMonth.getFullYear()}-${String(activeMonth.getMonth() + 1).padStart(2, "0")}`;
  const quantityNumber = Number(quantity || 0);

  useEffect(() => {
    let ignore = false;

    async function loadAvailability() {
      setLoadingAvailability(true);

      try {
        const payload = await getAvailability(monthValue);

        if (ignore) {
          return;
        }

        setTotalBikes(payload.totalBikes);
        setAvailabilityByDate(payload.availabilityByDate || {});
        setBookingError("");
      } catch (error) {
        if (!ignore) {
          setBookingError(error.message || "Unable to load calendar availability.");
        }
      } finally {
        if (!ignore) {
          setLoadingAvailability(false);
        }
      }
    }

    loadAvailability();

    return () => {
      ignore = true;
    };
  }, [monthValue]);

  function getAvailabilityForDate(dateValue) {
    return (
      availabilityByDate[dateValue] || {
        availableBikes: totalBikes,
        reservedBikes: 0,
        isFullyBooked: totalBikes === 0,
      }
    );
  }

  const selectedDayAvailability = getAvailabilityForDate(selectedRentalDate);
  const hasEnoughCapacity =
    Number.isFinite(quantityNumber) &&
    quantityNumber > 0 &&
    quantityNumber <= selectedDayAvailability.availableBikes;

  async function handleCreateBookingRequest() {
    if (!email.trim() || !phone.trim()) {
      setBookingError("Please enter your email address and phone number.");
      return;
    }

    if (!hasEnoughCapacity) {
      setBookingError("That day does not have enough bikes left for this booking quantity.");
      return;
    }

    try {
      await createBooking({
        rentalDate: selectedRentalDate,
        bicycleType: "Bicycle Rental",
        email: email.trim(),
        phone: phone.trim(),
        quantity: quantityNumber,
        pickupSlot,
      });

      const refreshedAvailability = await getAvailability(monthValue);
      setTotalBikes(refreshedAvailability.totalBikes);
      setAvailabilityByDate(refreshedAvailability.availabilityByDate || {});
      setBookingError("");
      setShowBookingSuccess(true);
      setEmail("");
      setPhone("");
      setQuantity("1");
      setPickupSlot("8:00 AM");
    } catch (error) {
      setBookingError(error.message || "Unable to create booking.");
    }
  }

  return (
    <motion.section
      key="homepage"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7_0%,_#fde68a_18%,_#a7f3d0_42%,_#7dd3fc_74%,_#ecfccb_100%)]"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[10%] h-56 w-56 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="absolute right-[8%] top-[14%] h-64 w-64 rounded-full bg-orange-200/20 blur-3xl" />
        <div className="absolute bottom-[18%] left-[20%] h-56 w-56 rounded-full bg-lime-300/15 blur-3xl" />
        <div className="absolute left-[6%] top-[9%] h-24 w-24 rounded-full bg-yellow-200/85 shadow-[0_0_120px_rgba(253,224,71,0.8)]" />

        <div className="absolute right-[8%] top-[18%] opacity-70">
          <svg width="300" height="118" viewBox="0 0 300 118" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M44 80C80 34 142 20 186 48C224 72 252 72 276 56" stroke="#f472b6" strokeWidth="8" strokeLinecap="round" opacity="0.65"/>
            <path d="M46 86C82 40 144 26 188 54C226 78 254 78 278 62" stroke="#fb7185" strokeWidth="8" strokeLinecap="round" opacity="0.65"/>
            <path d="M48 92C84 46 146 32 190 60C228 84 256 84 280 68" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" opacity="0.65"/>
            <path d="M50 98C86 52 148 38 192 66C230 90 258 90 282 74" stroke="#facc15" strokeWidth="8" strokeLinecap="round" opacity="0.65"/>
            <path d="M52 104C88 58 150 44 194 72C232 96 260 96 284 80" stroke="#4ade80" strokeWidth="8" strokeLinecap="round" opacity="0.65"/>
          </svg>
        </div>

        <div className="absolute left-[3%] bottom-[120px] h-[140px] w-[42%] rounded-tr-[120px] bg-gradient-to-r from-amber-200/70 via-yellow-100/30 to-transparent blur-[2px] opacity-70" />
        <div className="absolute right-0 bottom-0 h-[180px] w-[55%] rounded-tl-[180px] bg-gradient-to-l from-cyan-200/80 via-sky-100/35 to-transparent opacity-85" />
        <div className="absolute right-[10%] bottom-[96px] h-[56px] w-[44%] rounded-full bg-white/30 blur-2xl opacity-80" />

        <div className="absolute left-0 bottom-24 w-full opacity-95">
          <svg width="1600" height="210" viewBox="0 0 1600 210" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 150C90 138 150 122 210 118C286 112 360 152 424 154C492 156 544 126 608 120C702 112 768 152 854 154C946 156 1016 126 1086 122C1166 118 1238 156 1320 160C1428 164 1502 140 1600 126V210H0V150Z" fill="#86efac" fillOpacity="0.95"/>
            <path d="M0 166C88 156 164 136 240 142C314 148 376 178 452 180C544 184 620 148 706 146C814 144 880 182 980 184C1080 186 1142 152 1232 150C1340 148 1450 176 1600 156V210H0V166Z" fill="#22c55e" fillOpacity="0.7"/>
          </svg>
        </div>

        <div className="absolute left-0 bottom-[70px] w-full opacity-95">
          <svg width="1600" height="210" viewBox="0 0 1600 210" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <g opacity="0.95">
              <g transform="translate(80,22)">
                <rect x="38" y="86" width="10" height="80" rx="5" fill="#7c3f10"/>
                <ellipse cx="44" cy="70" rx="34" ry="22" fill="#16a34a"/>
                <ellipse cx="22" cy="84" rx="24" ry="18" fill="#22c55e"/>
                <ellipse cx="68" cy="86" rx="26" ry="18" fill="#15803d"/>
              </g>
              <g transform="translate(250,8) scale(1.15)">
                <rect x="38" y="86" width="10" height="90" rx="5" fill="#7c3f10"/>
                <ellipse cx="44" cy="66" rx="38" ry="24" fill="#15803d"/>
                <ellipse cx="20" cy="82" rx="26" ry="18" fill="#22c55e"/>
                <ellipse cx="72" cy="84" rx="28" ry="18" fill="#16a34a"/>
              </g>
              <g transform="translate(460,20) scale(0.95)">
                <rect x="38" y="86" width="10" height="76" rx="5" fill="#7c3f10"/>
                <ellipse cx="44" cy="70" rx="34" ry="22" fill="#16a34a"/>
                <ellipse cx="22" cy="84" rx="24" ry="18" fill="#4ade80"/>
                <ellipse cx="68" cy="86" rx="26" ry="18" fill="#15803d"/>
              </g>
              <g transform="translate(1180,16) scale(1.05)">
                <rect x="38" y="86" width="10" height="84" rx="5" fill="#7c3f10"/>
                <ellipse cx="44" cy="68" rx="36" ry="24" fill="#15803d"/>
                <ellipse cx="20" cy="82" rx="26" ry="18" fill="#22c55e"/>
                <ellipse cx="72" cy="84" rx="28" ry="18" fill="#4ade80"/>
              </g>
              <g transform="translate(1380,30) scale(0.9)">
                <rect x="38" y="86" width="10" height="72" rx="5" fill="#7c3f10"/>
                <ellipse cx="44" cy="70" rx="34" ry="22" fill="#16a34a"/>
                <ellipse cx="22" cy="84" rx="24" ry="18" fill="#22c55e"/>
                <ellipse cx="68" cy="86" rx="26" ry="18" fill="#15803d"/>
              </g>
            </g>
          </svg>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-green-900/30 via-emerald-300/10 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between rounded-full border border-white/20 bg-white/35 px-5 py-3 backdrop-blur-xl">
          <div>
            <div className="text-lg font-semibold tracking-wide text-slate-800">rideclub868</div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-700">Bicycle Rentals</div>
          </div>
          <div className="rounded-full border border-emerald-700/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            {totalBikes} bikes total
          </div>
        </header>

        <main className="flex flex-1 items-start py-10 lg:py-14">
          <section className="w-full max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="inline-flex rounded-full border border-white/30 bg-white/40 px-4 py-1.5 text-xs uppercase tracking-[0.34em] text-emerald-700"
            >
              Reserve - Ride - Repeat
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-slate-800 sm:text-6xl"
            >
              Premium bicycle rentals with a smoother booking experience.
            </motion.h2>
            <motion.section
              id="booking"
              initial={{ opacity: 0, scale: 0.97, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.8 }}
              className="mt-8 w-full max-w-5xl rounded-[2rem] border border-white/30 bg-white/50 p-5 shadow-2xl shadow-emerald-200/40 backdrop-blur-2xl sm:p-6 lg:p-7"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-800">Book Your Ride</div>
                  <div className="text-sm text-slate-600">Select date, quantity, and contact details</div>
                </div>
                <div className="rounded-full border border-emerald-600/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700">
                  {selectedDayAvailability.availableBikes} bikes left on selected day
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.45fr_.95fr]">
                <div className="rounded-[1.75rem] border border-white/35 bg-white/45 p-4 shadow-lg shadow-emerald-100/30 backdrop-blur-xl sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.28em] text-emerald-700">Rental Calendar</div>
                      <div className="mt-1 text-2xl font-semibold text-slate-800">
                        {MONTH_NAMES[activeMonth.getMonth()]} {activeMonth.getFullYear()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMonth(
                            (currentMonth) =>
                              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                          )
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-700/10 bg-white/70 text-xl text-slate-700 transition hover:bg-white"
                        aria-label="Previous month"
                      >
                        &#8592;
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMonth(
                            (currentMonth) =>
                              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                          )
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-700/10 bg-white/70 text-xl text-slate-700 transition hover:bg-white"
                        aria-label="Next month"
                      >
                        &#8594;
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-7 gap-2 text-center">
                    {WEEK_DAYS.map((weekDay) => (
                      <div
                        key={weekDay}
                        className="pb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
                      >
                        {weekDay}
                      </div>
                    ))}

                    {calendarDays.map((day, index) => {
                      if (!day) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="min-h-[7.25rem] rounded-3xl border border-transparent"
                          />
                        );
                      }

                      const dateKey = formatDateValue(day);
                      const availability = getAvailabilityForDate(dateKey);

                      return (
                        <BookingDayCell
                          key={dateKey}
                          day={day}
                          isSelected={selectedRentalDate === dateKey}
                          availability={availability}
                          onSelect={setSelectedRentalDate}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-700">Rental Date</span>
                    <input
                      type="date"
                      value={selectedRentalDate}
                      readOnly
                      className="w-full rounded-2xl border border-emerald-700/10 bg-white/75 px-4 py-3 text-sm text-slate-800 outline-none ring-0"
                    />
                  </label>

                  <div className="rounded-2xl border border-emerald-700/10 bg-white/65 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-emerald-700">Selected Ride Day</div>
                    <div className="mt-2 text-sm font-medium text-slate-800">
                      {formatDateLabel(selectedRentalDate)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-700/10 bg-white/75 px-4 py-3">
                    <div className="mb-2 block text-sm text-slate-700">Bicycles Available</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {selectedDayAvailability.availableBikes}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {selectedDayAvailability.availableBikes === 1 ? "Bike left for this day" : "Bikes left for this day"}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-700">Email Address</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-2xl border border-emerald-700/10 bg-white/75 px-4 py-3 text-sm text-slate-800 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-700">Phone Number</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="(868) 555-0123"
                        className="w-full rounded-2xl border border-emerald-700/10 bg-white/75 px-4 py-3 text-sm text-slate-800 outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-700">Quantity</span>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        className="w-full rounded-2xl border border-emerald-700/10 bg-white/75 px-4 py-3 text-sm text-slate-800 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-700">Pickup Slot</span>
                      <select
                        value={pickupSlot}
                        onChange={(event) => setPickupSlot(event.target.value)}
                        className="w-full rounded-2xl border border-emerald-700/10 bg-white/75 px-4 py-3 text-sm text-slate-800 outline-none"
                      >
                        <option>8:00 AM</option>
                        <option>10:00 AM</option>
                        <option>1:00 PM</option>
                        <option>4:00 PM</option>
                      </select>
                    </label>
                  </div>

                  <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700">
                    Days only flip to booked when all {totalBikes} bikes are already used for that date.
                  </div>

                  {bookingError ? (
                    <div className="rounded-2xl border border-red-200 bg-white/80 px-4 py-3 text-sm text-red-700">
                      {bookingError}
                    </div>
                  ) : null}

                  {loadingAvailability ? (
                    <div className="rounded-2xl border border-emerald-700/10 bg-white/80 px-4 py-3 text-sm text-slate-600">
                      Loading current availability...
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleCreateBookingRequest}
                    disabled={!hasEnoughCapacity || loadingAvailability}
                    className="w-full rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-emerald-200"
                  >
                    Make Booking
                  </button>
                </div>
              </div>
            </motion.section>
          </section>
        </main>

        <AnimatePresence>
          {showBookingSuccess ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-6 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full max-w-md rounded-[2rem] border border-white/30 bg-white/85 p-6 text-center shadow-2xl shadow-emerald-200/50 backdrop-blur-2xl"
              >
                <div className="text-xs uppercase tracking-[0.28em] text-emerald-700">Booking Received</div>
                <h3 className="mt-3 text-2xl font-semibold text-slate-800">Your Booking has been made</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  An admin will reach out to you to confirm.
                </p>
                <button
                  type="button"
                  onClick={() => setShowBookingSuccess(false)}
                  className="mt-6 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.01]"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
