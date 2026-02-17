# Stockist

A stock management application built with Laravel 12, Inertia.js v2, React 19, TypeScript, and TailwindCSS 4.

## Features

- **Dashboard** with stock overview, charts, and low stock alerts
- **Product Management** with images, SKU, pricing, and stock tracking
- **Category Management** with parent-child hierarchy
- **Supplier & Warehouse Management**
- **Stock Movements** (in/out) with full history
- **Stock Adjustments** with audit trail
- **Purchase Orders** with status workflow (draft, pending, approved, received, cancelled)
- **Reports** with PDF and Excel export (stock report, movement report)
- **Role-Based Access Control** (admin, manager, staff, viewer)
- **Multi-Language Support** with translation management UI
- **Dark Mode**
- **Customizable App Name** via settings
- **Low Stock Notifications**

## Requirements

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL 8.0+ (or MariaDB 10.3+)

## Installation

### 1. Clone and install dependencies

```bash
git clone <repository-url> stockist
cd stockist
composer install
npm install
```

### 2. Environment setup

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and configure your database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stockist
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 3. Database setup

```bash
php artisan migrate
php artisan db:seed
```

This creates the roles/permissions and demo data including these accounts:

| Email                    | Password   | Role    |
|--------------------------|------------|---------|
| admin@stockist.test      | password   | Admin   |
| manager@stockist.test    | password   | Manager |
| staff@stockist.test      | password   | Staff   |
| viewer@stockist.test     | password   | Viewer  |

### 4. Storage link

```bash
php artisan storage:link
```

## Running the App

### Development

```bash
composer dev
```

This starts all services concurrently:
- Laravel dev server (`php artisan serve`)
- Queue worker
- Log viewer (Pail)
- Vite dev server (hot reload)

Or run them separately:

```bash
# Terminal 1 - Laravel server
php artisan serve

# Terminal 2 - Vite dev server
npm run dev
```

The app will be available at `http://localhost:8000`.

### Production

```bash
# Build frontend assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force
```

Point your web server (Nginx/Apache) to the `public/` directory.

## Tech Stack

- **Backend:** Laravel 12, PHP 8.2+
- **Frontend:** React 19, TypeScript, Inertia.js v2
- **Styling:** TailwindCSS 4
- **Build Tool:** Vite 7
- **PDF Export:** DomPDF
- **Excel Export:** Maatwebsite Excel
- **Permissions:** Spatie Laravel Permission
- **Charts:** ApexCharts

## Project Structure

```
app/
├── Http/Controllers/       # 11 controllers
├── Models/                 # 8 models (Product, Category, Supplier, etc.)
├── Notifications/          # Low stock notification
resources/js/
├── Components/             # Shared React components
├── Layouts/                # AuthenticatedLayout
├── Pages/                  # 26 page components
│   ├── Auth/               # Login
│   ├── Dashboard/          # Dashboard
│   ├── Products/           # CRUD + stock views
│   ├── Categories/         # CRUD
│   ├── Suppliers/          # CRUD
│   ├── Warehouses/         # CRUD
│   ├── Stock/              # Movements, Adjustments, Purchase Orders
│   ├── Reports/            # Stock & Movement reports
│   ├── Settings/           # General settings, Translations
│   └── Users/              # User management
├── utils/                  # Translation helper
└── types.ts                # TypeScript interfaces
lang/
├── en.json                 # English translations
└── id.json                 # Indonesian translations
```

## License

Copyright &copy; 2026 Muhammad Sofiullah S.
