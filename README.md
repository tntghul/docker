# Portfolio Fullstack Integration (Backend + Frontend)

Yeh project **Express + MongoDB (Backend)** aur **React + Vite (Frontend)** ko aapas mein integrate karta hai.

---

## 🚀 Kaise Run Karein (How to Run)

### 1. Backend Start Karein:
Terminal 1 open karein:
```bash
cd backend
npm run dev
```
Backend chalega: `http://localhost:3000`

### 2. Frontend Start Karein:
Terminal 2 open karein:
```bash
cd frontend
npm run dev
```
Frontend chalega: `http://localhost:5173`

---

## 🛠️ Integration Details (Kya-kya add aur fix kiya gaya):

1. **Backend Improvements:**
   - **Body Parser Middleware (`express.json()`)**: Added in `backend/server.js` taki POST request se aane wala `req.body` backend read kar sake.
   - **CORS Middleware**: Enable kiya gaya taki browser cross-origin requests (`localhost:5173` se `localhost:3000`) ko block na kare.
   - **Robust Routes**:
     - `POST /api/users/addUser`: New user signup / registration ke liye.
     - `POST /api/users/login`: Existing user login ke liye.
     - `GET /api/users/allUser`: Registered users fetch karne ke liye.
   - **Reliable `.env` loading**: `backend/config/db.js` mein path resolve kiya gaya taki kahin se bhi backend run karne par MongoDB URI detect ho sake.

2. **Frontend Improvements:**
   - **API Service (`frontend/src/api/userApi.js`)**: Dedicated API layer banayi gayi jo `addUser`, `login`, aur `allUser` endpoints ko call karti hai.
   - **Vite Proxy Config (`frontend/vite.config.js`)**: Vite dev server mein `/api` proxy set ki gayi jo automatically `http://localhost:3000` par forward karti hai.
   - **React Router Navigation (`frontend/src/App.jsx`)**:
     - `/` aur `/signup` -> Signup / Login page
     - `/dashboard` -> Dashboard page
   - **Interactive Signup Page (`frontend/src/components/Signup.jsx`)**:
     - Real-time form state (`email`, `password`)
     - Sign Up aur Log In toggle
     - Loading spinner aur error/success alerts
     - Successful submission par user data save karke dashboard par auto-redirect
   - **Connected Dashboard Page (`frontend/src/components/Dashboard.jsx`)**:
     - Logged-in user information display
     - Live users list fetch from MongoDB (`GET /api/users/allUser`)
     - Refresh Data button aur Logout functionality
