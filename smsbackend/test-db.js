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
          
          // Check members table structure
          const membersColumns = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'members' 
            ORDER BY ordinal_position
          `);
          console.log('📊 Members table columns:');
          membersColumns.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
          });
          
          // Test member insertion
          console.log('\n🧪 Testing member insertion...');
          try {
            // First create a test user
            const testUserResult = await pool.query(
              'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
              ['Test User', 'test@example.com', '$2b$10$test', 'user']
            );
            const testUserId = testUserResult.rows[0].id;
            console.log('✅ Test user created with ID:', testUserId);
            
            // Then create a test member
            const testMemberResult = await pool.query(
              'INSERT INTO members (user_id, house_number, phone) VALUES ($1, $2, $3) RETURNING id',
              [testUserId, 'A-101', '1234567890']
            );
            console.log('✅ Test member created with ID:', testMemberResult.rows[0].id);
            
            // Clean up test data
            await pool.query('DELETE FROM members WHERE user_id = $1', [testUserId]);
            await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
            console.log('✅ Test data cleaned up');
            
          } catch (insertError) {
            console.error('❌ Member insertion test failed:', insertError);
            console.error('Error details:', {
              message: insertError.message,
              code: insertError.code,
              detail: insertError.detail,
              hint: insertError.hint,
              position: insertError.position
            });
          }
          
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