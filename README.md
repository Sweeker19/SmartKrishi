# SmartKrishi AI — MERN project

A farmer-facing web application based on the supplied **FSD-Review0.pptx** presentation. The uploaded artifact was a PowerPoint presentation, not a PDF.

## Stack constraint

Application runtime: **MongoDB + Express.js + React + Node.js only**.

- MongoDB via Mongoose stores accounts, farms, uploaded image records, alerts and quotations.
- Express/Node implements APIs, authentication, business rules and optional weather fetching.
- React and plain CSS implement the responsive interface.
- Vite is React's development/build tool, not an additional backend stack.
- JWT, bcryptjs, Helmet and other npm libraries are ordinary Node dependencies.
- No Python runtime, Flask, Django, FastAPI, SQL database, Firebase, external AI service, TensorFlow service, Tailwind or separate object-storage service is used.
- Open-Meteo is an optional public weather data source, called from Node. Disable it for an entirely offline-data demonstration. It is not an additional application server you need to run.
- Leaf images are stored as bounded JPEG/PNG data URLs in MongoDB. No external image storage is needed.

## Important scope and honesty

This is an educational MERN prototype, not a production agronomic/AI system. A trained plant-disease model and labeled training dataset were not provided with the presentation.

The application does NOT pretend that an uploaded photo has been diagnosed by AI:

1. The browser computes coarse image-colour statistics for a visual summary.
2. The Node backend matches farmer-selected symptoms against transparent example rules.
3. The image, symptoms and tentative patterns are saved for review.
4. Scores are symptom-rule coverage, not AI confidence or disease probabilities.

Crop rankings and fertilizer bands are also illustrative rules, not trained ML. Fertilizer output discusses nutrient sources and timing but deliberately does not prescribe a dose. Seeded market data is synthetic. The interface labels every limitation.

See `docs/FEATURE_STATUS.md` for an exact mapping to the requested project.

## 1. Prerequisites

- Node.js 22 or newer and npm.
- A running MongoDB instance, local or MongoDB Atlas. A local MongoDB database is sufficient; no Atlas account is required.
- Internet to install npm packages. After installation, the app can run with a local MongoDB and sample weather without internet access.

MongoDB is not bundled in this ZIP. Start it using the installation method appropriate to your OS, or configure an Atlas connection string.

## 2. Install

Extract the ZIP, open a terminal in the `SmartKrishi-MERN` project directory, and run:

```sh
npm install
```

Create the API environment file:

macOS/Linux/Git Bash:

```sh
cp server/.env.example server/.env
```

Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

Generate a random secret:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Open `server/.env`, paste the generated value after `JWT_SECRET=`, and configure MongoDB:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smartkrishi
JWT_SECRET=PASTE_YOUR_GENERATED_RANDOM_SECRET_HERE
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
LIVE_WEATHER=true
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Do not use the text `PASTE_YOUR_GENERATED_RANDOM_SECRET_HERE` as your secret. Keep `.env` private.

If you want predictable offline demonstration weather, use `LIVE_WEATHER=false`. The UI will display SAMPLE DATA. With live weather enabled, server-side provider failures fall back to clearly labelled sample weather.

## 3. Optional market/admin seed

```sh
npm run seed
```

This inserts 126 synthetic market observations: 6 crops × 3 example markets × 7 dates relative to the seed run. These names/values are demonstration records and are not verified commodity listings or actual prices. Rerunning for the same dates avoids duplicate sample rows.

To create an administrator, set BOTH `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env` before seeding. Passwords must be at least 10 characters and at most 72 UTF-8 bytes. Use a unique strong password.

The seed creates a new admin only if that email does not already exist. It never elevates or resets an existing account. No default admin credentials are shipped. Remove `ADMIN_PASSWORD` from `.env` after successful creation if it is no longer needed.

Ordinary registration always creates a farmer. Farmers can view prices; only administrators can add/delete quotations.

## 4. Run development servers

```sh
npm run dev
```

Open **http://localhost:5173**.

- React/Vite: port 5173.
- Express API: port 5000.
- Vite proxies `/api` to Express; browser requests are same-origin.
- Register an account, add a farm and choose it from the top bar.

Use `localhost`, not `127.0.0.1`, in the browser unless you also change `CLIENT_ORIGIN`. The mutation-origin check expects an exact match. Ensure port 5173 is free; if Vite chooses another port, update `CLIENT_ORIGIN` or free the original port.

## 5. Tests

```sh
npm test
```

The eight Node built-in unit tests exercise crop scores, rotation penalties, rain/wind/humidity rules, normal-weather output, heat/moisture reminders, unspecified soil nutrients, and screening-score semantics. No database is required for these engine tests.

For the database and browser validation checklist, see `docs/MANUAL_TESTS.md`.

Validation performed while assembling this ZIP:

- 8/8 engine tests passed.
- Every server JavaScript file passed `node --check`.
- All 10 frontend JavaScript/JSX modules passed a JSX parser check.
- npm dependency installation, a Vite production build, live-provider availability and MongoDB-backed end-to-end flows were NOT executed in the artifact-generation environment. See `docs/VALIDATION.json`; a passing unit test is not an end-to-end test.

## 6. Build and serve React from Express

```sh
npm run build
npm start
```

For a local built-app check, leave `NODE_ENV=development`, change `CLIENT_ORIGIN=http://localhost:5000`, then open **http://localhost:5000**. The Express server serves `client/dist` after a build.

For a real deployment:

1. Set `NODE_ENV=production`.
2. Set `CLIENT_ORIGIN` to the exact public HTTPS origin, without a trailing slash.
3. Set `MONGODB_URI` and a strong `JWT_SECRET` through environment variables or a protected environment file.
4. Build React, then run Node. Both browser and API should share the same public origin.
5. Terminate HTTPS in your hosting platform. Production authentication cookies require HTTPS.
6. Do not blindly enable Express `trust proxy`; configure it only for your actual trusted proxy topology. The included in-memory request limiter uses `req.ip`, so a proxy may otherwise cause users to share a limit.
7. Complete the hardening and validation checklist before any real rollout.

There is no requirement for Docker, Redis, Python, a task queue or another backend service.

## 7. Demonstration walkthrough

1. Register a farmer account.
2. Open **My farms → Add a farm**.
3. Enter the actual district, coordinates, crop, soil, season, area, sowing date and growth stage. Chennai coordinates are convenient defaults, not automatic geolocation.
4. Enter soil-test values in the displayed units, or use 0 for an unprovided nutrient value.
5. Inspect the overview and weather outlook. Check the live/sample badge before interpreting data.
6. Compare the six crop-planning profiles and inspect their scoring explanation.
7. Open soil & nutrients to review the discussion-oriented suggestions.
8. Upload a small JPEG/PNG leaf photo, select visible symptoms, and save a screening. Read the non-diagnostic warning.
9. Inspect the saved image/history. No symptom selection must NOT produce a “healthy” diagnosis.
10. Seed market data or sign in as the seeded administrator to add manual quotations. Filter by crop and district. Same-district filtering is not GPS-distance sorting.
11. Click **Refresh field alerts** from the overview or weather page. Inspect weather, irrigation, humid-condition disease/pest watch, nutrient reminders and qualifying market-change alerts.
12. Mark alerts read, edit your farm, and check ownership isolation using a second account.

## Main scripts

| Command | Purpose |
| --- | --- |
| `npm install` | Install both npm workspaces and development utilities |
| `npm run dev` | Run React/Vite and Express together |
| `npm run build` | Build React into `client/dist` |
| `npm start` | Run the Express server; serve React if built |
| `npm run seed` | Insert sample prices and optionally create a new admin |
| `npm test` | Run isolated business-rule tests |

## Folder layout

```text
SmartKrishi-MERN/
  client/
    src/
      App.jsx              Application shell, session and active-farm state
      Auth.jsx             Registration and login
      Farms.jsx            Farm create/edit/delete
      Intelligence.jsx     Overview, weather, crop and nutrient pages
      Disease.jsx          Image upload, colour summary and symptom screening
      Markets.jsx          Price filters, histories, SVG trends and admin entry
      Alerts.jsx           In-app alert inbox
      components.jsx       Shared UI elements
      api.js               API client and formatting
      styles.css           Responsive, self-contained plain CSS
    vite.config.js
  server/
    src/
      index.js             Server startup, HTTP hardening and static serving
      routes.js            Authenticated REST API
      models.js            Mongoose schemas
      engine.js            Transparent educational rules
      weather.js           Optional live weather with labelled fallback
      middleware.js        Auth, roles, rate limiting and origin checks
      validation.js        Input and image validation
      config.js
      seed.js
    test/engine.test.js
    .env.example
  docs/
    API.md
    ARCHITECTURE.md
    FEATURE_STATUS.md
    MANUAL_TESTS.md
    VALIDATION.json
  README.md
```

## Troubleshooting

- **Set JWT_SECRET error:** Replace the example value with a generated secret of at least 32 characters.
- **MongoDB connection refused:** Start MongoDB and check the URI. For Atlas, verify credentials, database user permissions and network access rules.
- **Cannot reach API:** Check the Express terminal, MongoDB connection and port 5000.
- **Request origin not allowed:** Match `CLIENT_ORIGIN` to the exact browser origin and restart Express.
- **Sample weather shown:** Confirm `LIVE_WEATHER=true` and outbound HTTPS access from Node. Fallback values are never represented as live.
- **No market rows:** Run the seed or add manual quotes as an administrator; remove the district filter.
- **No market alert:** The selected farm's crop and district must have two observations in the same market/source group with at least a 1% modal-price change. Refresh the field alerts.
- **No extra daily weather alert:** Alerts are deduplicated by user, farm, category and UTC day. Existing alerts are not rewritten on subsequent refreshes that day.
- **Production login will not persist over HTTP:** Production cookies are Secure. Use HTTPS, or development mode only for a local built-app test.
- **Photo rejected:** Only valid JPEG/PNG signatures under 3 MB are accepted. SVG/HEIC/WebP and oversized data are rejected.

## Security and deployment limitations

Included: password hashing; expiring HttpOnly same-site JWT cookies; production Secure cookies; account-scoped data access; administrator checks; strict mutation-origin checks; input allowlists; Mongoose validation; image-size/signature checks; API/auth/upload rate limits; Helmet; bounded database queries.

Not included: password reset, email verification, MFA, server-side session revocation, audit trails, account deletion, automatic database retention, production telemetry, malware scanning, robust image re-encoding, distributed rate limits, trained-model monitoring or regulatory/agronomic validation. JWTs expire after seven days; logout clears the browser cookie, not a server revocation record. Do not publish this prototype as a finished production service.

Images are private to authenticated owner endpoints, but are not encrypted separately from MongoDB storage. Keep the database private and use TLS/backups/at-rest controls appropriate to the deployment. Uploaded personal data and images require an explicit retention/consent policy before real deployment.

## Weather provider

When enabled, Node requests Open-Meteo's forecast endpoint. Source: https://open-meteo.com/. Check the provider's current attribution and usage conditions before deployment. The UI identifies the weather source, time and fallback status. Current temperature, humidity and wind are combined with today's forecast rainfall; this is not an installed field weather sensor.
"# SmartKrishi" 
