# OUR BOOK 📚

A full-stack digital book library providing authenticated access to educational textbooks across multiple subjects, featuring OTP authentication via **Twilio Verify** (SMS & WhatsApp), role-based access control, and secure PDF streaming.

---

## 🌟 Key Features

- **OTP Authentication**: Powered by **Twilio Verify API** with support for both **SMS** and **WhatsApp** channels.
- **Single-Verification Access**: Verifying an OTP once unlocks access to all available books across all six subjects without re-authenticating for each title.
- **Secure PDF Delivery**: Textbooks are stored in a private directory and streamed over authenticated backend endpoints with JWT verification. Direct public URL access is blocked.
- **Rate Limiting & Protection**: Dedicated rate limiters prevent OTP abuse and brute-force attempts.
- **Role-Based Access**: Regular users can read and view books, while book uploads and edits require administrator permissions.

---

## 📚 Supported Subjects

1. **Mathematics** (`Mathematics Fundamentals`)
2. **English** (`English Grammar`)
3. **Hindi** (`Hindi Vyakaran`)
4. **History** (`Modern Indian History`)
5. **Civics** (`Introduction to Civics`)
6. **Geography** (`World Geography`)

---

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js**
- **SQLite** via `better-sqlite3` (WAL mode enabled)
- **Twilio SDK** (Verify v2)
- **JWT** (`jsonwebtoken`) for authorization
- **Helmet** & **express-rate-limit** for security

### Frontend
- **React.js** (v19)
- **Vite**
- **Tailwind CSS**
- **Axios** (with Bearer token request interceptor)
- **React Router DOM**

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- A Twilio account with a **Verify Service** configured

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
```

Edit `.env` and fill in your Twilio credentials and secrets:
```env
JWT_SECRET=your_jwt_secret
OTP_HASH_SECRET=your_otp_secret
NODE_ENV=development

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Start the backend:
```bash
# Production / standard start
npm start

# Development with nodemon
npm run dev
```
The backend starts at `http://localhost:5001`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend starts at `http://localhost:5173` (or the port specified in terminal).

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user with name, email, mobile, and country code |
| `POST` | `/api/auth/send-otp` | Trigger OTP code dispatch via `sms` or `whatsapp` |
| `POST` | `/api/auth/verify-otp` | Verify the 6-digit code via Twilio Verify and obtain a JWT |

### Books (`/api/books`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/books` | User (JWT) | List all available books |
| `GET` | `/api/books/:id/read` | User (JWT) | Securely stream book PDF |
| `POST` | `/api/books` | Admin | Create book record |
| `POST` | `/api/books/upload` | Admin | Upload a new PDF |
| `PUT` | `/api/books/:id` | Admin | Update book metadata |
| `DELETE` | `/api/books/:id` | Admin | Remove book |

---

## 🔒 Security Measures
- Credentials and `.env` files are excluded from git.
- Twilio Verify handles OTP token lifecycles directly, avoiding plain-text transmission or sensitive code exposure in logs/APIs.
- Private PDF assets reside outside the static server root and require a valid, verified user JWT to stream.
