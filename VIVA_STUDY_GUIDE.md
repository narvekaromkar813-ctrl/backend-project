# 🎓 SolarSight — Complete Viva Preparation & Conceptual Study Guide

> **Tailored for First-Year B.Tech Computer Science Students**  
> **Topic:** Backend Engineering, Node.js, Express.js, MongoDB, WebSockets & Security  
> **Project:** SolarSight — Solar Panel Monitoring System (Case Study 59)

---

## 🌟 Table of Contents
1. [Core Architectural Concepts (MVC, REST, CRUD)](#1-core-architectural-concepts)
2. [Database Foundations (MongoDB & Mongoose)](#2-database-foundations)
3. [Authentication, Authorization & Cryptography](#3-authentication-authorization--cryptography)
4. [Middleware & Request Lifecycles](#4-middleware--request-lifecycles)
5. [Real-time Communication (Socket.IO vs HTTP)](#5-real-time-communication)
6. [Solar Domain Knowledge (Engineering Concepts for Viva)](#6-solar-domain-knowledge)
7. [Frequently Asked Viva Questions & Model Answers](#7-frequently-asked-viva-questions--model-answers)

---

## 1. Core Architectural Concepts

### What is a REST API?
* **REST** stands for **Representational State Transfer**.
* It is an architectural style for networked applications that uses standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) to perform operations on resources identified by URIs (e.g., `/api/panels`).
* **Statelessness:** Every single request from the client must contain all the information necessary for the server to understand and process the request. The server never stores client session state between requests.

### What is CRUD?
CRUD represents the four fundamental operations of persistent storage:
| Operation | HTTP Method | Example SolarSight Endpoint |
|---|---|---|
| **Create** | `POST` | `POST /api/panels` (Register new panel) |
| **Read** | `GET` | `GET /api/panels` or `GET /api/panels/:id` |
| **Update** | `PUT` / `PATCH` | `PUT /api/panels/:id` (Update efficiency/status) |
| **Delete** | `DELETE` | `DELETE /api/panels/:id` (Remove panel) |

### What is the MVC Pattern in Express?
SolarSight uses the **MVC (Model-View-Controller)** pattern (with JSON APIs acting as the View):
* **Model (`/models`):** Defines database structure, rules, constraints, and relationships (e.g., `User.js`, `Panel.js`).
* **View:** In a backend REST API, the "View" is the JSON payload formatted and returned to the client.
* **Controller (`/controllers`):** Contains the business logic, handles data transformations, executes calculations, and interfaces between models and HTTP responses.
* **Routes (`/routes`):** Maps URLs and HTTP methods to their corresponding controller functions and attaches validation and authentication middleware.

---

## 2. Database Foundations (MongoDB & Mongoose)

### What is MongoDB?
* MongoDB is a **NoSQL, document-oriented database**.
* Instead of storing data in rigid tabular rows and columns (like SQL/MySQL), MongoDB stores data in flexible, JSON-like **BSON (Binary JSON)** documents.
* Key terms comparison:
  * SQL Table $\rightarrow$ MongoDB **Collection**
  * SQL Row/Record $\rightarrow$ MongoDB **Document**
  * SQL Column $\rightarrow$ MongoDB **Field**

### What is Mongoose?
* Mongoose is an **Object Data Modeling (ODM)** library for MongoDB and Node.js.
* It provides schema validation, type casting, query building, lifecycle hooks, and relationship population (`populate()`).

### Schema vs Model
* **Schema:** The architectural blueprint defining document fields, data types, default values, and validators (e.g., `const userSchema = new mongoose.Schema({ name: String });`).
* **Model:** The compiled constructor compiled from the schema that provides the interface to query and manipulate the collection (e.g., `const User = mongoose.model('User', userSchema); User.create({...})`).

### What is `_id` and ObjectId?
* Every MongoDB document automatically receives a unique 12-byte identifier called `_id` of type `ObjectId`.
* It consists of:
  * 4-byte timestamp (creation time)
  * 5-byte random value unique to machine and process
  * 3-byte incrementing counter

---

## 3. Authentication, Authorization & Cryptography

### Authentication vs Authorization
* **Authentication ("Who are you?"):** Verifying the user's identity using credentials (email and password via `POST /api/auth/login`).
* **Authorization ("What are you allowed to do?"):** Determining whether an authenticated user has permission to access a specific resource (e.g., standard users can only read their own panels; only `admin` can inspect all systems).

### What is a JWT (JSON Web Token)?
A JWT is a compact, URL-safe token used for stateless authentication. It consists of three parts separated by dots (`.`):
1. **Header:** Contains token type (`JWT`) and hashing algorithm (`HS256`).
2. **Payload:** Contains claims/data (e.g., `{ userId: "6abf...", role: "user", exp: 1730000000 }`).
3. **Signature:** Created by hashing the encoded header + encoded payload using the secret key (`JWT_SECRET`):
   $$\text{HMACSHA256}(\text{base64UrlEncode}(\text{Header}) + "." + \text{base64UrlEncode}(\text{Payload}), \text{secret})$$

### How does bcrypt hashing work?
* We **never store plain-text passwords**.
* **Salt:** A cryptographically random string generated and prepended to the password before hashing. This defeats "Rainbow Table" lookup attacks.
* **One-Way Hash:** The password cannot be reversed or decrypted. When the user logs in, `bcrypt.compare(enteredPassword, storedHash)` hashes the entered password with the stored salt and checks if the hashes match.

---

## 4. Middleware & Request Lifecycles

### What is Middleware in Express?
Middleware functions are functions that have access to the request object (`req`), the response object (`res`), and the `next` function in the application's request-response cycle.

```
Incoming Request ──> Helmet (Security Headers)
                  ──> CORS (Cross-Origin Policy)
                  ──> express.json (Body Parser)
                  ──> morgan (HTTP Logging)
                  ──> authMiddleware (JWT Check)
                  ──> validationMiddleware (Data Sanitation)
                  ──> Controller Logic
                  ──> JSON Response
```

### Key Middlewares used in SolarSight:
1. **`helmet`:** Sets secure HTTP response headers to protect against common web vulnerabilities (XSS, clickjacking).
2. **`cors`:** Allows browser clients hosted on different ports/domains (e.g., React frontend on port 3000) to communicate with the backend.
3. **`morgan`:** Logs HTTP requests (method, route, status code, response time) to the terminal for debugging.
4. **`express-validator`:** Checks incoming request bodies (e.g., email format, minimum password length) before the controller executes.
5. **Centralized Error Handler (`errorMiddleware`):** Captures uncaught errors, prevents server crashes, and safely masks database stack traces in production.

---

## 5. Real-time Communication (Socket.IO vs HTTP)

### Why Socket.IO instead of pure REST?
* Standard HTTP is **request-response (half-duplex)**: The client must ask for data; the server cannot proactively push data to the client.
* **Socket.IO provides persistent, bi-directional, full-duplex WebSocket connections**:
  * When a panel drops to 0 kW during sunlight, the server **instantly pushes** an `alert:new` event to all open dashboards without polling!
  * Solar telemetry streams continuously via `generation:update`.

---

## 6. Solar Domain Knowledge (Engineering Concepts for Viva)

### Power (kW) vs Energy (kWh)
| Concept | Unit | Definition | Everyday Analogy |
|---|---|---|---|
| **Power** | **Kilowatt (kW)** | Instantaneous rate of electricity generation or demand | Speed of a car ($60\text{ km/h}$) |
| **Energy** | **Kilowatt-Hour (kWh)** | Total amount of electricity produced or consumed over time | Distance traveled ($60\text{ km/h} \times 2\text{ hours} = 120\text{ km}$) |

$$\text{Energy (kWh)} = \text{Power (kW)} \times \text{Time (Hours)}$$

### Net-Metering Balance
* **Self-Consumption:** Solar power generated that is immediately consumed by home appliances.
* **Grid Export:** Excess solar power sent back to the public utility grid when generation exceeds consumption:
  $$\text{Exported kWh} = \max(0, \text{Generation} - \text{Consumption})$$
* **Grid Import:** Power drawn from the utility when consumption exceeds solar production:
  $$\text{Imported kWh} = \max(0, \text{Consumption} - \text{Generation})$$

### Return on Investment (ROI) & Payback Formula
* **System Cost:** Total capital expenditure (e.g., ₹2,50,000 for 5 kW).
* **Net Annual Savings:** Total electricity bill avoided minus annual maintenance cost (~1%):
  $$\text{Payback Period (Years)} = \frac{\text{Total Capital Cost}}{\text{Net Annual Savings}}$$
  $$\text{Remaining Years} = \max(0, \text{Payback Period} - \text{Years In Service})$$

### Weather & Solar Irradiance Impact
* Solar panels are rated under **Standard Test Conditions (STC)**: $1000\text{ W/m}^2$ irradiance and $25^\circ\text{C}$ cell temperature.
* **Derating Factors:**
  1. **Cloud Attenuation:** Heavy cloud cover can reduce irradiance by up to 75%.
  2. **Thermal Derating:** Solar cell efficiency degrades by ~0.4% for every $1^\circ\text{C}$ above $25^\circ\text{C}$.

---

## 7. Frequently Asked Viva Questions & Model Answers

### Q1: What happens if MongoDB fails to connect on startup?
> **Answer:** In `config/db.js`, the connection is wrapped in a `try...catch` block. If connection fails, the error message is logged to `console.error` and `process.exit(1)` terminates the process cleanly to prevent running in an undefined state.

### Q2: Why did you use CommonJS (`require`) instead of ES Modules (`import`)?
> **Answer:** The existing codebase was structured using CommonJS, and package dependencies in Node.js LTS reliably support CommonJS without needing build steps or `"type": "module"` configuration flags.

### Q3: How do you prevent one user from editing or deleting another user's solar panels?
> **Answer:** In `panelController.js`, before updating or deleting any panel, we verify that `panel.user.toString() === req.user._id.toString()`. If the IDs do not match and the user is not an `admin`, we reject the request with HTTP `403 Forbidden`.

### Q4: Why is password hashing done with bcrypt instead of MD5 or SHA256?
> **Answer:** MD5 and SHA256 are fast general-purpose hash functions vulnerable to brute-force and rainbow table attacks. `bcrypt` is a slow, salted, CPU-intensive key derivation function with an adjustable work factor (salt rounds = 10) that makes brute-force attacks computationally infeasible.

### Q5: What is the purpose of `.env.example`?
> **Answer:** `.env` contains confidential API keys and secrets and is added to `.gitignore` so it is never committed to Git. `.env.example` provides a template showing other developers what environment variable keys are required to run the project without exposing real secrets.

### Q6: How does the `/api/alerts/check` endpoint detect underperforming panels?
> **Answer:** It fetches telemetry over the last 24 hours during daylight hours (8 AM to 5 PM). If average generation is less than 40% of rated capacity, or if power output is zero during peak irradiance, it creates an `Alert` record and immediately emits a real-time event via Socket.IO.

### Q7: What is the difference between HTTP status codes 401 and 403?
> **Answer:** 
> * **`401 Unauthorized`:** The user is unauthenticated (missing or invalid JWT token).
> * **`403 Forbidden`:** The user is authenticated, but their identity or role does not have permission to access that specific resource.
