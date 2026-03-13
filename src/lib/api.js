async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed.");
  }

  return payload;
}

export function getAvailability(monthValue) {
  return apiRequest(`/api/availability?month=${encodeURIComponent(monthValue)}`);
}

export function createBooking(bookingInput) {
  return apiRequest("/api/bookings", {
    method: "POST",
    body: JSON.stringify(bookingInput),
  });
}

export function getAdminSession() {
  return apiRequest("/api/admin/session");
}

export function signInAdmin(credentials) {
  return apiRequest("/api/admin/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function signOutAdmin() {
  return apiRequest("/api/admin/logout", {
    method: "POST",
  });
}

export function getAdminBookings() {
  return apiRequest("/api/admin/bookings");
}

export function getAdminSettings() {
  return apiRequest("/api/admin/settings");
}

export function updateAdminBookingStatus(bookingId, status) {
  return apiRequest(`/api/admin/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function clearAdminBooking(bookingId) {
  return apiRequest(`/api/admin/bookings/${bookingId}`, {
    method: "DELETE",
  });
}

export function updateAdminSettings(settings) {
  return apiRequest("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
}
