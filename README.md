# BookHaven — Backend API

Node.js + Express + MongoDB REST API with Paystack payment integration.

## Stack
- **Node.js / Express** — REST API server
- **MongoDB + Mongoose** — database and ODM
- **JWT + bcryptjs** — authentication and password hashing
- **Paystack** — e-payment integration
- **Helmet + CORS + Rate Limiting** — security

## Project Structure
```
src/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # register, login, getMe, updateMe
│   ├── bookController.js      # CRUD + search + filter
│   ├── orderController.js     # create, list, admin manage
│   └── paymentController.js   # Paystack initiate + verify
├── middleware/
│   ├── auth.js                # protect, adminOnly
│   └── errorHandler.js        # global error handler + AppError class
├── models/
│   ├── User.js                # name, email, password, role
│   ├── Book.js                # title, author, price, stock, category...
│   └── Order.js               # user, items[], totalAmount, status
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   ├── orderRoutes.js
│   └── paymentRoutes.js
├── utils/
│   └── seed.js                # populate DB with sample data
└── server.js                  # entry point
```

## Setup

### 1. Install dependencies
```bash
cd bookstore-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` with your values:
- **MONGODB_URI** — from MongoDB Atlas
- **JWT_SECRET** — any long random string
- **PAYSTACK_SECRET_KEY** — from Paystack dashboard → Settings → API Keys
- **FRONTEND_URL** — `http://localhost:3000` in dev

### 3. Seed sample data (optional)
```bash
npm run seed
```
Creates 12 sample books + admin and test user accounts.

### 4. Start the server
```bash
npm run dev     # development (auto-restart on changes)
npm start       # production
```

Server runs on **http://localhost:5000**

---

## API Reference

### Auth  `/api/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Create account |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | 🔐 User | Get current user |
| PUT | `/me` | 🔐 User | Update profile |

### Books  `/api/books`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List books (search, filter, paginate) |
| GET | `/categories` | Public | Get all categories |
| GET | `/:id` | Public | Get single book |
| POST | `/` | 🔐 Admin | Create book |
| PUT | `/:id` | 🔐 Admin | Update book |
| DELETE | `/:id` | 🔐 Admin | Delete book |

**Query params for GET /api/books:**
- `search` — full-text search (title, author, description)
- `category` — filter by category
- `sort` — `newest` | `price_asc` | `price_desc` | `title_asc`
- `page` — page number (default: 1)
- `limit` — per page (default: 12, max: 50)
- `minPrice` / `maxPrice` — price range filter

### Orders  `/api/orders`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | 🔐 User | Create order |
| GET | `/my-orders` | 🔐 User | My order history |
| GET | `/:id` | 🔐 User/Admin | Get order details |
| GET | `/` | 🔐 Admin | All orders |
| PUT | `/:id/status` | 🔐 Admin | Update order status |

### Payment  `/api/payment`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/initiate` | 🔐 User | Start Paystack payment |
| GET | `/verify/:reference` | 🔐 User | Verify after redirect |

---

## Paystack Flow
```
1. User places order  →  POST /api/orders  →  returns order._id
2. Initiate payment   →  POST /api/payment/initiate { orderId }
3. Backend calls Paystack API  →  returns authorizationUrl
4. Frontend redirects user to authorizationUrl
5. User pays on Paystack hosted page
6. Paystack redirects to FRONTEND_URL/payment/callback?reference=xxx
7. Frontend calls  GET /api/payment/verify/:reference
8. Backend verifies with Paystack, marks order paid, reduces stock
```

---

## Seed Accounts (after npm run seed)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bookhaven.com | admin123 |
| User | user@bookhaven.com | user123 |

---

## Deployment (Render)
1. Push code to GitHub
2. Create new **Web Service** on Render, connect your repo
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add all `.env` variables under **Environment**
6. Set `NODE_ENV=production` and `FRONTEND_URL=https://your-vercel-app.vercel.app`
