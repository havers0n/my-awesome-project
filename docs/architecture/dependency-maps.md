# Карты зависимостей системы

## 1. Frontend Dependencies

### Import Graph
```mermaid
graph TD
    %% Entry Point
    main.tsx["main.tsx<br/>(Entry Point)"] --> App.tsx
    main.tsx --> index.css
    main.tsx --> ThemeProvider
    main.tsx --> AuthProvider
    main.tsx --> QueryClient["@tanstack/react-query"]
    main.tsx --> BrowserRouter["react-router-dom"]
    main.tsx --> ErrorBoundary
    
    %% App Component Dependencies
    App.tsx --> Routes["react-router-dom Routes"]
    App.tsx --> supabaseClient
    App.tsx --> ProtectedRoute
    App.tsx --> AppLayout
    App.tsx --> LazyComponents["Lazy Loaded Pages"]
    
    %% Context Providers
    AuthContext --> supabaseClient
    AuthContext --> axios
    AuthContext --> Session["@supabase/supabase-js"]
    
    ThemeContext --> localStorage
    ThemeContext --> DocumentRoot["document.documentElement"]
    
    SidebarContext --> WindowAPI["window.innerWidth"]
    
    %% API Layer
    forecast.ts --> axios
    forecast.ts --> localStorage
    forecast.ts --> MLError["Error Handling"]
    
    %% Layout Components
    AppLayout --> AppSidebar
    AppLayout --> AppHeader
    AppLayout --> SidebarContext
    AppLayout --> Backdrop
    
    %% Pages
    SalesForecastPage --> Chart.js
    SalesForecastPage --> useForecast
    SalesForecastPage --> forecast.ts
    
    %% External Dependencies
    style main.tsx fill:#f9f,stroke:#333,stroke-width:4px
    style AuthContext fill:#bbf,stroke:#333,stroke-width:2px
    style forecast.ts fill:#bbf,stroke:#333,stroke-width:2px
    style Chart.js fill:#fbb,stroke:#333,stroke-width:2px
    style axios fill:#fbb,stroke:#333,stroke-width:2px
    style supabaseClient fill:#fbb,stroke:#333,stroke-width:2px
```

### Critical External Packages
```mermaid
graph LR
    Frontend[Frontend App] --> React["React 19.1.0"]
    Frontend --> Router["react-router-dom 7.6.2"]
    Frontend --> Auth["@supabase/supabase-js 2.50.0"]
    Frontend --> HTTP["axios 1.9.0"]
    Frontend --> Charts["chart.js 4.4.1"]
    Frontend --> ApexCharts["apexcharts 4.1.0"]
    Frontend --> Query["@tanstack/react-query 5.81.5"]
    Frontend --> UI["lucide-react 0.518.0"]
    Frontend --> Forms["react-dropzone 14.3.5"]
    Frontend --> Calendar["@fullcalendar/* 6.1.15"]
    Frontend --> Styling["tailwind 4.0.8"]
    
    style Frontend fill:#9f9,stroke:#333,stroke-width:4px
    style React fill:#fbb,stroke:#333,stroke-width:2px
    style Auth fill:#fbb,stroke:#333,stroke-width:2px
    style HTTP fill:#fbb,stroke:#333,stroke-width:2px
    style Charts fill:#fbb,stroke:#333,stroke-width:2px
```

## 2. Backend Dependencies

### Import Graph
```mermaid
graph TD
    %% Entry Point
    app.ts["app.ts<br/>(Entry Point)"] --> dotenv
    app.ts --> express
    app.ts --> cors
    app.ts --> helmet
    app.ts --> rateLimit["express-rate-limit"]
    app.ts --> pino
    app.ts --> winston
    
    %% Routes
    app.ts --> authRoutes
    app.ts --> forecastRoutes
    app.ts --> adminRoutes
    app.ts --> healthRoutes
    app.ts --> uploadRoutes
    app.ts --> monetizationRoutes
    
    %% Middleware
    app.ts --> supabaseAuthMiddleware
    authRoutes --> dualAuthMiddleware
    adminRoutes --> rbacMiddleware
    
    %% Controllers
    forecastRoutes --> forecastController
    forecastController --> supabaseUserClient
    forecastController --> mlPayloadFormatter
    forecastController --> mlServiceUtils
    forecastController --> axios
    forecastController --> zod
    
    %% Services/ETL
    worker.js["worker.js<br/>(ETL Worker)"] --> pg
    worker.js --> etlHelpers
    worker.js --> etlDb
    etlHelpers --> supabaseAdminClient
    
    %% External Services
    forecastController --> ML_SERVICE["ML Service<br/>(HTTP)"]
    supabaseUserClient --> SUPABASE["Supabase API"]
    etlDb --> POSTGRES["PostgreSQL"]
    
    style app.ts fill:#f9f,stroke:#333,stroke-width:4px
    style worker.js fill:#f9f,stroke:#333,stroke-width:4px
    style ML_SERVICE fill:#bfb,stroke:#333,stroke-width:2px
    style SUPABASE fill:#bfb,stroke:#333,stroke-width:2px
    style POSTGRES fill:#bfb,stroke:#333,stroke-width:2px
```

### Critical External Packages
```mermaid
graph LR
    Backend[Backend App] --> Express["express 5.1.0"]
    Backend --> Database["pg 8.16.0"]
    Backend --> Auth["@supabase/supabase-js 2.50.4"]
    Backend --> HTTP["axios 1.10.0"]
    Backend --> Validation["zod 3.22.0"]
    Backend --> Security["helmet 8.1.0"]
    Backend --> JWT["jsonwebtoken 9.0.2"]
    Backend --> Logging["winston 3.11.0<br/>pino 9.7.0"]
    Backend --> FileUpload["multer 1.4.5"]
    Backend --> CSV["csv-parser 3.0.0"]
    
    style Backend fill:#9f9,stroke:#333,stroke-width:4px
    style Express fill:#fbb,stroke:#333,stroke-width:2px
    style Database fill:#fbb,stroke:#333,stroke-width:2px
    style Auth fill:#fbb,stroke:#333,stroke-width:2px
```

## 3. ML Service Dependencies

### Import Graph
```mermaid
graph TD
    %% Entry Point
    api_main.py["api_main.py<br/>(Entry Point)"] --> fastapi["FastAPI"]
    api_main.py --> pydantic
    api_main.py --> pandas
    api_main.py --> numpy
    api_main.py --> pickle
    
    %% Internal Modules
    api_main.py --> features
    api_main.py --> error_handler
    api_main.py --> cache_manager
    api_main.py --> metrics_collector
    
    %% Model Loading
    api_main.py --> load_latest_model
    load_latest_model --> MODEL["model-*.pkl"]
    
    %% Feature Engineering
    features --> LagMaker
    features --> safe_mape
    
    %% Error Handling
    error_handler --> ModelError
    error_handler --> DataProcessingError
    error_handler --> ExternalServiceError
    
    %% Caching & Metrics
    cache_manager --> redis
    cache_manager --> hashlib
    metrics_collector --> prometheus_client
    
    %% Training Pipeline
    train.py --> lightgbm
    train.py --> sklearn
    train.py --> pandas
    train.py --> features
    
    %% External Services
    api_main.py --> REDIS["Redis Cache"]
    api_main.py --> POSTGRES["PostgreSQL<br/>(if needed)"]
    
    style api_main.py fill:#f9f,stroke:#333,stroke-width:4px
    style train.py fill:#f9f,stroke:#333,stroke-width:4px
    style REDIS fill:#bfb,stroke:#333,stroke-width:2px
    style POSTGRES fill:#bfb,stroke:#333,stroke-width:2px
```

### Critical External Packages
```mermaid
graph LR
    MLService[ML Service] --> FastAPI["fastapi"]
    MLService --> ML["lightgbm<br/>scikit-learn"]
    MLService --> Data["pandas<br/>numpy"]
    MLService --> Server["uvicorn"]
    MLService --> Validation["pydantic"]
    MLService --> Database["psycopg2-binary"]
    MLService --> Cache["redis"]
    MLService --> Monitoring["prometheus-client"]
    MLService --> Async["aiofiles"]
    MLService --> Queue["celery"]
    
    style MLService fill:#9f9,stroke:#333,stroke-width:4px
    style FastAPI fill:#fbb,stroke:#333,stroke-width:2px
    style ML fill:#fbb,stroke:#333,stroke-width:2px
    style Data fill:#fbb,stroke:#333,stroke-width:2px
```

## 4. System-Wide Data Flow

### Sales Forecasting Chain
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant ML
    participant DB as Database
    participant Redis
    
    User->>Frontend: Request Forecast
    Frontend->>Backend: POST /api/predictions/predict
    Backend->>Backend: Validate Auth Token
    Backend->>DB: Fetch Operations Data
    DB-->>Backend: Operations Records
    Backend->>Backend: Format ML Payload
    Backend->>ML: POST /forecast
    ML->>Redis: Check Cache
    Redis-->>ML: Cache Miss
    ML->>ML: Generate Features
    ML->>ML: Run LightGBM Model
    ML->>Redis: Store Result
    ML-->>Backend: Predictions
    Backend->>DB: Save Predictions
    Backend-->>Frontend: Forecast Results
    Frontend-->>User: Display Charts
```

## 5. Critical Dependencies Summary

### Frontend
- **Core**: React 19, React Router 7
- **Authentication**: Supabase JS Client
- **Data Fetching**: Axios, React Query
- **Visualization**: Chart.js, ApexCharts
- **UI**: Tailwind CSS, Lucide Icons

### Backend
- **Core**: Express 5, Node.js
- **Database**: PostgreSQL (pg), Supabase
- **Security**: Helmet, JWT, Rate Limiting
- **Validation**: Zod
- **Logging**: Winston, Pino

### ML Service
- **Core**: FastAPI, Python
- **ML**: LightGBM, Scikit-learn
- **Data**: Pandas, NumPy
- **Caching**: Redis
- **Monitoring**: Prometheus

### Inter-Service Communication
- Frontend ↔ Backend: REST API (Axios)
- Backend ↔ ML Service: REST API (Axios)
- Backend ↔ Database: pg/Supabase Client
- ML Service ↔ Redis: Redis Client
- Backend ↔ Supabase: Supabase Admin/User Clients
