# AI Resume Analyzer & Career Assistant 🎯

An enterprise-grade, production-ready, full-stack monorepo application featuring secure JWT authentication, a premium glassmorphic dark-mode analytics dashboard, binary parsing (.pdf/.docx), automated ATS score audits, interactive resume builders, job recommendations, and AI-driven skill gap evaluations powered by the official Gemini AI SDK.

> [!NOTE]
> **LOCAL DEVELOPMENT & DEPLOYMENT**:
> This application is specifically designed to run **locally** on your machine. Because it uses local environment configurations (such as your private Gemini API Key stored in `.env`), binds to local ports (3000 and 5000), and implements a seamless local JSON-file datastore fallback when MongoDB is offline, it cannot be hosted as a generic global web app without setting up server hosting and security gateways. Running it locally guarantees full privacy of your uploaded resumes and direct API control!

---

## 🛠 Tech Stack (Strictly Implemented)
* **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Recharts, React Router, Axios, Lucide React
* **Backend**: Node.js, Express.js, Multer
* **Database**: MongoDB (via Mongoose schemas)
* **Authentication**: JWT & bcrypt password hashing
* **AI Engine**: Official `@google/genai` (Gemini API Integration with Structured Outputs)

---

## 📂 Core Folder Layout
```
resume-analyzer/
├── package.json (Monorepo dev orchestrator)
├── backend/
│   ├── .env (Active configuration file)
│   ├── server.js (Express entrance)
│   ├── config/db.js (MongoDB config)
│   ├── models/ (User.js, Resume.js, Analysis.js, Job.js schemas)
│   ├── middleware/auth.js (JWT validation)
│   ├── controllers/ (Auth, Resume, Analysis, Job controllers)
│   ├── routes/ (Auth, Resume, Analysis, Job routes)
│   └── services/
│       ├── aiService.js (Official Gemini SDK integrations)
│       └── parserService.js (PDF-parse & Mammoth extraction)
└── frontend/
    ├── vite.config.js (API proxy configuration)
    ├── tailwind.config.js (Glassmorphic theme setup)
    └── src/
        ├── index.css (Central CSS & A4 print declarations)
        ├── App.jsx (Router protected boundaries)
        ├── components/ (Sidebar, Navbar, GlassCard, ResumePreview)
        └── pages/ (Login/Register, Dashboard, Upload, Analysis, Builder, Jobs, SkillGap, Settings)
```

---

## 🚀 Key Architectural Integrations

### 1. 100% ATS-Friendly Resume Layout (Jake's/Harvard Standard)
Two-column layouts, visual bars, grids, or custom icons notoriously scramble Applicant Tracking Systems (which parse text strictly left-to-right, top-to-bottom). When a user clicks **Download PDF** inside the Builder, the system opens a clean sandboxed document compiling a **strictly structured, single-column, standard A4 paper format** with clean margins and text-selectable elements (no canvas conversions). This guarantees perfect compatibility with all enterprise recruiters.

### 2. High-Fidelity Mock AI Fallback
To ensure a **flawless, out-of-the-box local operation**, the `aiService.js` has a built-in fallback parser, analyzer, rewriter, and matchmaking generator. The system inspects your uploaded resumes for key tech terms (e.g. React, Node, SQL) and generates highly customized dashboard metrics. 
* Once you paste your live `GEMINI_API_KEY` into `backend/.env`, the system instantly upgrades to live Gemini-powered AI analytics.

### 3. Immediate Value Welcome Template
To eliminate signup friction, every new user is automatically assigned a **pre-filled ATS-friendly developer resume template** upon sign-up. They can instantly view its ATS Audit breakdown, play in the rewriter sandbox, match it against mock jobs, or customize it and download their PDF in minutes.

---

## 🖥️ Local Installation & Setup

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (Local instance running at `mongodb://localhost:27017` or a MongoDB Atlas URI string)

### Step 1: Clone & Setup Directories
Open your terminal in this `resume-analyzer` directory.

### Step 2: Install Monorepo Dependencies
Run the following orchestrator command to install packages across the root, backend, and frontend directories:
```bash
npm run install-all
```

### Step 3: Configure Environment Variables
1. Navigate to the `/backend` folder.
2. Locate the `.env` file (pre-created for you).
3. Insert your **MongoDB URI** and **Gemini API Key**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume_analyzer
JWT_SECRET=super_secure_resume_analyzer_jwt_secret_key_13579
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 4: Run the Application Locally
From the **root monorepo directory**, launch both the React Vite frontend and Express server concurrently in a single thread:
```bash
npm run dev
```

* **Frontend Dashboard**: Open [http://localhost:3000/](http://localhost:3000/)
* **Backend API server**: Open [http://localhost:5000/](http://localhost:5000/)

---

## 📋 Comprehensive Checklist for Recruiters
* **Authentication Flow**: Test JWT login and signup (assigns welcome starter).
* **Dropzone Upload**: Upload standard PDF or DOCX file (executes backend Multer stream buffers).
* **ATS Compliance Audits**: Evaluates breakdowns, lists lacking gaps, visual styles, and suggestions.
* **AI Bullet Playground**: Paste *"wrote backend features"* and click optimize to receive high-impact metrics options.
* **Real-time builder**: Edit live forms and verify real-time modifications in A4 paper layout.
* **Skill Gap Radar Roadmaps**: Paste target Senior Job Description to review gap analysis and action roadmaps.
* **Opportunity Matchings**: Seeks DB listings and ranks match percentages automatically based on active resume.
