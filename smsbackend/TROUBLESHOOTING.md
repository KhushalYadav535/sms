# 🔧 Database Connection Troubleshooting Guide

## 🚨 Current Issue: "Database unavailable" Error

Your application is getting a 503 Service Unavailable error with "Database unavailable" message. This indicates that the backend cannot connect to the PostgreSQL database.

## 🔍 Diagnosis Steps

### 1. **Run Database Connection Test**
```bash
cd sms/smsbackend
node db-test.js
```

This will show you:
- Which environment variables are set
- Database configuration being used
- Connection attempt results
- Specific error details

### 2. **Check Render.com Environment Variables**

Go to your Render.com dashboard:
1. Navigate to your web service
2. Go to "Environment" tab
3. Verify these variables are set:

**Required Variables:**
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-secret-key
```

**Database Variables (Choose ONE option):**

**Option A: DATABASE_URL (Recommended)**
```env
DATABASE_URL=postgresql://username:password@host:port/database_name
```

**Option B: Individual PostgreSQL Variables**
```env
PGHOST=your-postgres-host
PGPORT=5432
PGUSER=your-postgres-user
PGPASSWORD=your-postgres-password
PGDATABASE=your-database-name
```

**CORS Variables:**
```env
FRONTEND_URL=https://your-frontend-domain.com
CLIENT_URL=https://your-client-domain.com
```

## 🛠️ Common Solutions

### **Solution 1: Check PostgreSQL Service**
1. Go to Render Dashboard
2. Check if your PostgreSQL service is running
3. Verify the connection string from PostgreSQL service
4. Copy the exact connection string to your web service environment variables

### **Solution 2: Fix SSL Issues**
If you see SSL certificate errors, ensure your `DATABASE_URL` includes SSL parameters:
```
postgresql://username:password@host:port/database_name?sslmode=require
```

### **Solution 3: Verify Database Exists**
1. Check if the database was created properly
2. Ensure the database name in your connection string is correct
3. Verify the user has proper permissions

### **Solution 4: Check Network/Firewall**
1. Ensure your PostgreSQL service allows connections from your web service
2. Check if the host and port are accessible
3. Verify DNS resolution

## 🔧 Quick Fixes

### **For Local Development:**
1. Create a `.env` file in `sms/smsbackend/`:
```env
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/sms_db
JWT_SECRET=your-secret-key
```

2. Install PostgreSQL locally or use a cloud database

### **For Production (Render.com):**
1. **Create a new PostgreSQL database:**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Choose your plan
   - Note the connection details

2. **Update your web service environment variables:**
   - Copy the PostgreSQL connection string
   - Set it as `DATABASE_URL` in your web service

3. **Redeploy your application:**
   - Go to your web service
   - Click "Manual Deploy" → "Deploy latest commit"

## 🧪 Testing Your Fix

### **1. Test Database Connection:**
```bash
cd sms/smsbackend
node db-test.js
```

### **2. Test API Endpoints:**
```bash
# Health check
curl https://sms-w12c.onrender.com/health

# Database test
curl https://sms-w12c.onrender.com/test-db
```

### **3. Test Login:**
Try logging in with:
- Email: `admin@society.com`
- Password: `admin123`

## 📋 Checklist

- [ ] PostgreSQL service is running on Render
- [ ] Environment variables are set correctly
- [ ] Database connection string is valid
- [ ] SSL is configured properly
- [ ] Database exists and has tables
- [ ] Admin user exists in database
- [ ] Web service can connect to database
- [ ] Frontend can reach backend API

## 🆘 Still Having Issues?

If the problem persists:

1. **Check Render Logs:**
   - Go to your web service on Render
   - Click "Logs" tab
   - Look for database connection errors

2. **Verify Database Setup:**
   - Ensure `setup.sql` was run successfully
   - Check if all tables exist
   - Verify admin user was created

3. **Test with Different Database:**
   - Try using a different PostgreSQL service
   - Test with a local database first

4. **Contact Support:**
   - If using Render, check their status page
   - Verify your account has proper permissions

## 📞 Emergency Contact

If you need immediate help:
1. Check Render.com status: https://status.render.com/
2. Verify your Render account is active
3. Ensure you have proper billing setup for PostgreSQL service 