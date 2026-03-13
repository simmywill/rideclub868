export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const ADMIN_USERNAME = "therideclub868_squad";
export const ADMIN_PASSWORD = "ride_club@868";
export const DEFAULT_TOTAL_BIKES = 12;

const BOOKINGS_STORAGE_KEY = "rideclub868_bookings";
const SETTINGS_STORAGE_KEY = "rideclub868_settings";
const ADMIN_SESSION_STORAGE_KEY = "rideclub868_admin_session";

export function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateValue) {
  if (!dateValue) {
    return "Select a day from the calendar";
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getCalendarDays(activeMonth) {
  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyDays = firstDay.getDay();
  const dayCells = Array.from({ length: leadingEmptyDays }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    dayCells.push(new Date(year, month, day));
  }

  const trailingEmptyDays = (7 - (dayCells.length % 7)) % 7;
  return dayCells.concat(Array.from({ length: trailingEmptyDays }, () => null));
}

export function createBookingId() {
  return `booking_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadStoredBookings() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : [];
  } catch {
    return [];
  }
}

export function saveStoredBookings(bookings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
}

export function loadStoredSettings() {
  if (typeof window === "undefined") {
    return { totalBikes: DEFAULT_TOTAL_BIKES };
  }

  try {
    const rawValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : {};
    const totalBikes = Number(parsedValue.totalBikes);

    return {
      totalBikes: Number.isFinite(totalBikes) && totalBikes > 0 ? totalBikes : DEFAULT_TOTAL_BIKES,
    };
  } catch {
    return { totalBikes: DEFAULT_TOTAL_BIKES };
  }
}

export function saveStoredSettings(settings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function loadAdminSession() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === "true";
}

export function saveAdminSession(isSignedIn) {
  if (typeof window === "undefined") {
    return;
  }

  if (isSignedIn) {
    window.sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, "true");
    return;
  }

  window.sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

export function getReservedBikeCount(bookings, dateValue) {
  return bookings
    .filter(
      (booking) =>
        booking.rentalDate === dateValue &&
        booking.status !== "denied"
    )
    .reduce((total, booking) => total + Number(booking.quantity || 0), 0);
}

export function getAvailableBikeCount(bookings, dateValue, totalBikes) {
  return Math.max(0, totalBikes - getReservedBikeCount(bookings, dateValue));
}

export function getDailyAvailability(bookings, dateValue, totalBikes) {
  const availableBikes = getAvailableBikeCount(bookings, dateValue, totalBikes);

  return {
    availableBikes,
    reservedBikes: totalBikes - availableBikes,
    isFullyBooked: availableBikes === 0,
  };
}
