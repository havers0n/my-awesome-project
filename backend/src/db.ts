import { Pool } from 'pg';
import { DB_CONFIG } from './config';

// Database connection configuration
const pool = new Pool(DB_CONFIG);

// Test the connection
pool.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    console.log('Server will continue to run, but database operations will fail');
  });

export { pool }; 