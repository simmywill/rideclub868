import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import BicycleIntroAnimation from "./components/BicycleIntroAnimation";
import AdminPage from "./pages/AdminPage";
import {
  createBookingId,
  loadAdminSession,
  loadStoredBookings,
  loadStoredSettings,
  saveAdminSession,
  saveStoredBookings,
  saveStoredSettings,
} from "./lib/bookingData";

export default function App() {
  const [bookings, setBookings] = useState(() => loadStoredBookings());
  const [settings, setSettings] = useState(() => loadStoredSettings());
  const [isAdminSignedIn, setIsAdminSignedIn] = useState(() => loadAdminSession());

  useEffect(() => {
    saveStoredBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveAdminSession(isAdminSignedIn);
  }, [isAdminSignedIn]);

  function handleCreateBooking(bookingInput) {
    const newBooking = {
      id: createBookingId(),
      ...bookingInput,
      quantity: Number(bookingInput.quantity),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setBookings((currentBookings) => [newBooking, ...currentBookings]);
    return newBooking;
  }

  function handleUpdateBookingStatus(bookingId, nextStatus) {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: nextStatus } : booking
      )
    );
  }

  function handleClearBooking(bookingId) {
    setBookings((currentBookings) =>
      currentBookings.filter((booking) => booking.id !== bookingId)
    );
  }

  function handleUpdateTotalBikes(nextTotalBikes) {
    const parsedValue = Number(nextTotalBikes);

    setSettings((currentSettings) => ({
      ...currentSettings,
      totalBikes: Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : currentSettings.totalBikes,
    }));
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <BicycleIntroAnimation
            bookings={bookings}
            totalBikes={settings.totalBikes}
            onCreateBooking={handleCreateBooking}
          />
        }
      />
      <Route
        path="/admin"
        element={
          <AdminPage
            bookings={bookings}
            isSignedIn={isAdminSignedIn}
            onSignIn={() => setIsAdminSignedIn(true)}
            onSignOut={() => setIsAdminSignedIn(false)}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onClearBooking={handleClearBooking}
            totalBikes={settings.totalBikes}
            onUpdateTotalBikes={handleUpdateTotalBikes}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
