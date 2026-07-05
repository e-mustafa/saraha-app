# ✉️ Saraha App — Enterprise-Grade Anonymous Messaging Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18+-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-FF0000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Joi](https://img.shields.io/badge/Joi-Validation-4A90E2?style=for-the-badge&logo=joi&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-Uploads-009688?style=for-the-badge&logo=multer&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google_OAuth2-4285F4?style=for-the-badge&logo=google&logoColor=white)

**highly secure anonymous messaging platform built with cutting-edge cryptographic security and high-performance session tracking.**

[⭐ Star](https://github.com/e-mustafa/saraha-app) · [🐛 Report Bug](https://github.com/e-mustafa/saraha-app/issues) · [📖 Documentation](https://documenter.getpostman.com/view/49016393/2sBXwvHnuD)

</div>

---

A production-ready backend architecture for an anonymous messaging platform inspired by modern applications like Sarahah and Tellonym.

The project is built with a strong focus on **security**, **performance**, **scalability**, and **clean architecture**, following real-world backend engineering practices rather than simple CRUD implementations.

Designed to serve as a solid foundation for high-traffic applications, the system combines stateless authentication, Redis-powered session management, optimized MongoDB queries, and modular service-oriented architecture to deliver both speed and maintainability.



## ✨ Features

### Authentication

- User Authentication
- Email Verification
- Password Reset
- Refresh Token Rotation
- Redis Session Management

### Messaging

- Anonymous Messaging
- Confidential Messaging
- Inbox / Sent / Favorites
- File Uploads

### Infrastructure

- Pagination
- Search & Sorting

---

## ✨ Key Highlights

- 🔐 Enterprise-grade Hybrid JWT Authentication
- 💬 Anonymous & Confidential Messaging
- ⚡ Redis-powered Session Management
- 🚀 Optimized MongoDB Queries & Compound Indexes
- 📄 Generic Pagination, Searching & Sorting
- 🛡️ Secure API Design with Validation & Serialization
- 📦 Modular Service-Oriented Architecture
- 📁 Clean & Scalable Project Structure
- 🔄 Refresh Token Rotation & Session Revocation
- 📈 Built for High Performance & Scalability

---

## 🧰 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- JWT
- Multer
- Cloudinary

---


## 📁 Project Structure
```text
src
├── config/
├── database/
├── middlewares/
├── modules/
│   ├── auth/
│   ├── messages/
│   └── users/
├── utils/
└── index.js
```

---

Request

↓

Router

↓

Validation

↓

Authentication

↓

Controller

↓

Service

↓

Database

↓

Serializer

↓

Response

---

## 🏛️ High-Level Architecture
```text
                    Client
                       │
          ┌────────────┴────────────┐
          │                         │
     Access Token             Refresh Token
      (Stateless)              (Redis)
          │                         │
          ▼                         ▼
      Authorization          Token Rotation
          │                         │
          └────────────┬────────────┘
                       ▼
                  Express API
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
 Authentication   Messaging      File Storage
        │              │
        ▼              ▼
     MongoDB        MongoDB
```

## 🏗️ Project Philosophy

Rather than focusing solely on feature implementation, this project emphasizes building a maintainable and extensible backend architecture.

Each module is designed around clear responsibilities:

- **Controllers** handle HTTP requests and responses.
- **Services** contain business logic.
- **Utilities** provide reusable infrastructure.
- **Serialization Layer** controls API output.
- **MongoDB** stores persistent application data.
- **Redis** provides ultra-fast session and token management.

This architecture keeps the codebase clean, testable, and easy to extend as new features are introduced.



---

## 🔐 Advanced Authentication Architecture

This project implements an enterprise-grade, highly secure, and scalable **Hybrid JWT Authentication System** designed to balance optimal API performance with real-time security control.

### 🚀 Core Architecture Concepts

- **Stateless Access Tokens:** Short-lived tokens (15 mins) processed entirely in-memory by the authorization middleware, bypassing database lookups for maximum scalability.
- **Stateful Refresh Tokens:** Long-lived tokens (7-30 days) securely stored in `HttpOnly`, `Secure`, and `SameSite=Strict` cookies. Controlled via a fast In-Memory **Redis** layer.

---

### 🛡️ Implemented Security Features

#### 1. Refresh Token Rotation (RTR)

To mitigate token-theft and replay attacks, every time a new Access Token is requested, the old Refresh Token is invalidated, and a brand new pair (Access + Refresh) is issued.

- **Reuse Detection:** If an actor attempts to reuse an old/stolen refresh token, the system detects it instantly as a breach, destroys the entire user session whitelist from Redis, and forces a global re-authentication.

#### 2. Dual-Layer Session Revocation

- **Single Device Logout:** Instantly revokes access for the current device by purging its unique JWT ID (`jti`) from the Redis whitelist.
- **Global Logout (All Devices):** Updates the `loggedOutAllAt` timestamp in MongoDB. Any active token issued prior to this timestamp is instantly rejected across all devices during the rotation phase.

---

### 📊 Data Flow & Logic

| Action              | Access Token (JWT)      | Refresh Token (JWT)    | Storage / Validation Layer                    |
| :------------------ | :---------------------- | :--------------------- | :-------------------------------------------- |
| **API Request**     | Validated via Signature | _Not Used_             | CPU Bound (Stateless)                         |
| **Token Refresh**   | Expired                 | Validated via `jti`    | Redis (Whitelist check) & MongoDB (Timestamp) |
| **Logout (Single)** | Cleared from client     | Revoked from Redis     | Redis (`DEL refresh:jti`)                     |
| **Logout (Global)** | Cleared from client     | All tokens invalidated | MongoDB (`loggedOutAllAt = Now`)              |

---


## 💬 Advanced Messaging Architecture

The messaging module is designed as a scalable, privacy-focused system inspired by modern anonymous messaging platforms. It separates message visibility, ownership, retrieval, and presentation logic while maintaining high performance through optimized database queries and reusable service layers.

### 🚀 Core Architecture Concepts

- **Anonymous Messaging:** Messages can be sent without exposing the sender's identity. The sender is stored securely when needed, while the API serialization layer hides the identity from recipients.
- **Confidential Messages:** Supports private messages that are only accessible to authorized participants and are excluded from public profile views.
- **Dedicated Message Endpoints:** Messages are organized into dedicated endpoints (`Inbox`, `Sent`, `Favorites`) instead of returning large mixed datasets, enabling efficient pagination and filtering.
- **Service-Oriented Design:** Business logic is isolated from controllers using reusable service and serialization layers for maintainability and future scalability.

---

### 🛡️ Implemented Features

#### 1. Anonymous & Confidential Messaging

Supports both authenticated and anonymous users.

- Optional sender identity.
- Anonymous messages never expose sender information through the API.
- Confidential messages remain visible only to authorized users.

#### 2. Optimized Message Retrieval

Dedicated APIs provide optimized access to different message categories.

- Inbox
- Sent Messages
- Favorite Messages
- Single Message Retrieval

Each endpoint supports:

- Pagination
- Sorting
- Content Search
- Optimized database filtering

#### 3. Secure Message Serialization

A dedicated serialization layer ensures that sensitive information is never leaked to clients.

- Removes sender information from anonymous messages.
- Returns only the fields required by the frontend.
- Provides a consistent API response structure.
- Prevents accidental exposure of internal database fields.

#### 4. Performance-Oriented Database Design

The messaging system is optimized for large datasets.

- Compound MongoDB indexes for common query patterns.
- Server-side pagination.
- Lean database queries where applicable.
- Reusable query builder for pagination, searching, and sorting.

---

### 📊 Message Flow

| Operation               | Processing Layer            | Database Strategy                        |
| :---------------------- | :-------------------------- | :--------------------------------------  |
| **Send Message**        | Validation → Service        | MongoDB Insert                           |
| **Inbox**               | Filter → Serialize          | Indexed Query + Pagination               |
| **Sent Messages**       | Filter → Serialize          | Indexed Query + Pagination               |
| **Favorite Messages**   | Filter → Serialize          | Indexed Query + Pagination               |
| **Message Details**     | Authorization → Serialize   | Indexed Query                            |
| **Delete Message**      | Ownership Validation        | Remove User Reference → Delete Document  |

---

## 🚀 Future Improvements

- Real-time notifications using WebSockets
- Message reactions
- Message scheduling
- Rate limiting per user
- AI-powered spam detection
- Media optimization

---

## 🔒 Security Checklist

- Refresh Token Rotation
- Token Reuse Detection
- Hybrid JWT
- AES Encryption
- Secure Cookies
- Joi Validation
- MIME Validation
- Compound Indexes

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- Redis

### Installation

```bash
git clone ...
cd ...
npm install


cp .env.example .env



npm run dev
```

## ⚙️ Environment Variables

Create a .env file

Required variables:
- in .env.example file

```text
APP_PORT
DATABASE_URL
REDIS_URL
JWT_SECRET
GOOGLE_CLIENT_ID
...
```
---

## 📚 API Documentation

- [📖 Postman Collection](https://documenter.getpostman.com/view/49016393/2sBXwvHnuD)
<!-- - Swagger -->

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/e-mustafa/saraha-app/issues).

---

## 👤 Author

**e-mustafa**

- GitHub: [@e-mustafa](https://github.com/e-mustafa)
- Project Link: [https://github.com/e-mustafa/saraha-app](https://github.com/e-mustafa/saraha-app)

---

<div align="center">

**Built with ❤️ using Node.js, Express, MongoDB, and Redis**

[⬆ Back to Top](#-saraha-app--enterprise-grade-anonymous-messaging-platform)

</div>