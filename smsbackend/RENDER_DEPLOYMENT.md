# 🚀 Render.com Deployment Guide

## 📋 **Environment Variables for Render**

Set these environment variables in your Render dashboard:

### **Required Variables:**

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### **Database Variables (Choose One Option):**

#### **Option 1: DATABASE_URL (Recommended)**
```env
DATABASE_URL=postgresql://username:password@host:port/database_name
```

#### **Option 2: Individual PostgreSQL Variables**
```env
PGHOST=your-postgres-host
PGPORT=5432
PGUSER=your-postgres-user
PGPASSWORD=your-postgres-password
PGDATABASE=your-database-name
```

### **Frontend URL (for CORS)**
```env
FRONTEND_URL=https://your-frontend-domain.com
CLIENT_URL=https://your-client-domain.com
```

## 🔧 **Render.com Setup Steps:**

### 1. **Create PostgreSQL Database**
- Go to Render Dashboard
- Click "New" → "PostgreSQL"
- Choose your plan
- Note down the connection details

### 2. **Create Web Service**
- Go to Render Dashboard
- Click "New" → "Web Service"
- Connect your GitHub repository
- Set build command: `npm install`
- Set start command: `npm start`

### 3. **Set Environment Variables**
- In your web service settings
- Go to "Environment" tab
- Add all the variables listed above

### 4. **Database Connection**
- Use the PostgreSQL connection string from step 1
- Set it as `DATABASE_URL` environment variable

## 🚨 **Important Notes:**

### **Port Configuration:**
- Render uses port `10000` by default
- Set `PORT=10000` in environment variables

### **Database SSL:**
- SSL is automatically enabled in production
- No additional configuration needed

### **CORS Configuration:**
- Update `FRONTEND_URL` to your actual frontend domain
- Multiple domains supported

### **Health Check:**
- Your app will be available at: `https://your-app-name.onrender.com`
- Health endpoint: `https://your-app-name.onrender.com/health`

## 🔍 **Troubleshooting:**

### **If Database Connection Fails:**
1. Check `DATABASE_URL` is correct
2. Verify PostgreSQL service is running
3. Check firewall settings
4. Ensure SSL is enabled

### **If App Won't Start:**
1. Check logs in Render dashboard
2. Verify all environment variables are set
3. Check Node.js version (should be 20.x)

### **If CORS Issues:**
1. Update `FRONTEND_URL` environment variable
2. Check CORS configuration in server.js

## 📝 **Example Environment Variables:**

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=my-super-secret-jwt-key-2024
DATABASE_URL=postgresql://user:password@host:5432/database
FRONTEND_URL=https://my-frontend-app.onrender.com
CLIENT_URL=https://my-client-app.onrender.com
```

## 🎯 **Deployment Checklist:**

- [ ] PostgreSQL database created
- [ ] Environment variables set
- [ ] Frontend URL configured
- [ ] JWT secret set
- [ ] Node.js version updated to 20.x
- [ ] Health endpoint working
- [ ] Database connection successful 