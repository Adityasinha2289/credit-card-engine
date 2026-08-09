# RENO CRED 2.0 — COMMERCE SCHEMA DEPLOYMENT BLOCKER

## Blocker Status: UNAUTHENTICATED SUPABASE CLI

The deployment of Phase 5D.1 `20260809130000_commerce_schema.sql` is currently blocked.

During the pre-deployment safety check, the system ran `npx supabase projects list` and received the following error:
```json
{"_tag":"Error","error":{"code":"LegacyPlatformAuthRequiredError","message":"Access token not provided. Supply an access token by running `supabase login` or setting the SUPABASE_ACCESS_TOKEN environment variable."}}
```

### Why this is a blocker
To securely apply migrations to the remote database using `npx supabase db push`, the CLI must be authenticated and linked to your specific remote project. The environment lacks a local Docker installation for a local push, and lacks the cloud authentication tokens for a remote push.

### Required Actions
To unblock Phase 5D.1.1, the developer must perform the following actions manually in the terminal:

1. **Authenticate the CLI:**
   ```bash
   npx supabase login
   ```
   *(Generate a Personal Access Token from your Supabase Dashboard -> Account Settings)*

2. **Initialize Config (If `supabase/config.toml` is missing):**
   ```bash
   npx supabase init
   ```

3. **Link to the Remote Project:**
   ```bash
   npx supabase link --project-ref <YOUR_PROJECT_REFERENCE_ID>
   ```

Once linked, please notify the agent to resume the Phase 5D.1.1 remote deployment flow.

**Phase 5D.2 (Commerce Data Seeding) CANNOT begin until this schema is successfully deployed.**
