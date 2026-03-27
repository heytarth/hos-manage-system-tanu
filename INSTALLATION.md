# Installation & Setup Guide

## System Requirements

- **Node.js**: v14.0 or higher
- **npm**: v6.0 or higher  
- **MongoDB**: v4.4 or higher (local or cloud)
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

## Installation Steps

### 1. Clone/Extract the Project

```bash
# Navigate to project directory
cd "HOS management system"
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- Express.js (Server framework)
- Mongoose (MongoDB ODM)
- bcryptjs (Password hashing)
- jsonwebtoken (JWT authentication)
- And more...

**Installation time**: 2-3 minutes

### 3. Set Up MongoDB

#### Option A: Local MongoDB

**Windows:**
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Run the installer
3. MongoDB will start automatically as a service
4. Verify: `mongosh` or `mongo`

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
curl https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
```

**Verify MongoDB is running:**
```bash
# Should show server version
mongo --version
```

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account (M0 free tier)
3. Create a new project
4. Create a cluster
5. Create a database user with password
6. Go to Network Access and add your IP (or 0.0.0.0 for development)
7. Click "Connect" and copy the connection string
8. Connection string format:
   ```
   mongodb+srv://username:password@cluster0.mongodb.net/hos-system
   ```

### 4. Configure Environment Variables

1. Open `.env.example` as reference
2. Create `.env` file in project root
3. Fill in required values:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB - use one of:
# Option A: Local
MONGODB_URI=mongodb://localhost:27017/hos-system

# Option B: MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/hos-system

# JWT Secret - Change this!
JWT_SECRET=your-unique-secret-key-here-minimum-32-characters

# Gemini API Key - Get from Google Cloud
GEMINI_API_KEY=AIzaSyD...
```

### 5. Get Gemini API Key (Optional but Recommended)

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Get API key"
4. Select or create a project
5. Copy your API key
6. Paste in `.env` file

### 6. Start the Server

```bash
npm start
```

**Expected output:**
```
Server running on port 3000
MongoDB connected
```

**Access the application:**
- Open browser
- Go to `http://localhost:3000`

### 7. Create First Account

1. Click "Sign Up" button
2. Fill in registration form:
   - Hospital Name: "Test Hospital"
   - Email: "test@hospital.com"
   - Password: "TestPass123"
   - Role: "Hospital"
3. Click "Sign Up"
4. You'll be redirected to dashboard

### 8. Test Features

#### Test Waste Submission
1. Go to "Waste Submission" tab
2. Enter amount: 50
3. Select category: "General Waste"
4. Click "Submit Waste"
5. Check "Waste History" table

#### Test Compliance
1. Go to "Compliance" tab
2. Check all 4 compliance items
3. Score should increase
4. Status should show "Pass" when >= 60

#### Test Analytics
1. Go to "Analytics" tab
2. Select different periods
3. View charts and trends

#### Test Admin Panel (if registered as admin)
1. Register new account with "Admin" role
2. Login with admin account
3. Click on "Admin Panel" in sidebar
4. View system statistics

## Troubleshooting

### Problem: "Cannot find module 'express'"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -r node_modules
npm install

# Or on Windows:
rmdir /s node_modules
npm install
```

### Problem: "Error: connect ECONNREFUSED 127.0.0.1:27017"

**Cause:** MongoDB is not running

**Solution:**
```bash
# Option A: Start MongoDB (Local)
mongod

# Option B: Use MongoDB Atlas
# Update MONGODB_URI in .env with your Atlas connection string
```

### Problem: "MongoNetworkError"

**Cause:** MongoDB connection string is wrong

**Solution:**
1. Check MONGODB_URI in .env
2. Verify username and password
3. Make sure connection string is correct
4. For Atlas, check if IP is whitelisted (use 0.0.0.0 for dev)

### Problem: Port 3000 is already in use

**Solution:**
```bash
# Option A: Change port in .env
PORT=5000
npm start

# Option B: Kill process on port 3000
# Windows PowerShell:
Get-Process | Where Port -eq 3000 | Stop-Process -Force

# Windows CMD:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3000
kill -9 <PID>
```

### Problem: "Invalid API Key" (Gemini)

**Solution:**
1. Verify API key in .env
2. Check if API is enabled in Google Cloud Console
3. Verify you have monthly quota remaining
4. Try regenerating the key

### Problem: Pages not loading

**Solution:**
```bash
# Clear browser cache
Ctrl + Shift + Delete (Windows/Linux)
Cmd + Shit + Delete (macOS)

# Hard refresh
Ctrl + F5 (Windows)
Cmd + Shift + R (macOS)
```

### Problem: Chart.js not loading

**Solution:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Verify internet connection (CDN access needed)

## Development Workflow

### Hot Reload (Auto-restart on file changes)

```bash
# Install nodemon if not in package.json
npm install --save-dev nodemon

# Start with auto-reload
npm run dev
```

### Keep MongoDB Running

For development, keep MongoDB running in a separate terminal:

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Node.js server
npm start
```

## Testing Accounts

Create different accounts for testing:

```javascript
// Hospital Account
Email: hospital@test.com
Password: HospTest123
Role: Hospital

// Admin Account
Email: admin@test.com
Password: AdminTest123
Role: Admin
```

## Project Structure Quick Reference

```
HOS management system/
├── public/              → Frontend (HTML, CSS, JS)
│   ├── index.html       → Landing page
│   └── dashboard.html   → Main app
├── src/                 → Backend
│   ├── models/          → Database schemas
│   ├── routes/          → API endpoints
│   ├── controllers/     → Business logic
│   └── middleware/      → Auth verification
├── server.js            → Main server
├── package.json         → Dependencies
└── .env                 → Configuration
```

## Next Steps

1. ✅ Complete installation
2. ✅ Create test account
3. ✅ Explore all features
4. ✅ Customize as needed
5. ✅ Deploy when ready

## Production Deployment

Before deploying:

1. **Security**
   ```env
   NODE_ENV=production
   JWT_SECRET=generate-strong-random-string
   ```

2. **Database**
   - Use MongoDB Atlas (not local)
   - Strong password
   - IP whitelist enabled

3. **API Keys**
   - Never commit .env
   - Store in environment variables
   - Regenerate keys

4. **HTTPS**
   - Use SSL certificate
   - Redirect HTTP to HTTPS

5. **Hosting Options**
   - Heroku
   - AWS
   - Digital Ocean
   - Railway.app
   - Replit

## Getting Help

- Check README.md for full documentation
- Check QUICK_START.md for quick tips
- Review error logs in browser console (F12)
- Check server console for backend errors
- Visit MongoDB documentation: docs.mongodb.com

## Success Checklist

- ✅ Node.js installed
- ✅ MongoDB running
- ✅ npm dependencies installed
- ✅ .env configured
- ✅ Server starting without errors
- ✅ Can access http://localhost:3000
- ✅ Can sign up and sign in
- ✅ Can submit waste
- ✅ Can view analytics
- ✅ Dashboard loads properly

Once all items are checked, your system is ready to use!

---

**Need help?** Check the documentation files or review the code comments for more details.

