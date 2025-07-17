// Check database content
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uxcsziylmyogvcqyyuiw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Y3N6aXlsbXlvZ3ZjcXl5dWl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTYyNDE0NSwiZXhwIjoyMDY1MjAwMTQ1fQ.wVMJpIWKY32ialHsv8ns8R8bMfv-IpAJ2j69bQQecpg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  try {
    console.log('Checking database tables...\n');
    
    // Check operations table
    const { data: operations, error: operationsError } = await supabase
      .from('operations')
      .select('*')
      .limit(5);
    
    if (operationsError) {
      console.error('Operations error:', operationsError);
    } else {
      console.log(`Operations table: ${operations.length} records found`);
      console.log('Sample operations:', operations.slice(0, 2));
    }
    
    // Check products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.error('Products error:', productsError);
    } else {
      console.log(`\nProducts table: ${products.length} records found`);
      console.log('Sample products:', products.slice(0, 2));
    }
    
    // Check locations table
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .limit(5);
    
    if (locationsError) {
      console.error('Locations error:', locationsError);
    } else {
      console.log(`\nLocations table: ${locations.length} records found`);
      console.log('Sample locations:', locations.slice(0, 2));
    }
    
    // Check predictions table
    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select('*')
      .limit(5);
    
    if (predictionsError) {
      console.error('Predictions error:', predictionsError);
    } else {
      console.log(`\nPredictions table: ${predictions.length} records found`);
      console.log('Sample predictions:', predictions.slice(0, 2));
    }
    
    // Check prediction_runs table
    const { data: predictionRuns, error: predictionRunsError } = await supabase
      .from('prediction_runs')
      .select('*')
      .limit(5);
    
    if (predictionRunsError) {
      console.error('Prediction runs error:', predictionRunsError);
    } else {
      console.log(`\nPrediction runs table: ${predictionRuns.length} records found`);
      console.log('Sample prediction runs:', predictionRuns.slice(0, 2));
    }
    
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, organization_id')
      .limit(3);
    
    if (usersError) {
      console.error('Users error:', usersError);
    } else {
      console.log(`\nUsers table: ${users.length} records found`);
      console.log('Sample users:', users);
    }
    
  } catch (error) {
    console.error('Database check error:', error);
  }
}

checkDatabase();
