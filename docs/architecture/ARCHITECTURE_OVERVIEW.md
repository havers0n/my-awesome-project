# ARCHITECTURE_OVERVIEW.md

## Component Diagram

```
+------------------+      +-----------------+      +--------------------+       +------------------+
|  Frontend (SPA)  | ---> |   Backend API   | ---> |   ML Microservice  | --->  |    Database      |
| (React+Nginx)    |      | (Node/Express)  |      |  (FastAPI+Python)  |       |  (Postgres/Supa) |
+------------------+      +-----------------+      +--------------------+       +------------------+
         ^                      |   ^                        |                       ^
         |                      |   |                        |                       |
         |                    User Auth                    Model inferences         Data
         |                                                                   CRUD, Analytics
         +-----------------------------------------------------------------------+
                                 Internal Service
```


## Request flow

**1. User action in Frontend (React app)**
- User triggers `/sales-forecast` page/request.
  - API request: `/api/predictions/forecast` (GET/POST)
  
**2. Backend (Node/Express)**
- Endpoint `/api/predictions/forecast` handled by backend
- Backend verifies Authorization (JWT, Supabase user)
- Backend fetches sales/operations data from Postgres via Supabase client
- Prepares payload for ML microservice, calls `ML_SERVICE_URL` endpoint (`/forecast` on ML service)

**3. ML Microservice (FastAPI/Python)**
- Endpoint `/forecast` receives sales/operations history + desired horizon
- Loads latest .pkl model, runs prediction
- Returns metrics & product-level forecast (MAPE, MAE, product QTY)

**4. Backend**
- Persists results to DB (`prediction_runs`, `predictions` tables)
- Returns forecast metrics and product predictions to frontend

**5. Frontend**
- Renders trend graphs, top products, accuracy, history, utilizing forecast API response

---

## Runtimes & Images

| Component      | Base Image / Version   | Exposed Port |
| -------------- | --------------------- | ------------ |
| Frontend       | node:18-alpine, nginx:stable-alpine |   80         |
| Backend        | node:18-alpine        |   3000       |
| ML Service     | python (likely >=3.9) |   5678       |
| Database       | postgres (Supabase)   |   5432       |

See `Dockerfile`, `docker-compose.yml` for details.

---

## Environment Variables (Backend)

From `.env`, `config.ts`, and service clients:

- DB_HOST: Database hostname
- DB_PORT: Database port
- DB_NAME: Database name
- DB_USER: Database user
- DB_PASSWORD: Database password
- JWT_SECRET: Secret for backend JWT issuance
- JWT_EXPIRES_IN: JWT TTL (default 1d; see `config.ts`)
- SUPABASE_URL: Supabase instance URL
- SUPABASE_SERVICE_ROLE_KEY: Admin key for Supabase service
- SUPABASE_ANON_KEY: Public anon key for client
- ML_SERVICE_URL: ML service endpoint (default `http://localhost:5000/predict`, set in `forecastController.ts`)
- FRONTEND_URL: Used for CORS (optional; value in .env)
- PORT: (backend) HTTP port (default 3000)

---

## External ports & internal service names

From docker-compose:

- **backend**: service `backend`, container port 3000 exposed as 3000
- **frontend**: service `frontend`, container port 80 exposed as 80
- **db**: (external, via Supabase-hosted Postgres at `db.uxcsziylmyogvcqyyuiw.supabase.co:5432`)
- **ML microservice**: runs on port 5678 (not in docker-compose, see `time_series_1.py`)

---

## Key Tables/Schema (see `database/schema.sql`)

- `forecasts`, `operations`, `products`, `prediction_runs`, `predictions`, `users`, etc.
- Designed for storing input sales/operations, model runs, product details, and forecasts.

---

## Diagram (Textual)

```
   [Browser]
      |
      v
[NGINX frontend (80)] ──► [Backend API (3000)] ──► [ML Service (5678)] ──► [Supabase/Postgres (5432)]
```

## Notes
- You may need to inject and configure `ML_SERVICE_URL` in the backend env if you deploy the ML microservice to a non-localhost address or docker network.
- All requests from frontend to backend go through `/api/predictions/*` endpoints.
- Supabase/Postgres connection is done *from inside backend container* using env vars above.
- ML service is called from backend using `ML_SERVICE_URL` (POST /forecast with payload).

---

## Summary Table

| Step                           | Route                          | Container       | Port     |
| ------------------------------ | ------------------------------ | -------------- | -------  |
| Sales forecast trigger         | `/api/predictions/forecast`    | backend        | 3000     |
| ML forecast inference          | `/forecast` (internal, Python) | ml (not in yml) | 5678    |
| DB Save & read                 | (Postgres/Supabase)            | N/A (ext.)     | 5432     |
| Frontend access                | `/` (SPA static)               | frontend       | 80       |


