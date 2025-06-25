# 🚀 SMS Backend Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Create `.env` file with production values
- [ ] Set `NODE_ENV=production`
- [ ] Configure `DATABASE_URL` or individual DB variables
- [ ] Set strong `JWT_SECRET`
- [ ] Configure `FRONTEND_URL` and `CLIENT_URL`

### 2. Database Setup
- [ ] PostgreSQL database created
- [ ] Database user with proper permissions
- [ ] SSL enabled for production
- [ ] Connection string tested

### 3. Security
- [ ] Remove all `console.log` statements (done)
- [ ] Update CORS origins for production
- [ ] Set strong passwords
- [ ] Enable HTTPS
- [ ] Configure rate limiting

### 4. Dependencies
- [ ] Run `npm install --production`
- [ ] Remove dev dependencies
- [ ] Check for security vulnerabilities

## 🔧 Production Environment Variables

```env
# Application
NODE_ENV=production
PORT=5000

# Frontend URLs
FRONTEND_URL=https://your-frontend-domain.com
CLIENT_URL=https://your-client-domain.com

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Database
DATABASE_URL=postgresql://username:password@host:port/database_name

# Or individual variables
PGHOST=your-postgres-host
PGPORT=5432
PGUSER=your-postgres-user
PGPASSWORD=your-postgres-password
PGDATABASE=your-database-name
```

## 🚨 Critical Issues Fixed

### ✅ Console.log Statements
- Removed from `config/db.js`
- Only show in development mode
- Production logs use Winston logger

### ✅ CORS Configuration
- Dynamic origin checking
- Support for multiple frontend URLs
- Production-ready CORS setup

### ✅ Error Handling
- No `process.exit()` in production
- Graceful error handling
- Application continues running

### ✅ Database Connection
- Retry logic for production
- SSL configuration
- Connection pooling

## 📋 Deployment Commands

```bash
# Install production dependencies
npm install --production

# Start production server
npm start

# Or with PM2
pm2 start server.js --name "sms-backend"

# Or with Docker
docker build -t sms-backend .
docker run -p 5000:5000 sms-backend
```

## 🔍 Health Check

After deployment, test:
- `GET /health` - Should return 200 OK
- Database connection
- Admin user creation
- API endpoints

## 📝 Notes

- Backend runs on port 5000
- Default admin: admin@society.com / admin123
- All SQL files are PostgreSQL compatible
- Tables created automatically on first run 