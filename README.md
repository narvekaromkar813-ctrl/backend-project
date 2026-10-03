# ☀️ SolarSight — Solar Panel Monitoring System Backend

> **ITM Skills University | School of Future Tech**  
> **B.Tech Computer Science Engineering — Case Study 59**  
> **Tech Stack:** Node.js, Express.js, MongoDB (Mongoose), Socket.IO, Firebase Admin SDK, JWT, Swagger OpenAPI 3.0

---

## 📌 Project Overview

**SolarSight** is an enterprise-grade RESTful API backend engineered to monitor solar panel telemetry, photovoltaic energy generation, residential electricity consumption, bi-directional grid exchange (import/export), utility billing predictions, Return on Investment (ROI) analytics, real-time maintenance diagnostics, weather solar irradiance impact, and anonymous neighborhood benchmarking.

### Core Capabilities
* **Full CRUD Solar Panel Management:** Track panel capacities, types, tilt angles, installation dates, and status.
* **Generation & Consumption Telemetry:** High-resolution time-series tracking in kilowatts (kW) and kilowatt-hours (kWh).
* **Grid Import / Export Exchange:** Automated net-metering balance calculations.
* **Billing & ROI Analytics:** Accurate tariff-based bill predictions, monthly savings (₹), and break-even payback timelines.
* **Real-time WebSockets (Socket.IO):** Live streaming of power output and immediate alert notifications.
* **Automated Diagnostics:** Algorithm scans for zero-generation and underperforming strings (e.g., panel cleaning alerts).
* **Weather Irradiance Engine:** Integration with Open-Meteo for real-time solar irradiance ($W/m^2$), cloud derating, and ambient temperature loss models.
* **Anonymous Neighborhood Benchmarking:** Privacy-preserving peer comparisons within regional pincodes.
* **Interactive Swagger Documentation:** Live interactive API explorer accessible at `/api-docs`.

---

## 📂 Final Project Architecture

```
SolarSight/
├── config/
│   ├── db.js                 # MongoDB connection using Mongoose
│   ├── firebase.js           # Firebase Admin SDK with robust mock fallback
│   ├── socket.js             # Socket.IO WebSocket real-time engine
│   └── swagger.js            # Swagger OpenAPI 3.0 specification definition
├── controllers/
│   ├── authController.js     # User registration, login, profile, password change
│   ├── panelController.js    # Solar panel CRUD operations & access control
│   ├── generationController.js# Generation logging, stats & demo seeder
│   ├── consumptionController.js# Consumption tracking & appliance profiling
│   ├── gridController.js     # Bi-directional grid import/export balances
│   ├── billController.js     # Utility bill logging, prediction & monthly savings
│   ├── alertController.js    # Automated diagnostics, alerts list & resolution
│   ├── roiController.js      # ROI payback calculations & interactive scenario math
│   ├── weatherController.js  # Solar irradiance impact & 48-hr generation forecast
│   ├── compareController.js  # Anonymous neighborhood benchmark leaderboard
│   ├── notificationController.js# Multi-channel push notification dispatcher
│   └── advancedController.js # Battery storage, EV scheduler & carbon offset
├── middleware/
│   ├── authMiddleware.js     # JWT verification & role-based access control (RBAC)
│   ├── errorMiddleware.js    # Centralized error handler & 404 handler
│   └── validationMiddleware.js# express-validator request sanitation
├── models/
│   ├── User.js               # User accounts, role, tariff, installed capacity
│   ├── Panel.js              # Solar panel specifications & ownership
│   ├── Generation.js         # Solar power output (kW) & energy (kWh)
│   ├── Consumption.js        # Energy consumed (kWh) & appliance categories
│   ├── Bill.js               # Electricity bills, solar savings & net payable
│   ├── Alert.js              # System anomalies, maintenance notices & severity
│   └── Incentive.js          # Government solar subsidies & net metering claims
├── routes/
│   ├── authRoutes.js         # /api/auth endpoints
│   ├── panelRoutes.js        # /api/panels endpoints
│   ├── generationRoutes.js   # /api/generation endpoints
│   ├── consumptionRoutes.js  # /api/consumption endpoints
│   ├── gridRoutes.js         # /api/grid endpoints
│   ├── billRoutes.js         # /api/bills endpoints
│   ├── alertRoutes.js        # /api/alerts endpoints
│   ├── roiRoutes.js          # /api/roi endpoints
│   ├── weatherRoutes.js      # /api/weather endpoints
│   ├── compareRoutes.js      # /api/compare endpoints
│   ├── notificationRoutes.js # /api/notifications endpoints
│   └── advancedRoutes.js     # /api/advanced endpoints
├── utils/
│   └── calculations.js       # Mathematical formulas for grid, bills, ROI & CO2
├── services/
│   ├── weatherService.js     # Open-Meteo external solar API & caching
│   └── notificationService.js# Dispatcher for Socket.IO & Firebase FCM
├── postman/
│   ├── SolarSight.postman_collection.json # 30+ Postman requests with automated tests
│   └── SolarSight.postman_environment.json# Postman environment variables
├── app.js                    # Express app configuration & middleware mounts
├── server.js                 # HTTP & WebSocket server entry point
├── test_e2e.js               # 42-step automated verification test suite
├── .env                      # Local environment configuration
├── .env.example              # Environment variables template
└── package.json              # Dependencies and run scripts
```

---

## 🚀 Getting Started on macOS

### 1. Prerequisites
Ensure you have Node.js (>= 18) and MongoDB installed:
```bash
node -v
npm -v
mongod --version
```

### 2. Starting MongoDB
If using Homebrew on macOS:
```bash
brew services start mongodb/brew/mongodb-community
```
Or start MongoDB manually in a terminal:
```bash
mongod --config /usr/local/etc/mongod.conf
```
* **MongoDB Compass URI:** `mongodb://127.0.0.1:27017/SolarSightDB`

### 3. Environment Setup
The project requires a `.env` file in the root directory:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/SolarSightDB
JWT_SECRET=SolarSight_Omkar_2026_ChangeThisToARandomSecret_9xK7mP2q
WEATHER_API_KEY=
FIREBASE_SERVICE_ACCOUNT_PATH=
```

### 4. Running the Server
```bash
# Production start
npm start

# Development with automatic restart
npm run dev
```

The terminal will confirm:
```
MongoDB connected successfully!
☀️  SolarSight Server running at http://localhost:5001
📄  API Documentation: http://localhost:5001/api-docs
⚡  Socket.IO real-time engine ready on port 5001
```

---

## 🧪 Running Automated Tests

Run the built-in 42-step test suite:
```bash
node test_e2e.js
```
Expected output:
```
🎉 TEST SUMMARY: 42 / 42 PASSED (100% Pass Rate)
```

---

## 📑 Complete REST API Endpoint Directory

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile information | Yes |
| `PUT` | `/api/auth/change-password` | Update account password securely | Yes |

### 2. Solar Panels (`/api/panels`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/panels` | Register a new solar panel | Yes |
| `GET` | `/api/panels` | List all panels for authenticated user | Yes |
| `GET` | `/api/panels/:id` | Retrieve single panel by ID | Yes |
| `PUT` | `/api/panels/:id` | Update panel configuration | Yes |
| `DELETE` | `/api/panels/:id` | Delete solar panel | Yes |

### 3. Generation Telemetry (`/api/generation`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/generation` | Log real-time solar generation | Yes |
| `GET` | `/api/generation` | Summary stats & generation logs | Yes |
| `GET` | `/api/generation/panel/:id` | Generation history for specific panel | Yes |
| `POST` | `/api/generation/demo` | Seed 10-hour realistic daylight curve | Yes |

### 4. Electricity Consumption (`/api/consumption`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/consumption` | Record power & energy consumed | Yes |
| `GET` | `/api/consumption` | Consumption history & appliance stats | Yes |
| `GET` | `/api/consumption/panel/:id` | Consumption linked to subsystem | Yes |
| `POST` | `/api/consumption/demo` | Seed 12 kWh daily consumption profile | Yes |

### 5. Grid Balance (`/api/grid`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/grid/export` | Surplus power exported to grid & feed-in credit | Yes |
| `GET` | `/api/grid/import` | Grid power imported & import cost | Yes |

### 6. Electricity Bills & Savings (`/api/bills`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/bills` | Bill history & cumulative savings summary | Yes |
| `GET` | `/api/bills/predict` | Predict current month bill & solar savings | Yes |
| `GET` | `/api/bills/monthly` | Month-by-month financial ledger | Yes |
| `POST` | `/api/bills` | Record or update utility electricity bill | Yes |

### 7. Alerts & Diagnostics (`/api/alerts`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/alerts` | List all alerts (filter by severity/status) | Yes |
| `POST` | `/api/alerts/check` | Automated diagnostic check across panels | Yes |
| `GET` | `/api/alerts/:id` | Get details of a single alert | Yes |
| `PUT` | `/api/alerts/:id/read` | Mark alert as read | Yes |
| `PUT` | `/api/alerts/:id/resolve` | Mark alert as resolved | Yes |

### 8. Return on Investment (`/api/roi`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/roi` | Current system ROI and payback years remaining | Yes |
| `GET` | `/api/roi/calculate` | Scenario calculator for custom cost & capacity | Yes |

### 9. Weather & Solar Forecast (`/api/weather`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/weather/impact` | Solar efficiency impact from cloud cover & heat | Yes |
| `GET` | `/api/weather/forecast` | 48-hour hourly solar generation forecast | Yes |

### 10. Neighborhood Comparisons (`/api/compare`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/compare/neighbors` | Anonymous peer ranking (kWh/kW installed) | Yes |

### 11. Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/notifications/send` | Dispatch push notification (Socket.IO + FCM) | Yes |

### 12. Advanced Modules (`/api/advanced`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/advanced/battery` | Battery storage charging/discharging strategy | Yes |
| `GET` | `/api/advanced/ev-scheduler` | Clean EV charging during solar peak | Yes |
| `GET` | `/api/advanced/carbon-savings` | CO2 emissions avoided & trees equivalent | Yes |
| `GET` | `/api/advanced/incentives` | PM Surya Ghar subsidy claims & net metering | Yes |
| `POST` | `/api/advanced/incentives` | Submit government subsidy claim | Yes |

---

## 📮 Postman Collection Setup

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag and drop both files from `postman/`:
   - `SolarSight.postman_collection.json`
   - `SolarSight.postman_environment.json`
4. Select the environment **SolarSight Localhost Environment** in the top-right environment selector.
5. Run the requests in folder order:
   - **Health Check** (verifies backend is up)
   - **Authentication -> User Registration** (automatically extracts JWT token into `{{token}}`)
   - **Solar Panel CRUD -> Create Panel** (automatically saves `{{panelId}}`)
   - **Energy Readings -> Seed Demo Generation**
   - **Energy Readings -> Seed Demo Consumption**
   - **Grid Import & Export**
   - **Electricity Bills**
   - **Alerts & Diagnostics**
   - **ROI Analytics**
   - **Weather Impact**
   - **Anonymous Neighborhood Comparison**
   - **Advanced Modules**

---

## ☁️ Deployment Guide (Render / Heroku)

### Render Deployment
1. Push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Web Service**.
3. Select your repository.
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Under **Environment Variables**, add:
   - `MONGO_URI`: Your MongoDB Atlas connection string (`mongodb+srv://<user>:<password>@cluster.mongodb.net/SolarSightDB`)
   - `JWT_SECRET`: A long random secret key
   - `NODE_ENV`: `production`
7. Click **Create Web Service**. Your API will be live with HTTPS!
# backend-project
