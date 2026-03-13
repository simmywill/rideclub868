import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required.");
}

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD are required.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "..", "dist");

const app = express();

app.use(express.json());
app.use(cookieParser());

function createAdminToken() {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
}

function setAuthCookie(response, token) {
  response.cookie("rideclub868_admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function clearAuthCookie(response) {
  response.clearCookie("rideclub868_admin", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

function requireAdmin(request, response, next) {
  const token = request.cookies.rideclub868_admin;

  if (!token) {
    response.status(401).json({ message: "Not authenticated." });
    return;
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    response.status(401).json({ message: "Session expired." });
  }
}

function getMonthRange(monthValue) {
  const [yearValue, monthIndexValue] = monthValue.split("-").map(Number);

  if (
    !Number.isInteger(yearValue) ||
    !Number.isInteger(monthIndexValue) ||
    monthIndexValue < 1 ||
    monthIndexValue > 12
  ) {
    return null;
  }

  const startDate = new Date(Date.UTC(yearValue, monthIndexValue - 1, 1));
  const endDate = new Date(Date.UTC(yearValue, monthIndexValue, 1));

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      total_bikes INTEGER NOT NULL CHECK (total_bikes > 0)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id BIGSERIAL PRIMARY KEY,
      rental_date DATE NOT NULL,
      bicycle_type TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      pickup_slot TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'denied')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(
    `
      INSERT INTO settings (id, total_bikes)
      VALUES (1, 12)
      ON CONFLICT (id) DO NOTHING;
    `
  );
}

async function getSettings() {
  const result = await pool.query(
    "SELECT total_bikes FROM settings WHERE id = 1"
  );

  return {
    totalBikes: result.rows[0]?.total_bikes ?? 12,
  };
}

async function getMonthAvailability(monthValue) {
  const monthRange = getMonthRange(monthValue);

  if (!monthRange) {
    throw new Error("Invalid month format.");
  }

  const settings = await getSettings();
  const bookingsResult = await pool.query(
    `
      SELECT rental_date, quantity, status
      FROM bookings
      WHERE rental_date >= $1
        AND rental_date < $2
    `,
    [monthRange.startDate, monthRange.endDate]
  );

  const availabilityByDate = {};

  for (const row of bookingsResult.rows) {
    const dateValue = row.rental_date.toISOString().slice(0, 10);

    if (!availabilityByDate[dateValue]) {
      availabilityByDate[dateValue] = {
        reservedBikes: 0,
      };
    }

    if (row.status !== "denied") {
      availabilityByDate[dateValue].reservedBikes += row.quantity;
    }
  }

  for (const [dateValue, value] of Object.entries(availabilityByDate)) {
    const availableBikes = Math.max(0, settings.totalBikes - value.reservedBikes);
    availabilityByDate[dateValue] = {
      availableBikes,
      reservedBikes: value.reservedBikes,
      isFullyBooked: availableBikes === 0,
    };
  }

  return {
    totalBikes: settings.totalBikes,
    availabilityByDate,
  };
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/availability", async (request, response) => {
  try {
    const monthValue = String(request.query.month || "");
    const availability = await getMonthAvailability(monthValue);
    response.json(availability);
  } catch (error) {
    response.status(400).json({ message: error.message || "Unable to load availability." });
  }
});

app.post("/api/bookings", async (request, response) => {
  const { rentalDate, bicycleType, email, phone, quantity, pickupSlot } = request.body || {};
  const normalizedQuantity = Number(quantity);

  if (!rentalDate || !bicycleType || !email || !phone || !pickupSlot) {
    response.status(400).json({ message: "All booking fields are required." });
    return;
  }

  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
    response.status(400).json({ message: "Quantity must be a positive whole number." });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [rentalDate]);

    const settingsResult = await client.query(
      "SELECT total_bikes FROM settings WHERE id = 1"
    );
    const totalBikes = settingsResult.rows[0]?.total_bikes ?? 12;

    const reservedResult = await client.query(
      `
        SELECT COALESCE(SUM(quantity), 0) AS reserved_bikes
        FROM bookings
        WHERE rental_date = $1
          AND status <> 'denied'
      `,
      [rentalDate]
    );

    const reservedBikes = Number(reservedResult.rows[0]?.reserved_bikes || 0);
    const availableBikes = Math.max(0, totalBikes - reservedBikes);

    if (normalizedQuantity > availableBikes) {
      await client.query("ROLLBACK");
      response.status(409).json({
        message: "That day does not have enough bikes left for this booking quantity.",
      });
      return;
    }

    const insertResult = await client.query(
      `
        INSERT INTO bookings (
          rental_date,
          bicycle_type,
          email,
          phone,
          quantity,
          pickup_slot,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING
          id,
          rental_date,
          bicycle_type,
          email,
          phone,
          quantity,
          pickup_slot,
          status,
          created_at
      `,
      [rentalDate, bicycleType, email, phone, normalizedQuantity, pickupSlot]
    );

    await client.query("COMMIT");
    response.status(201).json({
      booking: mapBookingRow(insertResult.rows[0]),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    response.status(500).json({ message: "Unable to create booking." });
  } finally {
    client.release();
  }
});

app.get("/api/admin/session", (request, response) => {
  const token = request.cookies.rideclub868_admin;

  if (!token) {
    response.json({ authenticated: false });
    return;
  }

  try {
    jwt.verify(token, JWT_SECRET);
    response.json({ authenticated: true });
  } catch {
    clearAuthCookie(response);
    response.json({ authenticated: false });
  }
});

app.post("/api/admin/login", (request, response) => {
  const { username, password } = request.body || {};

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    response.status(401).json({ message: "Incorrect username or password." });
    return;
  }

  setAuthCookie(response, createAdminToken());
  response.json({ authenticated: true });
});

app.post("/api/admin/logout", (_request, response) => {
  clearAuthCookie(response);
  response.json({ ok: true });
});

app.get("/api/admin/settings", requireAdmin, async (_request, response) => {
  const settings = await getSettings();
  response.json(settings);
});

app.patch("/api/admin/settings", requireAdmin, async (request, response) => {
  const totalBikes = Number(request.body?.totalBikes);

  if (!Number.isInteger(totalBikes) || totalBikes <= 0) {
    response.status(400).json({ message: "Total bikes must be a positive whole number." });
    return;
  }

  await pool.query(
    `
      UPDATE settings
      SET total_bikes = $1
      WHERE id = 1
    `,
    [totalBikes]
  );

  response.json({ totalBikes });
});

app.get("/api/admin/bookings", requireAdmin, async (_request, response) => {
  const result = await pool.query(
    `
      SELECT
        id,
        rental_date,
        bicycle_type,
        email,
        phone,
        quantity,
        pickup_slot,
        status,
        created_at
      FROM bookings
      ORDER BY created_at DESC
    `
  );

  response.json({
    bookings: result.rows.map(mapBookingRow),
  });
});

app.patch("/api/admin/bookings/:bookingId/status", requireAdmin, async (request, response) => {
  const bookingId = Number(request.params.bookingId);
  const nextStatus = request.body?.status;

  if (!Number.isInteger(bookingId)) {
    response.status(400).json({ message: "Invalid booking id." });
    return;
  }

  if (!["pending", "confirmed", "denied"].includes(nextStatus)) {
    response.status(400).json({ message: "Invalid booking status." });
    return;
  }

  const result = await pool.query(
    `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING
        id,
        rental_date,
        bicycle_type,
        email,
        phone,
        quantity,
        pickup_slot,
        status,
        created_at
    `,
    [nextStatus, bookingId]
  );

  if (!result.rows[0]) {
    response.status(404).json({ message: "Booking not found." });
    return;
  }

  response.json({
    booking: mapBookingRow(result.rows[0]),
  });
});

app.delete("/api/admin/bookings/:bookingId", requireAdmin, async (request, response) => {
  const bookingId = Number(request.params.bookingId);

  if (!Number.isInteger(bookingId)) {
    response.status(400).json({ message: "Invalid booking id." });
    return;
  }

  const result = await pool.query(
    `
      DELETE FROM bookings
      WHERE id = $1
      RETURNING id
    `,
    [bookingId]
  );

  if (!result.rows[0]) {
    response.status(404).json({ message: "Booking not found." });
    return;
  }

  response.json({ ok: true });
});

app.use(express.static(distPath));

app.get("*", (_request, response) => {
  response.sendFile(path.join(distPath, "index.html"));
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`rideclub868 server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });

function mapBookingRow(row) {
  return {
    id: row.id,
    rentalDate: row.rental_date.toISOString().slice(0, 10),
    bicycleType: row.bicycle_type,
    email: row.email,
    phone: row.phone,
    quantity: row.quantity,
    pickupSlot: row.pickup_slot,
    status: row.status,
    createdAt: row.created_at,
  };
}
