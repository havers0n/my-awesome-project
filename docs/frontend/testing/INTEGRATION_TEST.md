# Integration Test for useSalesForecast Hook

## Test Overview
This document outlines the integration test for the `useSalesForecast` hook and its proper display of quality metrics in the QualityMetricsDashboard component.

## Test Scenario
The integration test verifies that the component properly displays fetched quality metrics from both the backend API and mock data fallback in case of API failure.

## Test Steps

### 1. Start the Application
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5174/`

### 2. Navigate to Quality Metrics Dashboard
1. Open the application in your browser
2. Navigate to the Sales Forecast page
3. Click on the "Метрики качества" (Quality Metrics) button in the header
4. The QualityMetricsDashboard component should load

### 3. Verify Integration Components

#### 3.1 Check Console Output
Open browser developer console to see debug logs:
- Look for "🧪 QualityMetricsDashboard Integration Test:" logs
- Verify the following data is logged:
  - `slice`: Current slice type (time/sku/store)
  - `dataLength`: Number of data points loaded
  - `avgR2`: Average R² score
  - `avgMape`: Average MAPE score
  - `avgMae`: Average MAE score
  - `avgRmse`: Average RMSE score
  - `status`: Whether using API or mock data

#### 3.2 Visual Verification
Verify the following elements are displayed:

**KPI Blocks:**
- R² metric with color-coded background (green/yellow/red based on value)
- MAPE metric with color-coded background
- Values should be properly formatted (e.g., 0.81, 12.3%)

**Control Panel:**
- Slice tabs (Time, SKU, Store)
- Metric switcher (R², MAPE, MAE, RMSE)
- Period filter (7 days, 14 days, 30 days, custom range)
- Chart/Table view switcher

**Data Display:**
- Charts or tables based on selected view
- Data should update when switching slices
- Loading states should be shown during data fetching

#### 3.3 Test Different Slices
Test each slice type:

1. **Time Slice** (default):
   - Should show line chart with temporal data
   - Mock data: 3 data points with dates 2025-07-01 to 2025-07-03
   - avgR2: ~0.85, avgMape: ~12.3

2. **SKU Slice**:
   - Should show bar chart with SKU-based data
   - Mock data: 3 SKUs (SKU123, SKU456, SKU789)
   - avgR2: ~0.7, avgMape: ~20.1

3. **Store Slice**:
   - Should show bar chart with store-based data
   - Mock data: 3 stores (Store1, Store2, Store3)
   - avgR2: ~0.9, avgMape: ~14.5

### 4. Test API Failure Scenario

#### 4.1 Mock API Failure
Since the backend API is likely not available, the integration should automatically fall back to mock data.

Expected behavior:
- Warning message: "⚠️ Внимание: API недоступен, показаны демо-данные"
- Console log shows: `status: 'Using mock data (API failure)'`
- `isUsingMockData: true`
- Quality metrics are still displayed using mock data

#### 4.2 Verify Mock Data Quality
Check that mock data includes all required fields:
- `r2`: Number (0-1 range)
- `mape`: Number (percentage)
- `mae`: Number (Mean Absolute Error)
- `rmse`: Number (Root Mean Square Error)

### 5. Test Period Changes
1. Change the period filter to different values (7, 14, 30 days)
2. Try custom date range selection
3. Verify that data updates and console logs show new parameters

### 6. Test Chart/Table Toggle
1. Switch between chart and table views
2. Verify data is displayed correctly in both formats
3. Check that the same data is shown in different visualizations

## Expected Mock Data Structure

### Time Slice Mock Data
```javascript
[
  { date: '2025-07-01', r2: 0.85, mape: 12.3, mae: 5.4, rmse: 7.3 },
  { date: '2025-07-02', r2: 0.82, mape: 13.1, mae: 5.8, rmse: 7.6 },
  { date: '2025-07-03', r2: 0.88, mape: 11.7, mae: 5.1, rmse: 7.0 }
]
```

### SKU Slice Mock Data
```javascript
[
  { sku: 'SKU123', r2: 0.7, mape: 20.1, mae: 8.2, rmse: 10.5 },
  { sku: 'SKU456', r2: 0.6, mape: 25.3, mae: 9.1, rmse: 11.8 },
  { sku: 'SKU789', r2: 0.8, mape: 15.2, mae: 6.3, rmse: 8.9 }
]
```

### Store Slice Mock Data
```javascript
[
  { store: 'Store1', r2: 0.9, mape: 10.5, mae: 4.2, rmse: 6.1 },
  { store: 'Store2', r2: 0.75, mape: 18.2, mae: 7.8, rmse: 9.3 },
  { store: 'Store3', r2: 0.8, mape: 14.7, mae: 6.1, rmse: 8.2 }
]
```

## Test Results Validation

### ✅ Successful Integration Indicators
- [ ] Console logs show proper data structure
- [ ] KPI blocks display calculated averages
- [ ] Charts/tables render with mock data
- [ ] Slice switching works correctly
- [ ] Period changes trigger data updates
- [ ] Error handling shows appropriate warning messages
- [ ] All metric types (R², MAPE, MAE, RMSE) are available

### ❌ Potential Issues to Check
- [ ] Data not loading (check console for errors)
- [ ] Charts not rendering (check chart library imports)
- [ ] Missing metric calculations (check hook return values)
- [ ] API calls not falling back to mocks properly
- [ ] Type mismatches between API and mock data

## Integration Test Summary

The `useSalesForecast` hook integration test demonstrates:

1. **Proper Data Fetching**: Hook fetches from API and falls back to mocks
2. **Quality Metrics Display**: All metrics (R², MAPE, MAE, RMSE) are displayed
3. **Error Handling**: Graceful fallback to mock data when API fails
4. **User Interface**: Proper visualization of metrics in charts and tables
5. **Interactivity**: Slice switching, period changes, and view toggles work
6. **State Management**: Loading states and error messages are handled

The integration ensures that users can always see quality metrics data, whether from the backend API or mock data, providing a reliable user experience even when the backend is unavailable.
