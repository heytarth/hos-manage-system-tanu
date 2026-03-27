# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up MongoDB
Option A - Local MongoDB:
```bash
mongod
```

Option B - MongoDB Atlas (Cloud):
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` with connection string

### Step 3: Configure Environment
Edit `.env` file:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hos-system
JWT_SECRET=change-this-secret-key
GEMINI_API_KEY=your-api-key-from-google
```

### Step 4: Start the Server
```bash
npm start
```
Server runs on `http://localhost:3000`

### Step 5: Test the System

**Sign Up:**
1. Go to homepage
2. Click "Sign Up"
3. Fill in hospital details
4. Choose Hospital or Admin role
5. Click Sign Up

**Access Dashboard:**
1. Click "Sign In" on homepage
2. Use credentials from sign up
3. You're in the dashboard!

**Try Features:**
- **Waste Submission**: Go to "Waste Submission" tab, add waste amount and category
- **Compliance**: Check "Compliance" tab, update checklist items
- **Analytics**: View trends in "Analytics" tab
- **Admin Panel**: (if registered as admin) Access admin controls

## 🔑 Default Test Account

After installation, you can create a test account:
- Hospital Name: Test Hospital
- Email: test@hospital.com
- Password: TestPass123
- Role: Hospital

## 📝 File Structure at a Glance

```
public/               → Frontend (HTML, CSS, JS)
src/
  ├── models/         → Database schemas
  ├── routes/         → API endpoints
  ├── controllers/    → Business logic
  ├── middleware/     → Authentication
  └── ai/             → AI integration
server.js            → Main server file
package.json         → Dependencies
.env                 → Config (create if missing)
```

## ⚠️ Common Issues & Solutions

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
npm install
```

### Issue: "Cannot connect to MongoDB"
**Solution:**
1. Check if MongoDB is running: `mongod`
2. Verify MONGODB_URI in .env
3. Check MongoDB credentials if using Atlas

### Issue: Port 3000 is already in use
**Solution:**
```bash
# Option 1: Change port in .env
PORT=5000

# Option 2: Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Invalid API Key" (Gemini)
**Solution:**
1. Get API key from https://makersuite.google.com/app/apikey
2. Enable Generative AI API in Google Cloud
3. Update GEMINI_API_KEY in .env

## 🌐 API Overview

All endpoints require JWT token except `/api/auth/*`

**Example with curl:**
```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "hospitalName": "City Hospital",
    "email": "admin@hospital.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "role": "hospital"
  }'

# Submit waste (with token)
curl -X POST http://localhost:3000/api/waste/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50, "category": "general"}'
```

## 💡 Tips & Tricks

1. **Clear Browser Cache**: If styles don't load, clear cache or use Ctrl+F5
2. **Check Console**: Open DevTools (F12) to see JavaScript errors
3. **Monitor Network**: Use Network tab to debug API calls
4. **Use Admin Account**: Create an admin account to see admin panel features

## 📞 Support

- Check README.md for full documentation
- Review .env.example for configuration options
- Check server console for error messages
- Verify all dependencies are installed: `npm list`

## 🔐 Security Notes

Before deploying to production:
1. Change JWT_SECRET to a strong random string
2. Set NODE_ENV=production in .env
3. Use HTTPS instead of HTTP
4. Change MongoDB connection to use strong passwords
5. Enable CORS properly for your domain
6. Keep API keys secure (never commit .env)

## 🎨 Customization

**Colors** (Edit public/css/style.css):
- Primary Green: #10b981
- Light Green: #e0f7f0
- White: #ffffff

**Features** (Edit public/js/dashboard.js):
- Add new pages
- Modify forms
- Update charts

**API** (Edit src/routes/*.js):
- Add new endpoints
- Modify validation
- Change business logic

---

**Happy Coding! 🎉**
