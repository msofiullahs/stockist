# Stockist

A comprehensive stock management application built with Laravel 12, Inertia.js v2, React 19, TypeScript, and TailwindCSS 4. Available as both a web application and an Electron desktop app.

## Features

### Core Modules
- **Dashboard** with stock overview, charts (monthly in/out trends), top products, low stock alerts, and recent movements
- **Product Management** with images, SKU, pricing, stock tracking per warehouse, and category/supplier association
- **Category Management** with parent-child hierarchy and slug generation
- **Supplier Management** with contact details and active status
- **Warehouse Management** with multi-warehouse stock tracking
- **Stock Movements** (in/out) with full history, user attribution, and warehouse selection
- **Stock Adjustments** with audit trail (increase, decrease, damage, expired, correction)
- **Purchase Orders** with status workflow (draft, pending, approved, shipped, partial, received, cancelled), item management, and goods receiving

### Data Import & Export
- **Excel/CSV Import** for products, categories, suppliers, warehouses, stock movements, and purchase orders
- **Downloadable import templates** with sample data for each entity type
- **Smart duplicate handling** — existing items are silently skipped, new items are imported
- **Row-level error reporting** with detailed feedback on skipped rows
- **Reports** with PDF and Excel export (stock report, movement report)

### Administration
- **Role-Based Access Control** with 4 roles (admin, manager, staff, viewer) and granular permissions
- **User Management** with role assignment (admin only)
- **Customizable App Settings** — app name, currency, currency symbol, theme, and locale
- **Email Notification Settings** — configurable SMTP/mail settings with enable/disable toggle
- **Multi-Language Support** with built-in translation editor (English and Indonesian included)
- **Dark Mode** with system-wide theme persistence

### Notifications
- **Low Stock Notifications** — automatic alerts when product stock falls below minimum threshold, sent via database and email to admin/manager users

### Desktop App
- **Electron Desktop Version** — standalone desktop application with embedded PHP server and SQLite database
- Cross-platform builds for Windows and macOS

## Requirements

### Web Version
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL 8.0+ (or MariaDB 10.3+)

### Desktop Version
- Node.js >= 18
- Electron 40+

## Installation

### 1. Clone and install dependencies

```bash
git clone git@github.com:msofiullahs/stockist.git stockist
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

### Desktop App

```bash
cd stockist-desktop

# Development
npm run electron:dev

# Build for current platform
npm run electron:build

# Build for specific platform
npm run electron:build:win
npm run electron:build:mac
```

## Tech Stack

- **Backend:** Laravel 12, PHP 8.2+
- **Frontend:** React 19, TypeScript, Inertia.js v2
- **Styling:** TailwindCSS 4
- **Build Tool:** Vite 7
- **PDF Export:** DomPDF
- **Excel Import/Export:** Maatwebsite Excel 3.1
- **Permissions:** Spatie Laravel Permission
- **Charts:** ApexCharts
- **Desktop:** Electron 40

## Role Permissions

| Module             | Admin | Manager | Staff | Viewer |
|--------------------|-------|---------|-------|--------|
| Dashboard          | Full  | Full    | View  | View   |
| Products           | CRUD  | CRUD    | CRU   | View   |
| Categories         | CRUD  | CRUD    | CRU   | View   |
| Suppliers          | CRUD  | CRUD    | CRU   | View   |
| Warehouses         | CRUD  | CRUD    | CRU   | View   |
| Stock Movements    | CRUD  | CRUD    | CR    | View   |
| Stock Adjustments  | CRUD  | CRUD    | CR    | View   |
| Purchase Orders    | CRUD  | CRUD    | View  | View   |
| Reports & Export   | Full  | Full    | View  | View   |
| Data Import        | Full  | Full    | -     | -      |
| User Management    | CRUD  | -       | -     | -      |
| Settings           | Full  | -       | -     | -      |
| Translations       | Full  | -       | -     | -      |

## Project Structure

```
app/
├── Http/Controllers/
│   ├── Auth/                  # LoginController
│   ├── Stock/                 # 8 controllers (Product, Category, Supplier, etc.)
│   ├── DashboardController
│   ├── ImportController       # Excel/CSV import with template downloads
│   ├── ProfileController
│   ├── SettingsController
│   ├── TranslationController
│   └── UserManagementController
├── Imports/                   # 6 import classes (Product, Category, etc.)
├── Exports/                   # StockReportExport, MovementReportExport
├── Models/                    # 10 models
├── Notifications/             # LowStockNotification
resources/js/
├── Components/                # 13 shared React components
│   ├── DataTable, Pagination, SearchFilter
│   ├── ImportModal, ConfirmModal, Modal
│   ├── PageHeader, Sidebar, StatsCard, Badge
│   ├── FlashMessage, ImageUpload, NumericInput
├── Layouts/                   # AuthenticatedLayout
├── Pages/                     # 26 page components
│   ├── Auth/                  # Login
│   ├── Dashboard              # Dashboard with charts
│   ├── Profile/               # Edit profile, Change password
│   ├── Stock/
│   │   ├── Products/          # Index, Form, Show
│   │   ├── Categories/        # Index, Form
│   │   ├── Suppliers/         # Index, Form
│   │   ├── Warehouses/        # Index, Form
│   │   ├── Movements/         # Index, Form
│   │   ├── Adjustments/       # Index, Form
│   │   ├── PurchaseOrders/    # Index, Form, Show
│   │   └── Reports/           # StockReport, MovementReport
│   ├── Settings/              # General, Translations
│   └── Users/                 # Index, Form
├── utils/                     # Translation helper with parameter support
└── types.ts                   # TypeScript interfaces
lang/
├── en.json                    # English translations (200+ keys)
└── id.json                    # Indonesian translations (200+ keys)
```

## Data Import

Import data from Excel (.xlsx, .xls) or CSV files for the following entities:

| Entity          | Unique Key    | Template Columns                                                              |
|-----------------|---------------|-------------------------------------------------------------------------------|
| Products        | SKU           | name, sku, description, category, supplier, unit, cost_price, selling_price, minimum_stock, is_active |
| Categories      | Name          | name, description, parent                                                     |
| Suppliers       | Name          | name, email, phone, address, city, country, contact_person, is_active         |
| Warehouses      | Name          | name, location, address, is_active                                            |
| Stock Movements | -             | product_sku, warehouse, type (in/out), quantity, date, notes                  |
| Purchase Orders | Order Number  | order_number, supplier, product_sku, quantity, unit_price, order_date, expected_date, status, notes |

Download import templates directly from each module's index page. Existing records are automatically skipped during import.

## License

Copyright &copy; 2026 Muhammad Sofiullah S.
