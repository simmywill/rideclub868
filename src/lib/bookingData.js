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

export const DEFAULT_TOTAL_BIKES = 12;

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

export function getDailyAvailability(bookings, dateValue, totalBikes) {
  const reservedBikes = bookings
    .filter(
      (booking) =>
        booking.rentalDate === dateValue &&
        booking.status !== "denied"
    )
    .reduce((total, booking) => total + Number(booking.quantity || 0), 0);

  const availableBikes = Math.max(0, totalBikes - reservedBikes);

  return {
    availableBikes,
    reservedBikes,
    isFullyBooked: availableBikes === 0,
  };
}
