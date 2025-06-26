require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🔍 Database Connection Test');
console.log('==========================');

// Log environment variables (without sensitive data)
console.log('Environment Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'Not Set');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
console.log('- PGHOST:', process.env.PGHOST || 'Not Set');
console.log('- PGPORT:', process.env.PGPORT || 'Not Set');
console.log('- PGUSER:', process.env.PGUSER || 'Not Set');
console.log('- PGDATABASE:', process.env.PGDATABASE || 'Not Set');
console.log('- PGPASSWORD:', process.env.PGPASSWORD ? 'Set' : 'Not Set');

let pool;

// Try to use DATABASE_URL first, then fall back to individual parameters
if (process.env.DATABASE_URL) {
  console.log('\n📡 Using DATABASE_URL for connection...');
  
  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 60000
  };

  pool = new Pool(dbConfig);
} else {
  console.log('\n📡 Using individual PostgreSQL parameters...');
  
  const dbConfig = {
    host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432'),
    user: process.env.PGUSER || process.env.DB_USER || 'postgres',
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.PGDATABASE || process.env.DB_NAME || 'sms_db',
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 60000,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  };

  console.log('Database Config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    ssl: dbConfig.ssl ? 'Enabled' : 'Disabled'
  });

  pool = new Pool(dbConfig);
}

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Database connected successfully');
    console.log('Current time:', result.rows[0].current_time);
    console.log('Database version:', result.rows[0].db_version);
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Users table exists');
      
      // Run migration
      console.log('Running migration...');
      const migrateSQL = fs.readFileSync(path.join(__dirname, 'migrate.sql'), 'utf8');
      await pool.query(migrateSQL);
      console.log('✅ Migration completed successfully');
      
      // Check if standard_charges table exists
      const standardChargesCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'standard_charges'
        );
      `);
      
      if (standardChargesCheck.rows[0].exists) {
        console.log('✅ Standard charges table exists');
        
        // Check if house_number column exists in members table
        const columnCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'members' 
            AND column_name = 'house_number'
          );
        `);
        
        if (columnCheck.rows[0].exists) {
          console.log('✅ House number column exists in members table');
        } else {
          console.log('❌ House number column missing in members table');
        }
      } else {
        console.log('❌ Standard charges table missing');
      }
      
    } else {
      console.log('❌ Users table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await pool.end();
  }
}

testDatabase(); 