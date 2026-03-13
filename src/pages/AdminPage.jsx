import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  formatDateLabel,
  getDailyAvailability,
} from "../lib/bookingData";

function BookingStatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    denied: "bg-red-100 text-red-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function AdminPage({
  bookings,
  isSignedIn,
  onSignIn,
  onSignOut,
  onUpdateBookingStatus,
  onClearBooking,
  totalBikes,
  onUpdateTotalBikes,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [bookingToClear, setBookingToClear] = useState(null);

  const bookingsByDate = useMemo(() => {
    const uniqueDates = [...new Set(bookings.map((booking) => booking.rentalDate))].sort();

    return uniqueDates.map((dateValue) => ({
      dateValue,
      ...getDailyAvailability(bookings, dateValue, totalBikes),
    }));
  }, [bookings, totalBikes]);

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort((leftBooking, rightBooking) => {
        const leftDate = `${leftBooking.rentalDate}_${leftBooking.createdAt}`;
        const rightDate = `${rightBooking.rentalDate}_${rightBooking.createdAt}`;
        return rightDate.localeCompare(leftDate);
      }),
    [bookings]
  );

  function handleSubmit(event) {
    event.preventDefault();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setSignInError("");
      onSignIn();
      return;
    }

    setSignInError("Incorrect username or password.");
  }

  function handleConfirmClearBooking() {
    if (!bookingToClear) {
      return;
    }

    onClearBooking(bookingToClear.id);
    setBookingToClear(null);
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-[linear-gradient(135deg,#082f49_0%,#14532d_52%,#fef3c7_100%)] px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/20 bg-white/15 p-6 text-white shadow-2xl backdrop-blur-2xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-100">Admin Portal</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">rideclub868 dashboard</h1>
          <p className="mt-3 text-sm leading-6 text-slate-100">
            Sign in to review bookings, confirm or deny requests, and control total bike inventory.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm text-cyan-50">Username</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/85 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-cyan-50">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/85 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>

            {signInError ? (
              <div className="rounded-2xl border border-red-300/40 bg-red-500/20 px-4 py-3 text-sm text-red-100">
                {signInError}
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
            >
              Sign In
            </button>
          </form>

          <Link
            to="/"
            className="mt-5 inline-flex text-sm font-medium text-cyan-100 transition hover:text-white"
          >
            Back to booking site
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[linear-gradient(180deg,#fefce8_0%,#d9f99d_35%,#bae6fd_100%)] px-6 py-8 text-slate-900 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/40 bg-white/55 p-6 shadow-xl backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Admin Route</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Manage bookings and bike inventory</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Bookings stay marked against each day until they are denied, and a day only becomes fully booked when all bikes are used.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="rounded-full border border-emerald-700/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700"
            >
              View homepage
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/40 bg-white/60 p-6 shadow-lg backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.3em] text-emerald-700">Universal inventory</div>
              <h2 className="mt-3 text-2xl font-semibold">Available bikes across the business</h2>
              <p className="mt-2 text-sm text-slate-600">
                This number controls how many bookings can exist across the same day before it shows as booked on the homepage.
              </p>

              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Total bikes available</span>
                <input
                  type="number"
                  min="1"
                  value={totalBikes}
                  onChange={(event) => onUpdateTotalBikes(event.target.value)}
                  className="w-full rounded-2xl border border-emerald-700/10 bg-white/85 px-4 py-3 text-base text-slate-900 outline-none"
                />
              </label>
            </div>

            <div className="rounded-[2rem] border border-white/40 bg-white/60 p-6 shadow-lg backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.3em] text-emerald-700">Daily availability</div>
              <h2 className="mt-3 text-2xl font-semibold">Bike count by date</h2>

              <div className="mt-5 space-y-3">
                {bookingsByDate.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-5 text-sm text-slate-500">
                    No bookings yet. Availability will appear here once users start booking.
                  </div>
                ) : (
                  bookingsByDate.map((dateSummary) => (
                    <div
                      key={dateSummary.dateValue}
                      className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/75 px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {formatDateLabel(dateSummary.dateValue)}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                          {dateSummary.reservedBikes} reserved
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-emerald-700">
                          {dateSummary.availableBikes} left
                        </div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {dateSummary.isFullyBooked ? "Fully booked" : "Still available"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/40 bg-white/60 p-6 shadow-lg backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-700">Bookings</div>
            <h2 className="mt-3 text-2xl font-semibold">Requests from the homepage</h2>

            <div className="mt-5 space-y-4">
              {sortedBookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-5 text-sm text-slate-500">
                  No booking requests have been made yet.
                </div>
              ) : (
                sortedBookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-[1.75rem] border border-white/60 bg-white/80 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="text-lg font-semibold text-slate-800">
                          {booking.bicycleType} for {booking.quantity} bike{Number(booking.quantity) > 1 ? "s" : ""}
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          {formatDateLabel(booking.rentalDate)}
                        </div>
                      </div>
                      <BookingStatusBadge status={booking.status} />
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</div>
                        <div className="mt-1 font-medium">{booking.email}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Phone</div>
                        <div className="mt-1 font-medium">{booking.phone}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Pickup slot</div>
                        <div className="mt-1 font-medium">{booking.pickupSlot}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Booked at</div>
                        <div className="mt-1 font-medium">
                          {new Date(booking.createdAt).toLocaleString("en-US")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => onUpdateBookingStatus(booking.id, "confirmed")}
                        disabled={booking.status === "confirmed"}
                        className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200"
                      >
                        Confirm booking
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateBookingStatus(booking.id, "denied")}
                        disabled={booking.status === "denied"}
                        className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-red-200"
                      >
                        Deny booking
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingToClear(booking)}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Completed
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <AnimatePresence>
          {bookingToClear ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/30 px-6 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full max-w-md rounded-[2rem] border border-white/40 bg-white/90 p-6 shadow-2xl backdrop-blur-xl"
              >
                <div className="text-xs uppercase tracking-[0.28em] text-emerald-700">Clear Booking</div>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900">Remove completed booking?</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Are you sure you want to clear this booking, it will be removed from the list.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmClearBooking}
                    className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Yes, clear it
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingToClear(null)}
                    className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
