# Hospital Waste Management System

A minimalist, clean hospital waste management system with AI-powered waste classification, compliance tracking, and real-time analytics.

## Features

✅ **User Authentication** - Secure JWT-based authentication
✅ **Waste Submission** - Submit and track hospital waste with AI classification
✅ **Compliance Management** - Monitor compliance score with actionable suggestions
✅ **Analytics Dashboard** - Real-time waste trends and category breakdown
✅ **Admin Panel** - System-wide statistics and hospital management
✅ **Responsive Design** - White and green minimalist UI design
✅ **AI Integration** - Gemini API for automated waste classification

## Tech Stack

### Frontend
- HTML5
- CSS3 (Minimalist Design)
- JavaScript (Vanilla)
- Chart.js (Data Visualization)
- Bootstrap (Responsive)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Bcryptjs (Password Hashing)

### AI Integration
- Google Generative AI (Gemini)
- TensorFlow (Optional for on-device ML)

## Project Structure

```
HOS management system/
├── public/
│   ├── css/
│   │   └── style.css          # Global styles (white & green theme)
│   ├── js/
│   │   ├── main.js            # Landing page & auth logic
│   │   └── dashboard.js       # Dashboard functionality
│   ├── images/                # Image assets
│   ├── index.html             # Landing page
│   ├── dashboard.html         # Main dashboard
│   └── 404.html               # Error page
├── src/
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Waste.js           # Waste submission schema
│   │   ├── Compliance.js      # Compliance tracker schema
│   │   └── Analytics.js       # Analytics data schema
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── waste.js           # Waste submission routes
│   │   ├── compliance.js      # Compliance routes
│   │   ├── analytics.js       # Analytics routes
│   │   └── admin.js           # Admin panel routes
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── wasteController.js
│   │   ├── complianceController.js
│   │   ├── analyticsController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   └── ai/
│       └── gemini.js          # Gemini API integration
├── server.js                  # Express server setup
├── package.json              # Dependencies
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
└── README.md                # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Google Gemini API Key

### Setup Steps

1. **Clone/Extract the project**
   ```bash
   cd "HOS management system"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create/update `.env` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/hos-system
   JWT_SECRET=your-super-secret-jwt-key
   GEMINI_API_KEY=your-gemini-api-key
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Start the server**
   ```bash
   npm start
   # Or for development with hot reload
   npm run dev
   ```

6. **Access the application**
   ```
   http://localhost:3000
   ```

## Pages & Features

### Landing Page
- Navigation with sign in/up links
- Hero section with call-to-action
- Feature highlights
- How it works explanation
- Impact statistics
- Footer with contact info

### Authentication
- **Sign Up**: Hospital name, email, password, role selection
- **Sign In**: Email and password login
- **JWT Tokens**: Secure 30-day session tokens

### Dashboard (Main Page)
- **Top Cards**: Total waste, compliance score, alerts, submissions
- **Charts**: Weekly waste trend, category breakdown
- **Activity Table**: Recent submissions with status
- **Navigation Sidebar**: Access to all features

### Waste Submission
- Input waste amount and category
- Automatic AI-based category prediction
- Waste history table
- Status tracking (pending/verified/rejected)

### Compliance Page
- **Score Display**: Visual compliance percentage
- **Checklist**: Waste segregation, bins, documentation, training
- **Improvement Suggestions**: Auto-generated tips
- **Status**: Pass/Fail indicator

### Analytics Page
- **Period Selector**: 7, 30, 90 day views
- **Waste Trends**: Line chart of waste over time
- **Recycling Rate**: Bar chart showing improvement
- **Export Options**: PDF and CSV export (ready to implement)

### Admin Panel (Admins Only)
- System statistics
- All hospitals list
- Recent waste submissions
- Average compliance monitoring
- User management

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new hospital
- `POST /api/auth/signin` - Login

### Waste Management
- `POST /api/waste/submit` - Submit waste (requires auth)
- `GET /api/waste/all` - Get all submissions
- `GET /api/waste/recent` - Get recent submissions

### Compliance
- `GET /api/compliance` - Get compliance status
- `PUT /api/compliance/update` - Update compliance checklist

### Analytics
- `GET /api/analytics` - Get period analytics
- `GET /api/analytics/trends` - Get waste trends
- `GET /api/analytics/breakdown` - Get category breakdown

### Admin
- `GET /api/admin/users` - Get all hospitals (admin only)
- `GET /api/admin/waste` - Get all waste (admin only)
- `GET /api/admin/compliance` - Get all compliance (admin only)
- `GET /api/admin/stats` - Get system statistics

## Color Scheme

- **Primary Green**: #10b981
- **Dark Green**: #059669
- **Light Green**: #e0f7f0
- **White**: #ffffff
- **Light Gray**: #f3f4f6
- **Dark Gray**: #374151

## Security Features

✅ JWT-based authentication
✅ Password hashing with bcryptjs
✅ Protected API routes
✅ CORS enabled
✅ Environment variable configuration
✅ Role-based access control (Hospital/Admin)

## Future Enhancements

- Image-based waste classification using TensorFlow.js
- Email notifications for compliance alerts
- Multi-language support
- Mobile app (React Native)
- Real-time notifications (WebSocket)
- Advanced reporting and statistics
- Waste disposal scheduling
- Supply chain integration
- Cost analysis and optimization

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify connection permissions

### Gemini API Key Error
- Verify API key in .env
- Ensure quota is not exceeded
- Check API is enabled in Google Cloud

### Port Already in Use
```bash
# Change PORT in .env or use:
npm start -- --port 5000
```

## Deploy on Vercel

This project runs with:
- SQLite for local development
- Postgres on hosting (via `DATABASE_URL`)

### 1. Import repository
- Go to Vercel -> `New Project`
- Import this GitHub repository

### 2. Add environment variables (Vercel Project Settings)
- `DATABASE_URL` = your managed Postgres connection string
- `JWT_SECRET` = your JWT secret
- `GEMINI_API_KEY` = your Gemini API key
- `NODE_ENV` = `production`

### 3. Deploy
- Trigger deploy from Vercel dashboard
- Vercel will use `vercel.json` and route `/api/*` to `api/index.js`

### Notes
- Do not use SQLite (`hos-system.db`) in production on Vercel.
- Vercel serverless filesystem is ephemeral; use managed Postgres.

## Development Notes

- All passwords are hashed using bcryptjs (10 salt rounds)
- Tokens expire after 30 days
- Database indexes on email for faster lookups
- CORS enabled for frontend communication
- Static files served from public directory

## License

This project is created for hospital waste management purposes.

## Support

For issues or questions, please contact: info@hos.com

---

**Created**: 2024 | **Version**: 1.0.0
