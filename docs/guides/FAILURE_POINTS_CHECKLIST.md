# Failure Points Checklist for Each Component

## 1. Database Component

### 1.1 Connection Errors
**Common Causes:**
- Database server is down
- Network connectivity issues
- Invalid connection string
- SSL/TLS certificate problems

**Specific Error Examples:**
```
Error connecting to the database: error: connect ECONNREFUSED 127.0.0.1:5432
Error connecting to the database: error: password authentication failed for user "postgres"
Error connecting to the database: error: database "postgres" does not exist
```

**Logging Location:** 
- `backend/src/db.ts` (lines 12-14)
- Console logs with prefix: "Error connecting to the database:"

### 1.2 Pool Exhaustion / Connection Limits
**Common Causes:**
- Too many concurrent connections
- Connections not being released properly
- Missing connection pool configuration

**Specific Error Examples:**
```
Error: remaining connection slots are reserved for non-replication superuser connections
Error: sorry, too many clients already
```

**Logging Location:**
- PostgreSQL logs: `/var/lib/postgresql/data/pg_log/`
- Pool errors captured in `backend/src/db.ts`

### 1.3 Transaction Failures
**Common Causes:**
- Deadlocks between concurrent transactions
- Lock timeout exceeded
- Constraint violations

**Specific Error Examples:**
```
Error: deadlock detected
Error: canceling statement due to lock timeout
Error: duplicate key value violates unique constraint "products_code_organization_id_key"
```

**Logging Location:**
- `backend/src/worker.js` (line 53) - rollback scenarios
- `backend/src/services/etlHelpers.js` - transaction management

### 1.4 Data Integrity Issues
**Common Causes:**
- Foreign key violations
- NULL values in NOT NULL columns
- Check constraint violations

**Specific Error Examples:**
```
Error: insert or update on table "operations" violates foreign key constraint "operations_product_id_fkey"
Error: null value in column "organization_id" violates not-null constraint
```

**Logging Location:**
- ETL error logs in worker process
- Supabase query errors in `backend/src/services/etlHelpers.js`

## 2. ETL (Extract, Transform, Load) Component

### 2.1 Data Format Issues
**Common Causes:**
- Inconsistent date formats
- Invalid numeric values
- Encoding problems (UTF-8 vs other encodings)
- Missing required fields

**Specific Error Examples:**
```
DataProcessingError: Ошибка при преобразовании данных: Invalid date format
DataProcessingError: Cannot read property 'nomenclature' of undefined
Error: invalid input syntax for type integer: "N/A"
```

**Logging Location:**
- `backend/src/controllers/forecastController.ts` (lines 153-154)
- `ml/api_main.py` (lines 152-154) - data transformation errors

### 2.2 Product Mapping Failures
**Common Causes:**
- Product code mismatches
- Changed product nomenclature
- Missing product in reference tables
- Case sensitivity issues

**Specific Error Examples:**
```
[ERROR] Ошибка при обработке sales_input ID: 12345. Ошибка: Product not found
Warning: Unmapped products in prediction: 15 out of 50 products could not be mapped
```

**Logging Location:**
- `backend/src/worker.js` (line 53)
- `backend/src/controllers/forecastController.ts` (lines 170-184)

### 2.3 Queue Processing Errors
**Common Causes:**
- PGMQ connection failures
- Message parsing errors
- Worker crashes
- Message visibility timeout

**Specific Error Examples:**
```
Error in worker loop: error: relation "pgmq.queue" does not exist
Error: Message visibility timeout exceeded, message returned to queue
```

**Logging Location:**
- `backend/src/worker.js` (lines 94-95)
- PGMQ system tables

### 2.4 Bulk Insert Performance Issues
**Common Causes:**
- Large batch sizes causing timeouts
- Memory exhaustion
- Index rebuild overhead

**Specific Error Examples:**
```
Error: statement timeout
Error: out of memory for query result
```

**Logging Location:**
- PostgreSQL slow query log
- Worker process memory usage logs

## 3. ML (Machine Learning) Service

### 3.1 Model Loading Failures
**Common Causes:**
- Missing model file
- Corrupted pickle file
- Version incompatibility (Python/library versions)
- Insufficient memory

**Specific Error Examples:**
```
ModelError: Нет обученных моделей в директории /models
ModelError: Ошибка загрузки модели: unsupported pickle protocol: 5
ModelError: Модель не может делать предсказания на тестовых данных
```

**Logging Location:**
- `ml/api_main.py` (lines 30-37, 56-57)
- `ml/error_handler.py` - structured error logging

### 3.2 Prediction Failures
**Common Causes:**
- Feature mismatch (missing columns)
- Invalid input data types
- NaN or infinite values
- Memory overflow for large batches

**Specific Error Examples:**
```
ModelError: Ошибка при прогнозировании: Input contains NaN, infinity or a value too large
ModelError: Expected 25 features, got 23
```

**Logging Location:**
- `ml/api_main.py` (lines 178-179)
- `ml/metrics.py` - prediction time tracking

### 3.3 External Service Communication
**Common Causes:**
- Network timeouts
- Service unavailable (503 errors)
- Invalid API responses
- Rate limiting

**Specific Error Examples:**
```
ExternalServiceError: Тайм-аут при подключении к сервису: http://external-api
ExternalServiceError: Сервис вернул статус 503: Service Temporarily Unavailable
ML service unavailable: connect ECONNREFUSED ml-service:5678
```

**Logging Location:**
- `ml/error_handler.py` (lines 98-118) - retry logic with backoff
- `backend/src/utils/mlServiceUtils.ts` (lines 27-29)
- `backend/src/controllers/healthController.ts` (lines 42-47)

### 3.4 Cache-Related Issues
**Common Causes:**
- Redis connection failures
- Cache key collisions
- Serialization errors
- Memory limits exceeded

**Specific Error Examples:**
```
Cache error: Error getting cached forecast: Connection to Redis lost
Warning: Cache set error: OOM command not allowed when used memory > 'maxmemory'
```

**Logging Location:**
- `ml/cache_manager.py` (lines 54, 68, 82)
- `ml/api_main.py` (lines 147-148, 206-207)

## 4. Cross-Component Sync Issues

### 4.1 Data Consistency Between DB and ML
**Common Causes:**
- Delayed ETL processing
- Partial data updates
- Time zone mismatches

**Specific Error Examples:**
```
Warning: Product data mismatch: 25 products in DB but only 20 in ML training set
Error: Forecast requested for future date beyond available training data
```

**Logging Location:**
- `backend/src/controllers/forecastController.ts` (line 167)
- ML training logs

### 4.2 Authorization/Token Issues
**Common Causes:**
- Expired tokens
- Invalid JWT secret
- Supabase/Legacy auth mismatch
- Missing user profiles

**Specific Error Examples:**
```
Error: Token required
Error: Invalid token
Error: User not found for legacy token
Dual auth token validation error: jwt malformed
```

**Logging Location:**
- `backend/src/middleware/dualAuthMiddleware.ts` (lines 108-109)
- Authentication middleware logs

### 4.3 Race Conditions
**Common Causes:**
- Concurrent model updates
- Simultaneous cache writes
- Parallel ETL processing of same data

**Specific Error Examples:**
```
Error: Concurrent update detected for product_id=123
Cache invalidation race: Key deleted while being written
```

**Logging Location:**
- Redis operation logs
- Database transaction logs

### 4.4 Environment Configuration Mismatches
**Common Causes:**
- Missing environment variables
- Different configs between dev/prod
- Service discovery failures

**Specific Error Examples:**
```
Error: ML_SERVICE_URL not defined
Error: JWT_SECRET not configured
Failed to connect to Redis: ENOTFOUND redis
```

**Logging Location:**
- Service startup logs
- Docker compose logs: `docker-compose logs [service-name]`

## 5. Monitoring and Alerting

### 5.1 Health Check Endpoints
- **Backend**: `http://localhost:3000/health/simple`
- **ML Service**: `http://localhost:5678/health`
- **Combined Health**: `http://localhost:3000/health`

### 5.2 Metrics Collection
- **Prometheus Metrics**: `http://localhost:5678/metrics`
- **Cache Stats**: `http://localhost:5678/cache/stats`

### 5.3 Log Aggregation
- **Docker Logs**: `docker-compose logs -f [service-name]`
- **Structured Logs**: JSON format in `ml/error_handler.py`
- **Test Results**: `test_results/monitoring_report.json`

## 6. Recovery Procedures

### 6.1 Database Recovery
```bash
# Check connection
docker-compose exec db psql -U postgres -c "SELECT 1"

# Reset connections
docker-compose exec db psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='postgres' AND pid <> pg_backend_pid()"
```

### 6.2 ML Service Recovery
```bash
# Restart ML service
docker-compose restart ml-service

# Clear cache if needed
curl -X DELETE http://localhost:5678/cache

# Check model readiness
python ml/check_model_readiness.py
```

### 6.3 ETL Recovery
```bash
# Check queue status
docker-compose exec db psql -U postgres -c "SELECT * FROM pgmq.queue"

# Restart worker
docker-compose restart worker
```

## 7. Performance Bottlenecks

### 7.1 Database
- Index missing on frequently queried columns
- Full table scans on large tables
- Connection pool size too small

### 7.2 ML Service
- Model prediction time > 1s for large batches
- Cache miss rate > 50%
- Feature engineering taking > 500ms

### 7.3 ETL
- Queue processing lag > 5 minutes
- Batch size too large (> 1000 records)
- Transaction lock contention

## 8. Data Validation Points

### 8.1 Input Validation
- Date format: YYYY-MM-DD required
- Quantity: Must be positive integer
- Product codes: Must match existing products
- Organization ID: Must be valid

### 8.2 Output Validation
- Predictions must be non-negative
- MAPE/MAE must be finite numbers
- Period dates must be in correct range
- All products must have predictions

This checklist should be reviewed and updated regularly based on production incidents and new failure modes discovered during operation.
