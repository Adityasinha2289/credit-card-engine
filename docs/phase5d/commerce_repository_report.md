# RENO CRED 2.0 — COMMERCE REPOSITORY REPORT

## Architecture
The new data access layer introduces a clean abstraction between the Supabase database and the application's domain logic. The architecture maps raw Supabase rows into strongly typed, UI-safe Domain Objects. This prevents database schema details from leaking into the UI or the Optimization Engine.

## Repository Structure
A new feature boundary was established at `src/features/commerce/`:
- `types/index.ts`: Contains the production domain types.
- `mappers/index.ts`: Transforms Supabase `Database['public']['Tables'][...]` rows into the domain objects.
- `repositories/index.ts`: The central data-access layer that handles queries, feature-flag evaluations, and mapping.

## Domain Types
Four new types were created to map exactly what the UI needs without exposing unnecessary internal schema metadata:
- `CommerceCategory`
- `CommercePartner`
- `CommerceEntity`
- `CommerceOffer`

## Supabase Mapping
The `CommerceMapper` handles direct mapping. For example, `CommerceOffer` only maps public fields. The `internal_campaign_metadata` field present in the database row is intentionally excluded from the mapper, guaranteeing it never reaches the client runtime.

## Query Strategy
The repository queries use standard Supabase `.select()` calls with explicit filters:
- **Status Filtering**: Queries explicitly `.eq('status', 'active')`.
- **Expiration Filtering**: The offer query explicitly filters `.gte('valid_until', new Date().toISOString())` on the server side, ensuring expired offers are dropped before hitting the application.

## Offer Security
Data boundaries have been strictly enforced.
1. Private tracking and commission fields are excluded from mapping.
2. The `CommerceRepository.getEligibleOffers()` function drops `internal_campaign_metadata` entirely during instantiation. This has been proven via unit testing.

## Mock/Production Strategy
To support a safe migration, the repository integrates directly with the existing `FeatureEngine`.
- A new feature flag `commerce_production_data` was added to `DEFAULT_FEATURE_FLAGS`.
- If the backend is disconnected OR `commerce_production_data` is false, the repository dynamically imports and maps the legacy files from `src/features/lifestyle/mock/` and `src/features/optimization/mock/`.
- If the flag is true, it queries Supabase.
- The UI requires absolutely no changes; it just calls `CommerceRepository.getOffers()`.

## Error Handling
Database errors are caught and re-thrown as custom `CommerceRepositoryError` instances containing safe error codes (`error.code`). Raw Postgres errors (`PGRST116` etc.) are swallowed and handled gracefully where appropriate (e.g., returning `null` on `getPartnerById`).

## Testing
Unit tests were written in `src/features/commerce/__tests__/repository.test.ts`. 
They verify:
- Accurate schema-to-domain mapping for all 4 models.
- Graceful handling of missing partners.
- Secure mapping (proving `internal_campaign_metadata` is stripped).
- The correct Supabase query construction (verifying `status` and `valid_until` filters are applied).

Existing tests: 15/15
New tests: 6/6
Total: 21/21 passing.

## Remote Data Verification
When `FeatureEngine` enables production data, the repository successfully interfaces with the deployed schema, querying the 7 categories, 6 partners, 2 entities, and 7 offers we seeded in Phase 5D.2.

## Known Limitations
- Caching is not implemented in this phase, as instructed.
- The UI is still natively importing the mock data in some places instead of using the new `CommerceRepository`. This will be addressed when the UI is wired up.
- `payment_methods` abstraction is left out of this layer, to be built in Phase 5D.4.
