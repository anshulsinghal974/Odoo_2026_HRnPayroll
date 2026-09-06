# PeoplePay360 — Next-Gen HR & Payroll Operations Platform 🚀

Welcome to **PeoplePay360**, a fully integrated, intelligent HR and Payroll platform. Unlike traditional tools built around disconnected CRUD screens, PeoplePay360 operates as a cohesive system where every module intelligently feeds into the next. 

Employee records form the central hub, Contracts dictate payroll contexts, Time Off tracks daily activity, and our **Machine Learning Engine** acts as the intelligent layer to prevent errors, predict trends, and analyze risk.

---

## 🏗️ Project Architecture

This repository is built using a modern microservices architecture, divided into three core pillars:

### 1. Frontend (React / Vite)
- **Location:** `/frontend`
- **Role:** The user-facing dashboard for HR Managers and Admins.
- **Features:** Interactive attendance kanban boards, drag-and-drop schedule management, visual payroll wizards, and ML-powered dashboard widgets.

### 2. Backend (Node.js / Express / PostgreSQL)
- **Location:** `/backend`
- **Role:** The core business logic and database management layer.
- **Features:** Centralized data storage, CRUD operations for employees, payroll calculations, schedule allocations, and API routing.

### 3. Machine Learning Microservice (Python / FastAPI)
- **Location:** `/ml-service`
- **Role:** The intelligent analytics and prediction engine.
- **Features:** 
  - **Smart Payroll Warnings:** Detects duplicate payslips and unusual salary spikes before a payrun is executed.
  - **Attendance Anomalies:** Uses Z-scores to flag irregular check-ins and bulk badge swipes.
  - **Leave Pattern Prediction:** Time-series forecasting for upcoming leave spikes.
  - **Salary Cost Forecasting:** Linear regression models predicting future payroll budgets.
  - **Attrition Risk Scoring:** Logistic-style risk assessment to identify employees at high risk of resigning.
  - **NLP Query Assistant:** Powered by **Google Gemini 3.6 Flash**, allowing HR to ask plain English questions about their data.

### 4. Shared API Contracts
- **Location:** `/shared`
- **Role:** Contains documentation, OpenAPI specs, and markdown contracts so the Frontend, Backend, and ML services stay perfectly in sync during development.

---

## 🚀 Getting Started

You need **three terminals** (ML, backend, frontend). Run Git commands from the **repo root** (`Odoo_2026_HRnPayroll`), not from inside `backend/`.

**Prerequisites**
- Node.js 18+ and npm
- Python 3.11+ (3.13/3.14 also works if packages install)
- PostgreSQL running locally
- A [Google Gemini API key](https://aistudio.google.com/apikey) (NLP assistant only)

Create the database once:

```sql
CREATE DATABASE peoplepay360;
```

---

### 1. ML service (`ml-service`) — port 8000

```bash
cd ml-service
pip install -r requirements.txt
```

Set the Gemini key **in the same terminal** you use to start the server.

**PowerShell (Windows):**

```powershell
$env:GEMINI_API_KEY="your_key_here"
python -m uvicorn app.main:app --reload
```

Use `python -m uvicorn` if `uvicorn` is not recognized (Scripts folder not on PATH).

**Command Prompt (Windows):**

```cmd
set GEMINI_API_KEY=your_key_here
python -m uvicorn app.main:app --reload
```

**macOS / Linux:**

```bash
export GEMINI_API_KEY="your_key_here"
python -m uvicorn app.main:app --reload
```

Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for Swagger UI, or [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) for a health check.

The key is only in that terminal session. Set it again if you open a new window.

---

### 2. Backend (`backend`) — port 3000

PostgreSQL must be running. From a **new terminal**:

```bash
cd backend
```

Copy env and edit `DATABASE_URL` (user, password, host, database name):

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

`.env` should look like:

```
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/peoplepay360?schema=public"
JWT_SECRET="change-me"
JWT_EXPIRES_IN="24h"
ML_SERVICE_URL="http://localhost:8000"
ML_SERVICE_TIMEOUT_MS=5000
```

Email settings are optional for local run.

Then:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

- API: [http://localhost:3000](http://localhost:3000)
- Health: [http://localhost:3000/health](http://localhost:3000/health) (`{"status":"ok","db":"connected"}`)

Seed logins (password for all: `Password123!`):

| Email | Role |
|---|---|
| `admin@peoplepay360.com` | ADMIN |
| `hr.manager@peoplepay360.com` | HR_MANAGER |
| `hr.payroll.user@peoplepay360.com` | HR_PAYROLL_USER |
| `hr.payroll.manager@peoplepay360.com` | HR_PAYROLL_MANAGER |
| `employee@peoplepay360.com` | EMPLOYEE |

Reset DB + reseed: `npm run db:reset` (destructive).

---

### 3. Frontend (`frontend`) — Vite (usually port 5173)

The UI talks to the backend via `VITE_API_URL`. Default in code is port **5000**; local backend is **3000**, so set this explicitly.

From a **new terminal**:

```bash
cd frontend
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

`frontend/.env`:

```
VITE_API_URL=http://localhost:3000/api
```

Then:

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically [http://localhost:5173](http://localhost:5173)). Log in with a seed account above.

Restart `npm run dev` after changing `.env` — Vite only reads it at startup.

---

### Quick check

| Service | Command | URL |
|---|---|---|
| ML | `python -m uvicorn app.main:app --reload` | http://127.0.0.1:8000/docs |
| Backend | `npm run dev` (in `backend`) | http://localhost:3000/health |
| Frontend | `npm run dev` (in `frontend`) | http://localhost:5173 |

Start ML, then backend, then frontend so payroll/ML widgets can reach the ML service.

---

## 🧠 Machine Learning Engine Deep Dive
The ML service operates independently to ensure heavy statistical processing does not block standard CRUD operations. 
*   **Zero-State Architecture:** The ML service does not connect directly to PostgreSQL. Instead, the Node.js backend fetches the required context and sends it to the ML endpoints for stateless evaluation.
*   **Synthetic Training:** The ML models are trained dynamically on server startup using the `seed_synthetic_data.py` script, which generates realistic historical HR datasets for the models to learn from.

## 🤝 Team
Built collaboratively for the 2026 Hackathon:
*   **Person 1:** Frontend & UI/UX Design
*   **Person 2:** Backend & Database Architecture 
*   **Person 3:** ML & Intelligent Layer Stack
