require('dotenv').config();
const { Pool } = require('pg');

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

async function testConnection() {
  let client;
  try {
    console.log('\n🔌 Attempting to connect to database...');
    client = await pool.connect();
    console.log('✅ Database connected successfully!');

    // Test basic query
    console.log('\n🧪 Testing basic query...');
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Basic query successful');
    console.log('- Current time:', result.rows[0].current_time);
    console.log('- Database version:', result.rows[0].db_version.split(' ')[0]);

    // Check if users table exists
    console.log('\n📋 Checking if users table exists...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ Users table exists');
      
      // Check table structure
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      
      console.log('📊 Users table columns:');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });

      // Check if admin user exists
      const adminResult = await client.query('SELECT COUNT(*) as count FROM users WHERE email = $1', ['admin@society.com']);
      console.log(`👤 Admin users found: ${adminResult.rows[0].count}`);
      
    } else {
      console.log('❌ Users table does not exist');
      console.log('💡 You may need to run the setup.sql script');
    }

  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('- Error:', error.message);
    console.error('- Code:', error.code);
    console.error('- Detail:', error.detail);
    console.error('- Hint:', error.hint);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if PostgreSQL server is running');
      console.log('2. Verify the host and port are correct');
      console.log('3. Check firewall settings');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if the database host is correct');
      console.log('2. Verify DNS resolution');
    } else if (error.code === '28P01') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check username and password');
      console.log('2. Verify database credentials');
    } else if (error.code === '3D000') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if the database exists');
      console.log('2. Verify database name is correct');
    }
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    console.log('\n🔚 Connection test completed');
  }
}

testConnection(); 