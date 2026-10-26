# Keşif Hub (MERN)

MongoDB + Express + React + Node. Members share **projects**, **products** and **campgrounds**, review each other's posts and browse profiles.

```
kesif-hub/
  server/   Express REST API (JSON) + MongoDB models, JWT login, Cloudinary uploads
  client/   React app (Vite, React Router)
```

## Run it

Needs Node.js 18+ and MongoDB running locally (or an Atlas connection string).

```bash
npm run install-all          # installs root, server and client dependencies

cp server/.env.example server/.env     # then fill it in (see below)
cp client/.env.example client/.env     # optional, only for the map

npm run seed                 # optional: sample projects/products/campgrounds + user "sampleUser" / "securepassword"
npm run dev                  # API on :5000, React on :5173
```

Open **http://localhost:5173**.

### server/.env

| Variable | What it is |
|---|---|
| `MONGO_URI` | MongoDB connection string. Default `mongodb://127.0.0.1:27017/NewProject` (the old `DB_URL` name is no longer read). |
| `JWT_SECRET` | Long random string used to sign login tokens. **Set this.** |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` | Image uploads. Same values as your old project. |
| `MAPTILER_API_KEY` | Turns a place name into map coordinates when posting products/campgrounds. |
| `CLIENT_URL` | Allowed browser origin for CORS. Default `http://localhost:5173`. |

### client/.env
`VITE_MAPTILER_KEY` shows the map on product and campground pages. It must be set **before** `npm run dev` / `npm run build`.

## Production

```bash
npm run build     # builds client/dist
npm start         # Express serves the API and the built React app on one port
```

## API overview

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | return `{ token, user }` |
| GET | `/api/auth/me` | current user |
| POST | `/api/auth/forgot-password` | username + phone + new password |
| GET | `/api/home`, `/api/search?q=` | home sections, global search |
| GET | `/api/users/:id` | profile and posts |
| PUT | `/api/users/me` | edit profile (multipart, optional `image`) |
| POST | `/api/users/me/password` | change password |
| GET/POST | `/api/:kind` | `kind` = `campgrounds`, `products` or `projects`. `?q=` filters by title |
| GET/PUT/DELETE | `/api/:kind/:id` | owner-only edit and delete |
| POST/DELETE | `/api/:kind/:id/reviews[/:reviewId]` | reviews |

Send the token as `Authorization: Bearer <token>`.

## What changed from the EJS version

- Server-rendered EJS views, sessions and flash messages were replaced by a JSON API plus a React client with JWT login.
- The three near-identical controllers/routes (campgrounds, products, projects) now share one generic implementation (`server/controllers/items.js`).
- Owner checks now really work. In the old code `!project.id === req.user._id` was always false, so anyone logged in could edit or delete any post or review.
- Account responses never include the password hash or salt. Other people's profiles hide email, phone and birthday.
- Model file names and field names are unchanged, so your existing MongoDB data still works.
- Seeded items are now linked to the seeded `sampleUser`.
- Search matches any part of a title (it used to need an exact word).

## Things you may want to improve

- **Password reset** still works as before: username + phone number. Anyone who knows both can take over an account. Consider an email reset link (you can add `nodemailer`).
- The **Contact** form does not send anything yet (it only validated in the browser before too).
- Trending "views" count every page open, including repeat opens by the same person.
