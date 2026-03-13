# rideclub868

Production-ready bicycle booking app with:

- Animated customer homepage at `/`
- Secure admin login at `/admin`
- Express API with HttpOnly cookie auth
- Postgres-backed bookings and inventory

## Local development

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set your real values.
3. Start the API:
   `npm run dev:server`
4. In a second terminal, start the frontend:
   `npm run dev`
5. Open:
   `http://localhost:5173`

## Production environment variables

- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Render production shape

- One `Web Service` for this app
- One `Postgres` database

## Production start

- Build command: `npm install && npm run build`
- Start command: `npm start`
