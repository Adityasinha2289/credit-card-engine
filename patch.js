const fs = require('fs');
const file = 'src/features/dashboard/components/LoginScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const warningBanner = `
            {/* Brave Browser Warning */}
            <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-xs text-red-400 font-medium flex items-center justify-center gap-2">
                <span className="text-base">🛡️</span> 
                Using Brave or AdBlock? Please disable Shields to allow the security CAPTCHA to load.
              </p>
            </div>
`;

content = content.replace('{/* ── Clerk Auth Form ── */}', warningBanner + '\n            {/* ── Clerk Auth Form ── */}');
fs.writeFileSync(file, content);
