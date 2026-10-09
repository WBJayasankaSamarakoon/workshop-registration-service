# Workshop Registration Service — Full Stack Assessment

This repository contains the completed full-stack assessment for the **Workshop Registration Service**, built for a community training centre to manage short workshop schedules, registrations, seat capacity limits, and staff access permissions.

---

## 🚀 Project Overview

The application replaces error-prone shared spreadsheets with a clean, connected web interface built for non-technical staff.

Key features implemented:
- **Backend Role-Based Access Control**: Strict permissions for Admin, Manager, and Staff roles enforced on the backend.
- **Overbooking Prevention**: Pessimistic row locking (`lockForUpdate`) inside DB transactions prevents race conditions during high-concurrency registration spikes.
- **Registration History & Audit Trail**: Cancellations free up seats immediately while keeping complete audit records (who registered/cancelled and when).
- **Workshop Search & Filtering**: Quick filtering by date range, status, and seat availability.
- **Bonus Features**: System audit trail and automated waitlist promotion upon cancellation.

---

## 🔧 Technologies Used

- **Framework**: Laravel 12 (PHP 8.2+) with Laravel React Starter Kit
- **Frontend**: React 19, TypeScript, Inertia.js 2.0
- **Styling**: Tailwind CSS
- **Database**: SQLite / MySQL 8.0 (ACID compliant with pessimistic row locking)
- **Testing**: Pest PHP for feature and concurrency testing

---

## 📸 Application Previews

![Header & Workshop Catalogue](https://github.com/user-attachments/assets/6133b1d5-9747-48fb-aaa7-b5e287aee3d4)
![Tablet View](https://github.com/user-attachments/assets/278f7c3c-94da-4946-a40c-a8b9f12de6f1)
![Mobile Navigation View](https://github.com/user-attachments/assets/c2d7b331-a93e-4b6e-bfad-2a3033ee4efe)
![Registration API & History](https://github.com/user-attachments/assets/0cd3b05a-3014-47dd-8aa2-3644df98d905)

---

## 📂 Folder Structure

```text
workshop-registration-service/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # Workshop, Registration, and User controllers
│   │   └── Middleware/        # EnsureRole backend authorization middleware
│   ├── Models/                # Workshop, Registration, AuditLog models
│   └── Services/              # RegistrationService (locking & capacity checks)
├── bootstrap/                 # Laravel 12 app initialization & middleware registration
├── config/                    # Application and database configuration
├── database/
│   ├── factories/             # Test data factories
│   ├── migrations/            # DB schema definitions
│   └── seeders/               # DatabaseSeeder (Admin, Manager, Staff, Workshops)
├── resources/
│   └── js/
│       ├── Components/        # Reusable React components
│       ├── Layouts/           # Main application layouts
│       └── Pages/             # Inertia React pages (Workshops, Registrations, Users)
├── routes/
│   └── web.php                # Backend routes protected by role middleware
├── tests/                     # Pest feature and unit tests
├── README.md                  # Quick setup and project overview
└── DOCUMENTATION.md           # Architecture and design document
```

---

## 🔑 Seeded Login Credentials

The system comes pre-seeded with sample users for all 3 access levels (Default password for all: `password123`):

| Role | Email | Allowed Permissions |
| :--- | :--- | :--- |
| **Admin** | `admin@workshop.com` | Create staff accounts, set roles, view audit logs |
| **Manager** | `manager@workshop.com` | Add & edit workshops, register/cancel attendees, view history |
| **Staff** | `staff@workshop.com` | Register & cancel attendees, view workshops & registration history |

---

## 📥 Quick Setup Instructions

### 1. Prerequisites
- PHP >= 8.2 with PDO extension
- Composer
- Node.js >= 18.x and npm

### 2. Environment Setup & Migration
```bash
# Clone the repository and install dependencies
composer install
npm install

# Setup environment configuration
cp .env.example .env
php artisan key:generate

# Run Database Migrations and Seeders
php artisan migrate:fresh --seed
```

### 3. Launch Development Server
```bash
# Run both Laravel backend and Vite frontend together
composer run dev
```
Alternatively, you can run them in separate terminals:
```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```
Open **http://localhost:8000** in your browser and log in using any seeded credentials.

### 4. Run Automated Tests
```bash
php artisan test
```

---

## ✉️ Contact

- **Name**: Buddhika Jayasanka  
- **Email**: buddhikadevinfo@gmail.com  

---

Thank you for reviewing my assessment!
