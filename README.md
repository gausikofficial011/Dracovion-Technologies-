# DRACOVION TECHNOLOGIES
### ENGINEERING THE FUTURE. BUILDING BEYOND LIMITS.

Official enterprise digital platform for **DRACOVION TECHNOLOGIES**, founded by **Gausik Srinivasan**.

---

## 1. Brand Identity & Design Direction

- **Company Name:** DRACOVION TECHNOLOGIES
- **Owner & Principal Architect:** Gausik Srinivasan
- **Tagline:** ENGINEERING THE FUTURE. BUILDING BEYOND LIMITS.
- **Design Direction:** Cinematic Futuristic Luxury
- **Primary Palette:** Midnight Black (`#050609`, `#0A0D13`, `#11151D`) & Antique Gold (`#D6A94F`, `#F5D18A`, `#FFBD55`)
- **Secondary Cyber Blue:** `#78BFFF`
- **Typography:** Space Grotesk (Editorial Display), Inter (Body & Data Tables), Sora (Section Badges & Labels)
- **Primary Origin Market:** Tamil Nadu, India (with Global Delivery Scalability)

---

## 2. Architecture & Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 with bespoke Obsidian & Antique Gold tokens
- **Motion & Animations:** Framer Motion, GSAP, Lenis Smooth Scrolling, Canvas Particle Conduits
- **Icons:** Lucide React & bespoke geometric SVG dragon logo system
- **Routing & State:** React Router v7, Context API, React Hook Form, Zod

### Backend
- **Runtime:** Node.js + Express.js with strict TypeScript
- **Database:** MongoDB Atlas (Mongoose ODM) with embedded in-memory MongoDB runner for zero-dependency local development and test execution
- **Security:** Bcrypt password hashing, express-session (HttpOnly, SameSite, Secure cookies), Helmet, CORS, Express-Rate-Limit, Zod payload validation, and tamper-evident audit logging
- **Testing:** Vitest suite with Supertest and MongoDB Memory Server

---

## 3. Complete Website Navigation & Pages

### Public Corporate Pages
- `/`: Cinematic 12-section homepage (Hero, Highlights, Services, About, Tech Ecosystem, Products, Projects, Why Choose Us, Workflow, Testimonials, Contact Form, Footer)
- `/about`: Company information, founder heritage, mission, vision, and core engineering doctrine
- `/services`: End-to-End IT solutions catalog (8 core enterprise capabilities + Allhunter student services)
- `/services/:slug`: Dedicated detail pages for each service:
  - `/services/web-development`
  - `/services/mobile-development`
  - `/services/ai-ml`
  - `/services/software-development`
  - `/services/ui-ux-design`
  - `/services/cloud-solutions`
  - `/services/database-management`
  - `/services/it-consulting`
- `/products`: Proprietary digital innovations showcase (Allhunter, Dracovion Nexus ERP, Dracovion SecureVault)
- `/projects` / `/portfolio`: Portfolio case studies gallery with category filtering
- `/portfolio/:slug`: High-resolution architectural case study breakdowns
- `/allhunter`: Dedicated student engineering and capstone prototype mentoring hub
- `/pricing`: Transparent indicative pricing and milestone payment structure
- `/faq`: Comprehensive questions and transparent service policies
- `/careers`: Engineering culture, values, and open positions
- `/contact`: Direct founder contact, inquiry submission, and Tamil Nadu headquarters details
- `/privacy`: Data protection and privacy policy
- `/terms`: Terms of service and intellectual property ownership
- `/cookies`: Essential HTTP session cookie policy
- `/refund-policy`: Transparent milestone-based payment release and dispute policy
- `*`: Custom 404 luxury uncharted coordinate page

### The Two Distinct User Portals
The platform features **two user portals**:

#### 1. Client Portal (`/portal/*`)
- **Public Client Sign-Up & Sign-In (`/portal/signup` & `/portal/login`):**
  - Gmail verification with 6-digit OTP codes sent directly via Gmail SMTP.
  - Native Google OAuth 2.0 & GitHub OAuth single sign-on.
  - Secure rate-limiting, bcrypt-hashed OTP storage, and 5-minute MongoDB TTL auto-cleanup.
- **Client Project Ordering Wizard (`/portal/order/new`):**
  - Clients can place project orders for **Websites, Full-Stack Web Applications, Mobile Apps, Enterprise Systems, and AI/ML Solutions**.
  - Customizable budget ranges and delivery timelines.
  - Generates immutable tracking numbers (`DRV-YYYY-XXXX`).
- **Interactive Project Milestones & Tracking (`/portal/order/:id`):**
  - 6-stage lifecycle: `Submitted` → `Technical Review` → `Quotation Prepared` → `Active Development` → `Deliverable Handover` → `Completed`.
  - Displays assigned lead engineer details and direct notes with real-time Gmail updates.

#### 2. Internal Company Workspace (`/workspace/*`)
- **Role Isolation:** For **Super Admin (Gausik Srinivasan), Company Owner, CEO, and Employees**.
- **Strict Lockdown:** Zero public registration. Staff accounts can **only be provisioned by the Super Admin** (`/workspace/super-admin`).
- **Permanent Account Protection:** Staff accounts are permanent and fixed; **only the Super Admin has the authority to permanently delete worker accounts**.
- **Shared Orders Queue (`/workspace/orders`):**
  - When a client submits an order, it immediately appears on the triage dashboard visible to **Owner, CEO, and all Employees**.
  - Employees can claim / self-assign to projects (`PATCH /api/v1/orders/:id/assign`).
  - Employees update status and attach internal and client notes, automatically triggering branded Gmail alerts to the client.

---

## 4. Portals & Access Governance

| Portal | Route | Access |
| :--- | :--- | :--- |
| **Client Portal** | `/portal/dashboard` | Self-registered clients (via `/signup` or Google OAuth) |
| **Student Portal** | `/student/dashboard` | Self-registered students via `/signup` |
| **Partner Portal** | `/partner/dashboard` | Self-registered partners via `/signup` |
| **Internal Workspace** | `/workspace/orders` | Provisioned company staff & leadership (credentials configured in `.env` / Super Admin) |
| **Super Admin Governance** | `/workspace/super-admin` | Super Admin only (configured via `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` in `.env`) |
| **Admin Portal** | `/admin/dashboard` | Platform Owner / Admin only |

---

## 4. Quickstart & Local Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone repository
git clone https://github.com/gausikofficial011/Dracovion-Technologies-.git
cd Dracovion-Technologies-

# Install dependencies across both workspaces
npm install
```

### Running Locally
```bash
# Start backend (Port 5000) and frontend (Port 5173) concurrently
npm run dev

# Or start individually:
npm run dev:backend
npm run dev:frontend
```

### Running Tests & Verification
```bash
# Run backend vitest suite & frontend type check
npm run test

# Run production build for both workspaces
npm run build
```

---

## 5. Security & Verification Guarantee

- **Zero Fabricated Claims:** All statistics, credentials, and testimonials are verified.
- **Strict Role Protection:** Backend routes enforce role-based access checks (Owner, Admin, Client, Student).
- **Type-Safety:** 100% end-to-end type safety across backend controllers, models, and frontend interfaces.

---

&copy; 2026 DRACOVION TECHNOLOGIES. All rights reserved. Founded by Gausik Srinivasan.
