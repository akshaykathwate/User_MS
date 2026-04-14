# UserMS — User Management System

A full-stack **MERN** User Management System with Role-Based Access Control (RBAC), built for the Purple Merit Technologies MERN Stack Developer Intern Assessment.

## 🚀 Live Demo

- **Frontend**: [https://your-app.vercel.app](https://your-app.vercel.app)
- **Backend API**: [https://your-api.onrender.com](https://your-api.onrender.com)

## 📋 Features

### Authentication & Security
- ✅ JWT-based authentication (Access Token + Refresh Token)
- ✅ Automatic token refresh with retry queue
- ✅ bcrypt password hashing (12 salt rounds)
- ✅ Helmet.js security headers
- ✅ Rate limiting (100 req/15min)
- ✅ CORS configuration
- ✅ Input validation (express-validator)
- ✅ Never exposes password hashes in responses

### Role-Based Access Control (RBAC)

| Feature | Admin | Manager | User |
|---------|-------|---------|------|
| View all users (paginated) | ✅ | ✅ (non-admin) | ❌ |
| Search & filter users | ✅ | ✅ | ❌ |
| Create user | ✅ | ❌ | ❌ |
| Assign roles | ✅ | ❌ | ❌ |
| Edit any user | ✅ | ✅ (non-admin) | ❌ |
| Deactivate user | ✅ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ |
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ (name+password) |
| Dashboard stats | ✅ | ✅ | ✅ |

### User Management
- ✅ Paginated, searchable, filterable user list
- ✅ Create users with auto-generated password option
- ✅ Edit user details (name, email, role, status)
- ✅ Soft delete (deactivate — user cannot log in)
- ✅ Permanent delete (Admin only)
- ✅ User detail view with full audit trail

### Audit Trail
- ✅ `createdAt`, `updatedAt` (Mongoose timestamps)
- ✅ `createdBy`, `updatedBy` references (User IDs)
- ✅ Populated in user detail view

## 🏗️ Project Structure

```
assessment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js  # Login, logout, refresh, me
│   │   │   └── user.controller.js  # CRUD + stats
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT protect + authorize
│   │   │   └── validate.middleware.js
│   │   ├── models/
│   │   │   └── user.model.js       # User schema + methods
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── user.routes.js
│   │   ├── utils/
│   │   │   └── seeder.js           # DB seeder
│   │   └── server.js              # Express app entry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js            # Axios + interceptors
    │   │   └── services.js         # API service functions
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Topbar.jsx
    │   │   ├── RouteGuards.jsx
    │   │   ├── UserFormModal.jsx
    │   │   └── ConfirmModal.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx     # Auth state + JWT management
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── UsersPage.jsx
    │   │   ├── UserDetailPage.jsx
    │   │   └── ProfilePage.jsx
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx                 # Routes
    │   ├── main.jsx
    │   └── index.css               # Design system
    └── package.json
```

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| State | React Context API |
| HTTP | Axios (with interceptors) |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT (access + refresh tokens) |
| Security | Helmet, bcryptjs, express-rate-limit |
| Validation | express-validator |
| UI Notifications | react-hot-toast |
| Icons | react-icons (Material Design) |

## 🚦 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (Atlas or local)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/user-management-system.git
cd user-management-system
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm install
npm run seed    # Seed database with demo users
npm run dev     # Start dev server on port 5000
```

### 3. Frontend Setup
```bash
cd frontend
# Edit .env — set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev     # Start on http://localhost:5173
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@userms.com | Admin@123456 |
| Manager | manager@userms.com | Manager@123456 |
| User | user@userms.com | User@123456 |

## 📡 API Reference

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login with email/password |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| POST | `/api/auth/logout` | Private | Logout (clears refresh token) |
| GET | `/api/auth/me` | Private | Get current user |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin, Manager | List all users (paginated) |
| POST | `/api/users` | Admin | Create user |
| GET | `/api/users/stats` | Admin, Manager | Dashboard statistics |
| GET | `/api/users/:id` | All (own profile restriction) | Get user by ID |
| PUT | `/api/users/:id` | Role-based | Update user |
| DELETE | `/api/users/:id` | Admin | Deactivate user |
| DELETE | `/api/users/:id/permanent` | Admin | Permanently delete |

### Query Parameters (GET /api/users)
- `page` — Page number (default: 1)
- `limit` — Results per page (default: 10)
- `search` — Search by name or email
- `role` — Filter by role (admin/manager/user)
- `status` — Filter by status (active/inactive)

## 🌐 Deployment

### Backend (Render)
1. Create new **Web Service** on Render
2. Connect your GitHub repository, set root to `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `FRONTEND_URL` (your Vercel URL)
   - `NODE_ENV=production`

### Frontend (Vercel)
1. Import your GitHub repository to Vercel
2. Set root directory to `frontend/`
3. Set environment variable:
   - `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy!

> After deploying, run the seeder by accessing your Render shell:
> `node src/utils/seeder.js`

## 🔒 Security Practices

- Passwords hashed with **bcrypt** (12 rounds)
- Access tokens expire in **15 minutes**
- Refresh tokens expire in **7 days** (stored in DB, invalidated on logout)
- Inactive users receive **403 Forbidden** on login
- All endpoints validate input with **express-validator**
- **Helmet.js** sets secure HTTP headers
- Rate limiting prevents brute-force attacks
- Password hashes **never returned** in API responses
- Environment variables for all secrets

## 📄 Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, lowercase),
  password: String (hashed, select: false),
  role: Enum['admin', 'manager', 'user'] (default: 'user'),
  status: Enum['active', 'inactive'] (default: 'active'),
  refreshToken: String (select: false),
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 👨‍💻 Author

Built for Purple Merit Technologies MERN Stack Intern Assessment.
