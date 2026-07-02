

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

### 🛠️ Tech Stack Used

- **Backend Framework:** Node.js with Express
- **Database Layer:** MongoDB (Mongoose) for persistent user profiles and timestamps.
- **Caching/Session Layer:** Redis for ultra-fast, TTL-backed `jti` whitelisting.
- **Cryptography:** Native Node.js `crypto.randomUUID()` for cryptographically secure identifier generation.
