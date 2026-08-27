# FurShield — Full-Stack Pet Care Platform

A comprehensive pet care management system with role-based dashboards for Pet Owners, Veterinarians, and Animal Shelters. Built with React 18 + Vite on the frontend and plain PHP with MySQL on the backend.

## Features

### Public Website
- Beautiful landing page with animated sections
- Ecosystem showcase, health passport, vet directory, adoption center, care center, and shop previews
- Fully responsive design with dark/light mode support

### Authentication
- Register as **Pet Owner**, **Veterinarian**, or **Animal Shelter**
- Secure login with session-based authentication
- Role-based access control with protected routes

### Pet Owner Dashboard
- **My Pets** — Add, edit, delete pets with image upload
- **Health Records** — Medical timeline with vaccinations, allergies, treatments
- **Appointments** — Book, view, cancel appointments with vets
- **Veterinarians** — Search and filter vet directory
- **Products** — Browse and search product catalog
- **Cart & Orders** — Shopping cart, place orders, order history
- **Adoption** — Browse adoptable pets, submit applications
- **Care Center** — Articles, FAQs on pet care
- **AI Assistant** — Chat with Google Gemini-powered pet care AI
- **Notifications** — Real-time in-app notifications
- **Reviews** — Rate and review vets and products
- **Profile** — Edit profile, change password

### Veterinarian Dashboard
- **Appointments** — Approve, reject, complete appointment requests
- **Patients** — View patient list from confirmed appointments
- **Medical Records** — Add diagnosis, treatment, and vaccination records
- **Availability** — Manage available time slots
- **Reviews** — View patient reviews and ratings
- **Profile** — Edit professional information

### Shelter Dashboard
- **Adoption Listings** — CRUD for adoptable animals with images
- **Applications** — Review, approve, reject adoption applications
- **Care Logs** — Track feeding, grooming, and medical logs per pet
- **Profile** — Edit shelter information

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, react-router-dom, framer-motion, lucide-react |
| Backend | PHP 8+ with PDO |
| Database | MySQL 8 (via XAMPP) |
| AI | Google Gemini API (via PHP proxy) |
| Auth | PHP sessions with bcrypt password hashing |
| Themes | CSS variables with dark/light mode |

## Setup Instructions

### Prerequisites
- XAMPP (Apache + MySQL) installed and running
- Node.js 18+ and npm
- Google Gemini API key (optional, for AI chatbot)

### 1. Database Setup
1. Start XAMPP Apache and MySQL
2. Open phpMyAdmin at `http://localhost/phpmyadmin`
3. Create a new database named `furshield`
4. Import `database/furshield.sql`

### 2. Backend Configuration
1. Copy `backend/.env.example` to `backend/.env`
2. Update database credentials in `.env`:
   ```
   DB_HOST=localhost
   DB_NAME=furshield
   DB_USER=root
   DB_PASS=
   ```
3. (Optional) Add your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_key_here
   ```

### 3. Frontend Setup
```bash
cd FurShield
npm install
```

### 4. File Placement
Place the entire `FurShield` folder inside your XAMPP `htdocs` directory:
```
C:\xampp\htdocs\furshield\
```

### 5. Run the Application
1. Start Apache in XAMPP
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser

### Production Build
```bash
npm run build
```
The built files will be in `dist/`. Copy them alongside the `backend/` folder to your web server.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Pet Owner | owner@furshield.com | password123 |
| Veterinarian | vet@furshield.com | password123 |
| Shelter | shelter@furshield.com | password123 |

See `DEMO_CREDENTIALS.md` for full account details.

## API Overview

All API endpoints are at `http://localhost/furshield/backend/api/`.

### Auth
- `POST /auth/register.php` — Register new user
- `POST /auth/login.php` — Login
- `POST /auth/logout.php` — Logout
- `GET /auth/me.php` — Current user

### Pets
- `GET /pets/list.php` — List user's pets
- `POST /pets/create.php` — Create pet (FormData)
- `POST /pets/update.php` — Update pet (FormData)
- `DELETE /pets/delete.php?id=` — Delete pet

### Health
- `GET /health/records.php` — List health records
- `POST /health/add_record.php` — Add record (FormData)
- `GET /health/vaccinations.php` — List vaccinations

### Appointments
- `GET /appointments/list.php` — List appointments
- `POST /appointments/book.php` — Book appointment
- `POST /appointments/update_status.php` — Update status (vet)
- `POST /appointments/cancel.php` — Cancel (owner)
- `POST /appointments/add_notes.php` — Add notes (vet)

### Products & Orders
- `GET /products/list.php` — Browse products
- `POST /cart/add.php` — Add to cart
- `GET /cart/list.php` — View cart
- `POST /orders/place.php` — Place order

### Adoption
- `GET /adoption/listings.php` — Public listings
- `POST /adoption/apply.php` — Submit application
- `GET /adoption/shelter_listings.php` — Shelter's listings
- `GET /adoption/shelter_applications.php` — Shelter's applications

### Vets
- `GET /vets/list.php` — Vet directory
- `GET /vets/profile.php?id=` — Vet profile
- `POST /vets/set_availability.php` — Manage availability (vet)

### Other
- `GET /care/articles.php` — Care articles
- `GET /care/faqs.php` — FAQs
- `GET /notifications/list.php` — Notifications
- `POST /chat/send.php` — AI chat message
- `POST /contact/submit.php` — Contact form

## Project Structure

```
FurShield/
├── src/                        # React frontend
│   ├── components/             # Reusable UI components
│   ├── context/                # AuthContext, ThemeContext
│   ├── dashboards/             # Owner, Vet, Shelter dashboards
│   │   ├── owner/              # 14 owner sub-pages
│   │   ├── vet/                # 7 vet sub-pages
│   │   └── shelter/            # 5 shelter sub-pages
│   ├── layouts/                # DashboardLayout
│   ├── pages/                  # Home, Login, Register
│   ├── services/               # API client
│   ├── main.jsx                # Entry point with router
│   └── styles.css              # Global styles + theme variables
├── backend/                    # PHP backend
│   ├── api/                    # Route endpoints (auth, pets, etc.)
│   ├── config/                 # db.php, cors.php, env.php
│   ├── helpers/                # response.php, validate.php
│   ├── middleware/             # auth.php, role.php
│   ├── uploads/                # File uploads directory
│   └── .env                    # Environment configuration
├── database/
│   └── furshield.sql           # Complete schema + seed data
└── package.json
```

## Security Features
- All passwords hashed with `password_hash()` (bcrypt)
- All SQL queries use PDO prepared statements
- File upload validation (type, size, MIME check)
- Secure file naming with `uniqid()`
- CORS properly configured
- API keys never exposed to frontend
- PHP execution blocked in uploads directory
