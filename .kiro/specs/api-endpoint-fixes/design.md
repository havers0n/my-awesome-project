# Design Document

## Overview

This design document outlines the approach to fix the 404 errors occurring when the frontend attempts to access the `/api/inventory/products` and `/api/forecast/metrics` endpoints. The solution involves ensuring proper route configuration, implementing missing controllers, and verifying authentication middleware functionality.

## Architecture

The system follows a standard Express.js backend architecture with the following components:

1. **Routes**: Defined in `backend/src/routes/` directory, these files map HTTP endpoints to controller functions
2. **Controllers**: Located in `backend/src/controllers/`, these handle the business logic for each endpoint
3. **Middleware**: Authentication and other cross-cutting concerns are handled by middleware functions
4. **Database Access**: The system uses Supabase for data storage and retrieval

The frontend makes API calls using either direct `fetch` calls or through service modules that abstract the API interaction.

## Components and Interfaces

### 1. Inventory Products Endpoint

#### Current Status
- The route `/api/inventory/products` is correctly defined in `inventoryRoutes.ts`
- The controller function `getProducts` exists in `inventoryController.ts`
- The route is protected by the `dualAuthenticateToken` middleware
- The frontend is attempting to access this endpoint through the `warehouseApi.ts` service

#### Issues Identified
1. The route is registered in `app.ts` without the authentication middleware, but the route itself applies the middleware
2. The controller function may have issues with authentication token handling
3. The frontend may not be sending the correct authentication token

#### Solution Design
1. Ensure consistent middleware application (either at route registration or within route file)
2. Add debug logging to trace request flow and authentication status
3. Verify that the frontend is correctly sending the authentication token

### 2. Forecast Metrics Endpoint

#### Current Status
- The route `/api/forecast/metrics` is defined in `forecastRoutes.ts` and mapped to `getOverallMetrics` controller
- The controller function exists in `forecastController.ts` but may have issues
- The frontend is attempting to access this endpoint through the `warehouseApi.ts` service

#### Issues Identified
1. The controller function `getOverallMetrics` is querying a table called `sales_forecasts` which may not exist or have the expected structure
2. The authentication handling may be causing issues
3. The frontend may not be sending the correct authentication token

#### Solution Design
1. Verify the database schema and update the controller to query the correct table
2. Add debug logging to trace request flow and authentication status
3. Ensure consistent error handling and response formatting

### 3. Frontend Integration

#### Current Status
- The frontend uses `warehouseApi.ts` to make API calls to both endpoints
- The service attempts to retrieve an authentication token from Supabase
- Error handling exists but may not provide sufficient information for debugging

#### Issues Identified
1. The authentication token retrieval may not be working correctly
2. Error handling may be swallowing important details
3. The API base URL may not be correctly configured

#### Solution Design
1. Enhance error logging in the frontend API service
2. Verify the authentication token retrieval process
3. Ensure the API base URL is correctly configured

## Data Models

### Inventory Products

The `products` table in Supabase has the following structure:
- `id`: Primary key
- `name`: Product name
- `category`: Product category (optional)
- `shelf`: Shelf location (optional)
- `quantity`: Current quantity
- `price`: Product price (optional)
- `organization_id`: Foreign key to the organization

### Forecast Metrics

The controller is currently trying to access a `sales_forecasts` table, but based on the code review, the correct table might be `predictions` or `prediction_runs`. We need to verify the correct table structure and update the controller accordingly.

## Error Handling

The solution will implement comprehensive error handling:

1. **Backend**:
   - Add detailed logging at key points in the request processing pipeline
   - Ensure consistent error response format
   - Provide specific error codes for different failure scenarios

2. **Frontend**:
   - Enhance error handling in API services
   - Add retry logic for transient failures
   - Provide user-friendly error messages

## Testing Strategy

1. **Backend Testing**:
   - Unit tests for controller functions
   - Integration tests for API endpoints
   - Authentication tests to verify middleware functionality

2. **Frontend Testing**:
   - Mock API responses for component testing
   - End-to-end tests for critical user flows
   - Manual testing of error scenarios

3. **Test Cases**:
   - Verify successful retrieval of products with valid authentication
   - Verify successful retrieval of forecast metrics with valid authentication
   - Test behavior with invalid authentication
   - Test behavior with empty database tables
   - Test error handling for database connection issues