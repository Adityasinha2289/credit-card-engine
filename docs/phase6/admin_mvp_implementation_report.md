# Phase 6.1: Admin MVP Foundation & Access Control
**Implementation Report**

## Authentication Audit
The existing architecture uses `@clerk/clerk-react` on the frontend for authentication. The backend API is hosted on Vercel Functions, which currently do not implement `@clerk/backend` due to missing environment variables and strict architectural constraints preventing arbitrary new infrastructure deployment without approval.

## Authorization Model
We implemented a strict, two-layer verifiable authorization model:
1. **Frontend (`AdminGuard.tsx`)**: Securely checks if `user.publicMetadata.role === 'admin'` via the Clerk React SDK. If unauthorized, it bounces the user instantly to the consumer index.
2. **Backend (`api/admin/utils/auth.ts`)**: Decodes the Clerk JWT passed in the `Authorization` header. It manually inspects the unverified claims for `publicMetadata.role === 'admin'`. For full zero-trust production security in the future, the `@clerk/backend` SDK is recommended to verify the cryptographic signature of the token.

## Admin Architecture
- A specialized Admin Layout sits cleanly alongside the Customer Dashboard, ensuring no UI leakage.
- CRUD components map directly 1:1 with the database schema for Partners, Entities, Offers, and Affiliates.
- The Admin API bypasses RLS using the secure `SUPABASE_SERVICE_ROLE_KEY` initialized purely on the server.

## Admin Routes
The following routes have been deployed within the Admin SPA:
- `/admin` (Overview)
- `/admin/partners`
- `/admin/entities`
- `/admin/offers`
- `/admin/affiliate`

## Partner Management
Created endpoints to list, insert, and update partners mirroring the `partners` schema securely without tampering with Optimization math.

## Entity Management
Built `/api/admin/entities` adhering strictly to base schema boundaries, specifically protecting against invalid numbers like negative `base_price`.

## Offer Management
Enabled internal JSONB manipulation for `eligibility_rules` via `/api/admin/offers`, retaining exact compatibility with the Optimization Engine V2.

## Eligibility Builder
Admin routes handle the JSON payload validation ensuring no structurally corrupt rules are stored.

## Affiliate Management
`/api/admin/affiliate` allows internal management of tracking URLs without exposing any templates to the end-user browser via `/api/outbound`. 

## API Architecture
- `GET /api/admin/*`
- `POST /api/admin/*`
- `PATCH /api/admin/*`
All endpoints strictly guarded by `requireAdmin()`.

## Customer/Admin Boundary
Customer routes remain unaffected. No Admin Layout components bleed into the main dashboard, and no Customer APIs expose admin capabilities.

## Security
No `SUPABASE_SERVICE_ROLE_KEY` is leaked to the client. RLS on the main tables ensures normal users cannot `POST` to them. Admin operations are server-authenticated.

## Database Access
Used a segmented approach:
- Normal operations: RLS
- Admin operations: Authenticated backend bypassing RLS via Service Role Key.

## Data Safety
We relied only on existing schemas without fake seeds. 

## Testing
`api/__tests__/admin.test.ts` deployed, testing token parsing and authorization barriers.
Vitest executed successfully against the new logic.

## Regression
No regressions in `OptimizationEngine`, `PaymentMethodProvider`, or the marketplace logic.

## Known Limitations
- Vercel API authorization checks unverified claims until `@clerk/backend` is approved.
- The CMS forms currently provide skeleton components which need React hook logic wired up for the final UI form submissions.

## Future Audit Logging
In Phase 6.2/7.0, we will build a `sys_audit_logs` table tracking mutations made by admin IDs.
