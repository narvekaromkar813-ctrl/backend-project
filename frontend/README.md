# ☀️ SolarSight — React Frontend Dashboard

> **Production-grade solar photovoltaic monitoring, telemetry tracking, and net-metering dashboard.**  
> Built with **React 18 + Vite**, **Tailwind CSS**, **TanStack React Query**, **Recharts**, and **Socket.IO**.

---

## 🚀 Key Features

* **⚡ Real-time Telemetry (Socket.IO):** Instant live updates for photovoltaic power generation (`generation:update`) and live system alerts (`alert:new`).
* **📊 Visual Analytics (Recharts):** Generation vs consumption comparison, 48-hour solar weather irradiance forecast, appliance category breakdown, monthly savings, and peer benchmarks.
* **☀️ Solar Panel CRUD Management:** Create, view, edit, and decommission solar panels with capacity and technology filtering.
* **📈 Generation & Consumption Tracking:** Log manual readings, time-series telemetry streams, and one-click demo data seeders.
* **⚡ Grid Exchange Net-Metering:** Import vs export calculations, feed-in credit estimates, and self-sufficiency percentages.
* **💰 Billing & ROI Payback:** Monthly utility bill predictions, net payable tracking, and an interactive debounced ROI scenario calculator.
* **🔔 Diagnostic Alert System:** Automated anomaly scans for zero-generation and underperforming strings, severity color badges, and resolution workflows.
* **👥 Anonymous Neighborhood Benchmarking:** Privacy-preserving peer leaderboard ranking based on specific yield ($kWh/kWp$).
* **🔋 Advanced Solar Hub:** Battery storage scheduling, EV smart charging recommendations, CEA carbon offset tracking, and PM Surya Ghar government subsidy claim tracking.
* **🎨 Solar Theme & Dark/Light Mode:** Deep navy (`#0D2137`) layout with warm amber/orange accents (`#F59E0B`, `#F97316`) and persistent theme toggling.
* **🛡️ Defensive API Handling:** Optional chaining fallbacks and generic key-value stat card fallbacks ensuring zero crashes on unknown/extended response payloads.

---

## 🛠️ Tech Stack

* **Framework:** React 18 with Vite
* **Routing:** React Router v6 (with `ProtectedRoute` session guard)
* **Styling:** Tailwind CSS (Dark/Light mode support with custom Solar palette)
* **Data Fetching:** TanStack React Query v5 & configured Axios instance
* **Charts:** Recharts (Responsive area, bar, line, and pie charts)
* **Real-time:** `socket.io-client` with auto-reconnect and room joining
* **Toasts & Icons:** `react-hot-toast` & `lucide-react`

---

## 📦 Local Development Setup

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed. The backend API must be running on `http://localhost:5001`.

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Contents of `.env`:
```env
# URL of your Node/Express REST API & Socket.IO server
VITE_API_URL=http://localhost:5001
```

> **Note:** Never hardcode URLs in code. The frontend references `import.meta.env.VITE_API_URL`.

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000) (or the port Vite outputs).

---

## 🌐 Deploying to Vercel

The project includes `vercel.json` preconfigured with single-page application (SPA) rewrites so client-side routes (e.g. `/dashboard`, `/panels`, `/alerts`) resolve seamlessly without 404 errors.

### Option A: Deploy via Vercel CLI
1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```
2. From the `frontend` directory:
   ```bash
   vercel
   ```
3. Set your production environment variable when prompted or via the Vercel dashboard:
   * **Variable Name:** `VITE_API_URL`
   * **Value:** `https://your-deployed-backend.railway.app` (or your backend's HTTPS URL)
4. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Web Dashboard (GitHub / GitLab / Bitbucket)
1. Import your repository into Vercel.
2. In the project configuration:
   * **Root Directory:** `frontend`
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
3. In **Environment Variables**, add:
   * `VITE_API_URL` = `https://your-deployed-backend-url.com`
4. Click **Deploy**.

> ⚠️ **Production Security Notice:**  
> In production, ensure your backend is served over **`https://`**. The `socket.io-client` will automatically establish secure WebSockets (`wss://`).

---

## 📂 Project Structure

```
frontend/
├── .env.example              # Template environment variables
├── .env                      # Local environment configuration
├── index.html                # HTML entry point with Inter font & SEO tags
├── package.json              # Project dependencies & scripts
├── tailwind.config.js        # Custom solar & navy theme configuration
├── postcss.config.js         # PostCSS plugins
├── vercel.json               # SPA routing rewrite rule
├── vite.config.js            # Vite configuration
└── src/
    ├── api/                  # Configured Axios instance and API functions
    │   ├── axios.js          # Auth token interceptor & 401 redirect handler
    │   ├── authApi.js        # Register, login, profile, password
    │   ├── panelsApi.js      # CRUD endpoints for solar panels
    │   ├── generationApi.js  # Solar generation telemetry & demo seeder
    │   ├── consumptionApi.js # Electricity consumption & demo seeder
    │   ├── gridApi.js        # Net-metering export & import balances
    │   ├── billsApi.js       # Utility bills & projected savings
    │   ├── alertsApi.js      # Diagnostics check, read & resolve alerts
    │   ├── roiApi.js         # ROI analytics & custom scenario calculation
    │   ├── weatherApi.js     # Irradiance impact & 48-hour forecast
    │   ├── compareApi.js     # Anonymous neighborhood peer leaderboard
    │   ├── notificationApi.js# Real-time notification dispatch
    │   ├── advancedApi.js    # Battery, EV, Carbon, & Subsidies
    │   └── healthApi.js      # Backend health check
    ├── context/              # Global React Contexts
    │   ├── AuthContext.jsx   # Session restoration, login, logout
    │   ├── SocketContext.jsx # Socket.io connection, live events, badges
    │   └── ThemeContext.jsx  # Dark/Light mode toggle & persistence
    ├── hooks/                # React Query hooks per module
    │   ├── useDebounce.js    # Debounce utility for ROI scenario calculator
    │   ├── usePanelsQuery.js
    │   ├── useGenerationQuery.js
    │   ├── useConsumptionQuery.js
    │   ├── useGridQuery.js
    │   ├── useBillsQuery.js
    │   ├── useAlertsQuery.js
    │   ├── useROIQuery.js
    │   ├── useWeatherQuery.js
    │   ├── useCompareQuery.js
    │   └── useAdvancedQuery.js
    ├── utils/
    │   ├── formatters.js     # Currency (₹ en-IN), kWh, kW, and dates
    │   └── helpers.js        # Classnames helper, severity/status styling
    ├── components/
    │   ├── layout/           # Sidebar, Navbar, ProtectedRoute, Layout
    │   ├── ui/               # StatCard, Button, Card, Badge, Modal, etc.
    │   └── charts/           # Recharts components (Area, Bar, Pie, Line)
    └── pages/                # All 13 application views + 404
        ├── Login.jsx
        ├── Register.jsx
        ├── Dashboard.jsx
        ├── Panels.jsx
        ├── Generation.jsx
        ├── Consumption.jsx
        ├── Grid.jsx
        ├── Bills.jsx
        ├── Alerts.jsx
        ├── ROI.jsx
        ├── Weather.jsx
        ├── Compare.jsx
        ├── Advanced.jsx
        ├── Settings.jsx
        └── NotFound.jsx
```

---

## 🧪 Testing Backend Connection

1. Ensure the Node/Express backend is running:
   ```bash
   node server.js
   ```
2. Start the frontend:
   ```bash
   npm run dev
   ```
3. Use the built-in quick login button on `/login` or create a new account via `/register`.
4. Click **Seed Demo Telemetry** on the dashboard or generation page to generate real-time curves immediately!
