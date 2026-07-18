/**
 * Validates the presence of required environment variables at runtime.
 * Fails fast and throws a developer-friendly error if REQUIRED variables are missing.
 * Logs a warning if OPTIONAL variables are missing.
 */
export function validateEnv() {
  const isProd = import.meta.env.PROD;

  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_CLERK_PUBLISHABLE_KEY',
  ];

  if (isProd) {
    requiredVars.push('VITE_SENTRY_DSN', 'VITE_POSTHOG_KEY');
  }

  const optionalVars = [
    'VITE_AI_API_URL',
  ];

  if (!isProd) {
    optionalVars.push('VITE_SENTRY_DSN', 'VITE_POSTHOG_KEY');
  }

  const missingRequiredVars = requiredVars.filter(
    (envVar) => !import.meta.env[envVar]
  );

  const missingOptionalVars = optionalVars.filter(
    (envVar) => !import.meta.env[envVar]
  );

  if (missingOptionalVars.length > 0) {
    console.warn(
      `⚠️ Missing Optional Environment Variables:\n` +
      missingOptionalVars.map((v) => `  - ${v}`).join('\n') +
      `\nRelated features will be gracefully disabled.`
    );
  }

  if (missingRequiredVars.length > 0) {
    const errorMsg = `
    🚨 Environment Validation Failed! 🚨
    
    The following required environment variables are missing or empty:
    ${missingRequiredVars.map((v) => `- ${v}`).join('\n    ')}
    
    Please check your .env file or Vercel environment variable settings.
    `;
    
    // Log to console for immediate developer feedback
    console.error(errorMsg);
    
    // Write directly to DOM so developers don't just see a white screen
    if (typeof document !== 'undefined') {
      document.body.innerHTML = `
        <div style="padding: 32px; font-family: system-ui, sans-serif; background: #fff1f2; color: #9f1239; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
          <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 600px; border: 1px solid #fda4af;">
            <h1 style="font-size: 24px; margin-bottom: 16px; font-weight: bold;">🚨 Environment Validation Failed</h1>
            <p style="margin-bottom: 16px; font-size: 16px; color: #be123c;">The following required environment variables are missing or empty:</p>
            <ul style="margin-bottom: 24px; text-align: left; background: #ffe4e6; padding: 16px 16px 16px 40px; border-radius: 8px;">
              ${missingRequiredVars.map(v => `<li style="font-family: monospace; font-size: 14px; margin-bottom: 8px;">${v}</li>`).join('')}
            </ul>
            <p style="font-size: 14px; color: #881337;">Please check your <code>.env</code> file or Vercel environment variable settings.</p>
          </div>
        </div>
      `;
    }
    
    // Throw error to halt application startup
    throw new Error(errorMsg);
  }
}

// Run immediately upon import to ensure application doesn't start with missing envs
validateEnv();
