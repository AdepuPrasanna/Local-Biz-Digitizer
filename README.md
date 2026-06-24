# 🛍️ BizEase — Local Biz Digitizer

A mobile-first Micro-SaaS platform for small neighborhood businesses (kirana stores, cafes, pharmacies) to digitize their operations — billing, inventory, customer credit tracking, and WhatsApp receipts — all from a phone.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Admin Panel](#admin-panel)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

---

## ✨ Features

| Feature                     | Description                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------- |
| 🔐 **Authentication**       | Email/password auth via Supabase                                                   |
| 🏪 **Shop Setup**           | One-step shop registration with profile management                                 |
| 📦 **Inventory Management** | Add, edit, delete products with stock tracking and low-stock alerts                |
| 🧾 **Smart Billing**        | Create bills with cost/selling price, discounts, and automatic inventory deduction |
| 📲 **WhatsApp Receipts**    | Send digital receipts directly to customers via Twilio WhatsApp API                |
| 👥 **Customer Management**  | Track customers and their credit (udhar) with full ledger history                  |
| 📷 **OCR Bill Scanning**    | Snap supplier invoices — AI/OCR auto-parses and updates inventory                  |
| 📊 **Dashboard**            | Real-time stats: today's sales, low-stock alerts, pending credit, recent bills     |
| 🛡️ **Admin Console**        | Platform-wide shop management, duty toggling, and admin access control             |
| 🔄 **Open/Closed Toggle**   | Shop owners can toggle their open/closed status from the app                       |

---

## 🛠️ Tech Stack

### Frontend

- **React 19** + **Vite 8**
- **Tailwind CSS 3** — utility-first styling
- **React Router DOM 7** — client-side routing
- **Axios** — HTTP client with Supabase JWT interceptor
- **Lucide React** — icon library
- **React Hot Toast** — notifications
- **Supabase JS** — auth session management

### Backend

- **Node.js** + **Express 4**
- **Supabase** (PostgreSQL) — database & storage
- **Tesseract.js** — OCR for supplier invoice scanning
- **Twilio** — WhatsApp messaging API
- **Multer** — file upload handling
- **CORS** + **dotenv**

### Infrastructure

- **Supabase** — Auth, Database, Storage
- **Render** — Backend hosting (`render.yaml` included)
- **Vite** — Frontend build tool

---

## 📁 Project Structure

```
bizease/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js          # Supabase client
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification
│   │   │   └── admin.js             # Admin access guard
│   │   └── routes/
│   │       ├── shop.js              # Shop setup & profile
│   │       ├── products.js          # Inventory CRUD
│   │       ├── customers.js         # Customer management
│   │       ├── bills.js             # Bill creation & history
│   │       ├── credit.js            # Credit ledger
│   │       ├── ocr.js               # Invoice scanning
│   │       ├── whatsapp.js          # WhatsApp receipts
│   │       ├── dashboard.js         # Dashboard stats
│   │       └── admin.js             # Admin console APIs
│   ├── .env.example
│   ├── package.json
│   └── render.yaml                  # Render deployment config
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── BottomNav.jsx
    │   │   ├── BillReceipt.jsx
    │   │   └── SearchSelect.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ShopContext.jsx
    │   ├── lib/
    │   │   ├── api.js               # Axios instance + interceptor
    │   │   └── supabase.js          # Supabase client
    │   └── pages/
    │       ├── Home.jsx             # Landing page
    │       ├── Login.jsx / Register.jsx
    │       ├── ShopSetup.jsx
    │       ├── Dashboard.jsx
    │       ├── Inventory.jsx
    │       ├── NewBill.jsx
    │       ├── BillHistory.jsx
    │       ├── Customers.jsx / CustomerDetail.jsx
    │       ├── ScanBill.jsx
    │       ├── Profile.jsx
    │       └── admin/
    │           ├── AdminLayout.jsx
    │           ├── AdminOverview.jsx
    │           ├── AdminShops.jsx
    │           ├── AdminShopDetail.jsx
    │           └── AdminBills.jsx
    ├── .env.example
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js **≥ 20.0.0**
- A [Supabase](https://supabase.com) project
- A [Twilio](https://twilio.com) account with WhatsApp sandbox enabled

---

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your environment variables (see below)
npm run dev
```

The backend runs on `http://localhost:5000` by default.

---

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your environment variables (see below)
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key_here

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_BASE_URL=http://localhost:5000
```

---

## 📡 API Reference

All routes are prefixed with `/api`. Protected routes require a `Bearer <token>` header.

### Shop

| Method | Route               | Description               |
| ------ | ------------------- | ------------------------- |
| GET    | `/api/shop/me`      | Get current shop profile  |
| POST   | `/api/shop/setup`   | Create or update shop     |
| PUT    | `/api/shop/profile` | Update shop details       |
| PUT    | `/api/shop/duty`    | Toggle open/closed status |

### Products

| Method | Route               | Description       |
| ------ | ------------------- | ----------------- |
| GET    | `/api/products`     | List all products |
| POST   | `/api/products`     | Add a product     |
| PUT    | `/api/products/:id` | Update a product  |
| DELETE | `/api/products/:id` | Delete a product  |

### Bills

| Method | Route            | Description                                          |
| ------ | ---------------- | ---------------------------------------------------- |
| GET    | `/api/bills`     | List all bills                                       |
| GET    | `/api/bills/:id` | Get bill details                                     |
| POST   | `/api/bills`     | Create a bill (deducts stock, adds credit if unpaid) |

### Customers

| Method | Route                | Description        |
| ------ | -------------------- | ------------------ |
| GET    | `/api/customers`     | List all customers |
| POST   | `/api/customers`     | Add a customer     |
| PUT    | `/api/customers/:id` | Update a customer  |

### Credit

| Method | Route                     | Description                 |
| ------ | ------------------------- | --------------------------- |
| GET    | `/api/credit/:customerId` | Get credit ledger & balance |
| POST   | `/api/credit`             | Add credit or payment entry |

### OCR

| Method | Route                    | Description                                 |
| ------ | ------------------------ | ------------------------------------------- |
| POST   | `/api/ocr/scan`          | Upload invoice image → returns parsed items |
| POST   | `/api/ocr/apply/:scanId` | Apply parsed items to inventory             |

### WhatsApp

| Method | Route                        | Description                       |
| ------ | ---------------------------- | --------------------------------- |
| POST   | `/api/whatsapp/send/:billId` | Send WhatsApp receipt to customer |

### Dashboard

| Method | Route            | Description                                            |
| ------ | ---------------- | ------------------------------------------------------ |
| GET    | `/api/dashboard` | Today's sales, low-stock, pending credit, recent bills |

---

## 🛡️ Admin Panel

Accessible at `/admin` — requires `is_admin: true` on the shop record.

### Admin API Routes (all require admin middleware)

| Method | Route                        | Description                   |
| ------ | ---------------------------- | ----------------------------- |
| GET    | `/api/admin/stats`           | Platform-wide overview        |
| GET    | `/api/admin/shops`           | List all shops                |
| GET    | `/api/admin/shops/:id`       | Shop detail with stats        |
| PUT    | `/api/admin/shops/:id/duty`  | Toggle any shop's duty status |
| PUT    | `/api/admin/shops/:id/admin` | Grant or revoke admin access  |
| GET    | `/api/admin/bills`           | Last 100 bills platform-wide  |

To grant admin access, set `is_admin = true` directly in the Supabase `shops` table for the first admin. Subsequent admins can be managed from the Admin Console.

---

## 🚢 Deployment

### Backend — Render

A `render.yaml` is included in `backend/`. Push to your repo and connect it to [Render](https://render.com). Set the environment variables in the Render dashboard.

```yaml
# backend/render.yaml (already configured)
services:
  - type: web
    name: bizease-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
```

### Frontend — Vercel / Netlify

```bash
cd frontend
npm run build
# Deploy the `dist/` folder to Vercel, Netlify, or any static host
```

Set `VITE_API_BASE_URL` to your deployed backend URL.

---

## 🗄️ Supabase Database Schema

The app expects the following tables in your Supabase project:

| Table           | Key Columns                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| `shops`         | `id`, `owner_id`, `shop_name`, `owner_name`, `phone`, `address`, `duty_status`, `is_admin`                 |
| `products`      | `id`, `shop_id`, `name`, `quantity`, `unit`, `purchase_price`, `selling_price`                             |
| `customers`     | `id`, `shop_id`, `name`, `phone`, `total_credit`                                                           |
| `bills`         | `id`, `shop_id`, `customer_id`, `customer_name`, `customer_phone`, `total_amount`, `paid`, `whatsapp_sent` |
| `bill_items`    | `id`, `bill_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `discount`, `total_price`         |
| `credit_ledger` | `id`, `shop_id`, `customer_id`, `amount`, `type` (`credit`/`payment`), `note`                              |
| `supply_scans`  | `id`, `shop_id`, `image_url`, `raw_ocr_text`, `parsed_items`, `status`                                     |

Enable **Row Level Security (RLS)** on all tables. The backend uses the `service_role` key to bypass RLS safely on the server side.

---

## 📄 License

MIT — feel free to use, modify, and distribute.

---

> Built with ❤️ for local shop owners. BizEase — because every shop deserves digital tools.
