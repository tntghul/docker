# ⚡ SMART PORTFOLIO CMS + AI RESUME BUILDER

An intelligent, full-stack personal branding platform featuring an **Admin Content Management System (CMS)** and a **Gemini AI-Powered ATS Resume Generator** tailored to job descriptions.

---

## 🌟 Key Features Implemented

### 1. 🛡️ Module 1: Admin Dashboard CMS
* **JWT Protected Authentication**: Secure login and admin account registration.
* **Unified Profile Manager**: Update bio, headlines, avatar URL, location, and social handles without code changes.
* **Categorized Skills Manager**: Add, edit, and organize skills into Frontend, Backend, Databases, and Tools.
* **Projects CMS**: Add, edit, or remove featured projects with live URLs, GitHub links, and tech stack tags.
* **Work Experience & Timeline**: Manage past roles, duration, location, and achievement bullet points.
* **Education & Certifications**: Manage academic degrees and verifiable certificate credentials.
* **Real-Time Dynamic Theming**: Toggle between *Modern Dark*, *Minimalist Light*, *Emerald Glow*, and *Cyber Indigo*.

### 2. 🌐 Module 2: Dynamic Public Portfolio
* Single Page Portfolio dynamically populated via `GET /api/portfolio/public`.
* Changes made in the Admin CMS reflect immediately on the public website upon save.
* Fully responsive navigation, hero banner, interactive category project filters, career timeline, and contact form.

### 3. 🤖 Module 3: Gemini AI Resume Builder
* **Job Description (JD) Analysis**: Paste any company's job posting to extract requirements.
* **Skills Gap Analysis**: Immediate visual breakdown showing **Matched Skills** (green badges) vs **Missing Requirements** (red badges) with an alignment score percentage.
* **Zero-Hallucination Guardrail**: The system prompt strictly grounds Gemini 2.5 Flash in your verified portfolio data. It never fabricates companies, degrees, or unverified skills.
* **Live A4 Preview & Editor**: Review and adjust tailored summaries and project rankings in real time.
* **Instant ATS PDF Export**: One-click download of vector-clean, print-ready A4 resumes via `html2pdf.js`.

### 4. 📜 Module 4: Resume Management & History
* Save customized resumes for distinct companies and roles (e.g. Full Stack vs Backend vs Frontend).
* View previous resumes, load them back into the live canvas, or delete past versions.

---

## 🚀 How to Run the Project

### 1. Start Backend API
Open **Terminal 1**:
```bash
cd backend
npm run dev
```
* Backend runs on: `http://localhost:5000`
* Connected to: **MongoDB Atlas**
* Health probe: `http://localhost:5000/`

> **Note**: To enable Gemini API, add your key in `backend/.env`:
> ```env
> GEMINI_API_KEY=your_actual_key_here
> ```
> *(A deterministic keyword tailoring engine automatically runs as a seamless fallback if no key is provided).*

---

### 2. Start Frontend Client
Open **Terminal 2**:
```bash
cd frontend
npm run dev
```
* Frontend runs on: `http://localhost:5173`
* Vite automatically proxies `/api` calls to `http://localhost:5000`.

---

## 🗺️ Application Routing

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | **Public Portfolio** | Live, dynamic developer portfolio viewable by recruiters. |
| `/login` | **Admin Login** | Secure sign-in / registration for portfolio owner. |
| `/admin` | **Admin CMS & AI Builder** | Master dashboard with tabbed CMS, AI Resume Builder, and Resume History. |

---

## 📂 Project Architecture

```
portfolio/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection
│   ├── controller/
│   │   ├── authController.js       # Admin authentication & JWT issuing
│   │   ├── portfolioController.js  # CRUD portfolio engine with auto-seeding
│   │   └── resumeController.js     # AI resume generation & history
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT route guard
│   ├── model/
│   │   ├── user.js                 # Admin user model
│   │   ├── Portfolio.js            # Unified portfolio master schema
│   │   └── Resume.js               # Saved tailored resumes schema
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth
│   │   ├── portfolioRoutes.js      # /api/portfolio
│   │   └── resumeRoutes.js         # /api/resume
│   ├── services/
│   │   └── geminiService.js        # Gemini 2.5 Flash SDK + Zero-hallucination engine
│   ├── .env                        # Environment configuration
│   └── server.js                   # Express application entry point
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js           # Axios instance with JWT interceptors
    │   ├── components/
    │   │   └── public/             # Navbar, Hero, About, Skills, Projects, Experience, Contact
    │   ├── pages/
    │   │   ├── HomePage.jsx        # Public live dynamic portfolio
    │   │   ├── LoginPage.jsx       # Admin login screen
    │   │   └── AdminDashboard.jsx  # Complete tabbed CMS & AI Resume Builder
    │   ├── utils/
    │   │   └── pdfExport.js        # html2pdf.js A4 vector export handler
    │   ├── App.jsx                 # Client router
    │   ├── index.css               # Dynamic theme engine & ATS resume canvas
    │   └── main.jsx                # Bootstrap & app bootstrap
    └── vite.config.js              # Proxy configuration for port 5000
```
