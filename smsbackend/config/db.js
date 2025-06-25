const { Pool } = require('pg');
require('dotenv').config();

// Log environment check only in development
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Check:', {
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST ? 'Set' : 'Not Set',
    DB_PORT: process.env.DB_PORT ? 'Set' : 'Not Set',
    DB_USER: process.env.DB_USER ? 'Set' : 'Not Set',
    DB_NAME: process.env.DB_NAME ? 'Set' : 'Not Set',
    DB_PASSWORD: process.env.DB_PASSWORD ? 'Set' : 'Not Set',
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not Set',
    PGHOST: process.env.PGHOST ? 'Set' : 'Not Set',
    PGPORT: process.env.PGPORT ? 'Set' : 'Not Set',
    PGUSER: process.env.PGUSER ? 'Set' : 'Not Set',
    PGPASSWORD: process.env.PGPASSWORD ? 'Set' : 'Not Set',
    PGDATABASE: process.env.PGDATABASE ? 'Set' : 'Not Set'
  });
}

let pool;

// Try to use DATABASE_URL first, then fall back to individual parameters
if (process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Using DATABASE_URL for database connection');
    console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Hide password in logs
  }
  
  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 60000
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Database Configuration (URL):', {
      ssl: process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled'
    });
  }

  pool = new Pool(dbConfig);
} else {
  // Use PostgreSQL environment variables if available, otherwise fall back to custom ones
  const dbConfig = {
    host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432'),
    user: process.env.PGUSER || process.env.DB_USER || 'postgres',
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD || process.env.DB_PASS || '',
    database: process.env.PGDATABASE || process.env.DB_NAME || 'sms_db',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 60000,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  };

  // Fix: If DB_HOST is actually a port number, use localhost
  if (dbConfig.host && !isNaN(dbConfig.host)) {
    dbConfig.host = 'localhost';
    if (!dbConfig.port || dbConfig.port === 5432) {
      dbConfig.port = parseInt(dbConfig.host);
    }
  }

  // Additional validation
  if (!dbConfig.host || dbConfig.host === '5432') {
    dbConfig.host = 'localhost';
  }

  // Log database configuration (without sensitive data) only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Database Configuration:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      ssl: process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled',
      connectionTimeoutMillis: dbConfig.connectionTimeoutMillis
    });
  }

  pool = new Pool(dbConfig);
}

// Test the connection
async function testConnection() {
  let client;
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Attempting database connection...');
    }
    client = await pool.connect();
    if (process.env.NODE_ENV === 'development') {
      console.log('Database connected successfully');
    }

    // Test basic query
    const result = await client.query('SELECT NOW() as test');
    if (process.env.NODE_ENV === 'development') {
      console.log('Basic query test:', result.rows[0]);
    }

    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (tableExists) {
      // Verify users table structure
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      if (process.env.NODE_ENV === 'development') {
        console.log('Users table columns:', columnsResult.rows.map(col => col.column_name).join(', '));
      }

      // Verify admin user exists
      const adminResult = await client.query('SELECT * FROM users WHERE email = $1', ['admin@society.com']);
      if (adminResult.rows.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Admin user not found, creating...');
        }
        await client.query(
          'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
          [
            'Admin User',
            'admin@society.com',
            '$2b$10$33OGfn44KVCNPswdBzsYPO4IdS5HdaexwK4SRsI4ZzlJzNnN6ps3G',
            'admin'
          ]
        );
        if (process.env.NODE_ENV === 'development') {
          console.log('Admin user created successfully');
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('Admin user exists');
        }
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('Users table does not exist yet. Tables will be created when server starts.');
      }
    }
  } catch (error) {
    console.error('Database connection test failed:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      stack: error.stack
    });
    
    // Don't exit in production, let the application retry
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Run the connection test only in development
if (process.env.NODE_ENV === 'development') {
  testConnection();
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle connection:', {
    message: err.message,
    code: err.code,
    detail: err.detail,
    hint: err.hint,
    position: err.position,
    stack: err.stack
  });
  
  // Don't exit in production, let the application retry
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

module.exports = pool;
