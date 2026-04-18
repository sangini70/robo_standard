# Robo-Advisor Development Principles & Baseline

## [1] Baseline Confirmation (확정 사항)

1. **Architecture**:
   - Pure Client-side only.
   - No Express, No Node server, No `firebase-admin`.
   - Direct Firestore interactions via Firebase Web SDK.

2. **Authentication**:
   - 2-Step Verification:
     1. Google Login (Allowlist: UID `O8T7pyXh5Mfd5wx7fqJdkfqTzw1` OR Email `luganopizza@gmail.com`).
     2. Firestore-based Password check (`settings/security/adminPassword`).

3. **Security**:
   - Firestore Security Rules as the primary barrier.
   - `settings/security` accessible only by the specific admin UID.
   - `posts` follow public-read/admin-write logic.

4. **Operational Stability**:
   - Mandatory `try/catch` and UI Fallbacks for all data fetching.
   - In-memory caching for performance (60s).
   - Instant cache invalidation on administrative writes (Create/Update/Delete).

## [2] Prohibited Implementations (재도입 금지)

- `firebase-admin` / Server-side auth patterns.
- Express/Node.js backend servers (`server.ts`).
- Server-side environment variables for secrets (`FIREBASE_PRIVATE_KEY`, etc.).
- Static JSON-based data storage (`public/data/*.json`).

## [3] Data Schema (Fixed)

1. `settings/security`: `{ adminPassword: string }`
2. `posts/{slug}`: `{ title, content, hub, flowStep, status, createdAt, updatedAt }`

## [4] Reporting Requirements

Every feature update must include:
1. Modified files list.
2. Summary of changes.
3. Baseline integrity check.
4. Security impact analysis.
5. Cache/Data flow impact.
6. Test results (Admin login, non-admin block, write success, UI reflection).

---
**Core Directive**: Never rebuild or revert the architecture. Only extend and protect.
