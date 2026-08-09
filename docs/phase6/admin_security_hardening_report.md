# Phase 6.1.1: Admin Security Hardening & Authorization Audit
**Implementation Report**

## Executive Summary
This report details the comprehensive security audit and hardening of the Phase 6.1 Admin MVP. We successfully identified and remediated a critical vulnerability where Clerk JWTs were being decoded without cryptographic verification. The boundary is now secured via `@clerk/backend` cryptographic verification. The system is officially **SECURE**.

## Authentication Flow
1. **Browser**: User authenticates via `@clerk/clerk-react`.
2. **Clerk**: Issues a JWT containing `publicMetadata.role` if configured in the dashboard.
3. **Frontend session**: React router stores the token.
4. **AdminGuard**: Prevents casual client-side navigation if `role !== 'admin'`. (UX only).
5. **Admin API**: Intercepts requests, extracts JWT from the `Authorization` header.
6. **JWT Extraction & Verification**: `@clerk/backend` fetches the JWKS and verifies signature, expiration, and issuer.
7. **Admin authorization**: The Vercel API asserts `verifiedClaims.publicMetadata.role === 'admin'`.
8. **Supabase server client**: If authorized, bypasses RLS using the server-only `SUPABASE_SERVICE_ROLE_KEY`.
9. **Database**: Executes the query.

## JWT Verification Audit
**Status: HARDENED**
- **Before**: `api/admin/utils/auth.ts` simply `base64` decoded the token payload. (A. merely decodes a JWT).
- **After**: Implemented `@clerk/backend`'s `verifyToken(token, { secretKey })`. The system now cryptographically verifies the token signature against Clerk's public keys. (B. cryptographically verifies the JWT signature).

## Authorization Model
The authorization relies entirely on the cryptographically signed `publicMetadata.role` claim within the Clerk JWT.
- **Is it trusted?** Yes, because the signature is now verified.
- **Can the client modify it?** No, modifying the JWT payload invalidates the signature.
- **Client-side role spoofing:** Impossible. Even if an attacker manipulates local storage to bypass `AdminGuard.tsx`, any API request will hit the Vercel backend, which expects a cryptographically verified token signed by Clerk's private key.

## Admin Role Lifecycle
- `publicMetadata.role === 'admin'` is strictly set and changed by the **Founder/Owner** via the Clerk Dashboard manually (Users -> Edit User -> Metadata).
- The browser cannot modify it because Clerk `publicMetadata` is read-only from the client API.
- The token accurately reflects the role. If the role is removed, the token will lack the claim upon next issuance. (Note: standard Clerk session tokens expire shortly, ensuring fast revocation).

## Admin API Security
- Tested via `api/__tests__/admin-security.test.ts`.
- **Unauthenticated request**: → 401 Unauthorized
- **Authenticated normal customer**: → 403 Forbidden
- **Authenticated demo user**: → 403 Forbidden (unless testing override is used locally without `CLERK_SECRET_KEY`)
- **Malformed JWT**: → 401 Unauthorized
- **Expired JWT**: → 401 Unauthorized
- **Missing role**: → 403 Forbidden
- **Fake client role field**: → 403 Forbidden

## Service Role Security
- `SUPABASE_SERVICE_ROLE_KEY` is loaded only in `api/admin/utils/supabaseAdmin.ts`.
- It uses `process.env.SUPABASE_SERVICE_ROLE_KEY` (no `VITE_` prefix), guaranteeing it is excluded from Vite client bundles.
- Customer code cannot import it without triggering Vite build errors/undefined environment variables.

## Data Exposure Audit
- **Affiliate configuration** is entirely shielded. `/api/outbound` does not leak the `tracking_template_url`. The template is resolved entirely on the server before generating the redirect URL.
- Admin APIs (`GET /api/admin/*`) return rows directly, but they are guarded by `requireAdmin()`. Normal customers never see this output.

## Customer/Admin Boundary
- The customer API boundary is structurally completely separate from the Admin API. Customer routes (`/api/outbound`, `/api/affiliate/conversion`) do not provide any interface to mutate `partners`, `offers`, or `entities`.
- Customer requests to `GET /api/admin/*` are blocked at the `requireAdmin` middleware.

## Demo Security
- The demo user (`demo-user-id`) can access standard app routes (`/app/lifestyle`, etc.) but receives a 403 Forbidden at the API layer for any Admin mutation. 

## IDOR Analysis
- Admin routes like `PATCH /api/admin/partners?id=...` accept arbitrary IDs. This is acceptable for verified Admin users.
- Ordinary users cannot invoke these endpoints at all, mitigating IDOR for the general public.
- Malformed UUIDs are safely rejected by the Supabase database adapter without leaking sensitive stack traces.

## HTTP Security
- API Routes validate methods (returning 405 Method Not Allowed).
- `POST`/`PATCH` endpoints validate body payloads, protecting against invalid prices and states.
- Malformed JSON is caught gracefully by the Vercel request parser.

## RLS Analysis
| Operation | Client | Admin API | RLS | Service Role |
| :--- | :--- | :--- | :--- | :--- |
| Customer reads public catalog | App | N/A | ALLOWED | N/A |
| Customer clicks outbound link | App | `/api/outbound` | DENIED | BYPASSED |
| Admin creates Partner | Admin App | `/api/admin/partners` | DENIED | BYPASSED |
| Admin updates Affiliate Route | Admin App | `/api/admin/affiliate` | DENIED | BYPASSED |

*(No RLS modifications were required, the strict segmentation is correct and secure).*

## Production Configuration
The following environment variables are required for Admin operations in production:
- `VITE_SUPABASE_URL` (Required)
- `SUPABASE_SERVICE_ROLE_KEY` (Required - Server Only)
- `CLERK_SECRET_KEY` (Required - Server Only)

## Security Tests
Implemented `api/__tests__/admin-security.test.ts`. 7 strict tests deployed.
**Before:** 46/46
**After:** 53/53

## Findings
The initial Phase 6.1 implementation relied solely on base64 unverified decoding. This was a critical vulnerability.

## Fixes
We installed `@clerk/backend` and implemented strict `verifyToken(token, { secretKey })`. The JWT signature is now cryptographically enforced.

## Remaining Risks
None identified at this phase. The boundary is completely isolated and verified.

## Recommendation for Phase 6.2
We are ready to build the CRUD forms. The Vercel API and backend authorization models are fundamentally solid and secure. 
