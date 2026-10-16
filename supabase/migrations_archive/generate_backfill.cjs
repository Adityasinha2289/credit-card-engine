const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: '.env' });
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use service role key if available, otherwise anon key (but anon key might not have RLS permission to insert for other users!)
// Actually, since I'm running this locally, I can use supabase db query to execute the SQL.
// I will generate the SQL file using Node.js instead!

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // URL namespace or random fixed

function generateUUIDv5(name) {
  // A simple UUID v5 implementation is tricky in pure JS without a library, 
  // so I'll just use crypto.createHash('sha1').
  const hash = crypto.createHash('sha1');
  hash.update(NAMESPACE + name);
  const bytes = hash.digest();
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const hex = bytes.toString('hex');
  return `${hex.substr(0,8)}-${hex.substr(8,4)}-${hex.substr(12,4)}-${hex.substr(16,4)}-${hex.substr(20,12)}`;
}

// I will just fetch data via a simple psql/supabase db query first, but I already have the 13 rows from earlier.
// Wait, I will just write a Node script that runs `supabase db query` using execSync to get the JSON.

const { execSync } = require('child_process');

try {
  // Fetch legacy data
  console.log('Fetching user_cards...');
  const query = "SELECT uc.card_id, uc.user_id, uc.last_4_digits, uc.status, c.bank, c.network FROM user_cards uc JOIN cards c ON uc.card_id = c.id;";
  fs.writeFileSync('temp_fetch.sql', query);
  const output = execSync('npx supabase db query -f temp_fetch.sql --linked').toString();
  fs.unlinkSync('temp_fetch.sql');

  // Parse JSON from output
  const lines = output.split('\n');
  const jsonStr = lines.slice(lines.findIndex(l => l.startsWith('{')), lines.findLastIndex(l => l.startsWith('}')) + 1).join('\n');
  const data = JSON.parse(jsonStr).rows;

  let sqlStatements = '-- BACKFILL PAYMENT METHODS\n\n';

  data.forEach(row => {
    const uniqueString = `${row.user_id}:${row.card_id}:${row.last_4_digits}`;
    const id = generateUUIDv5(uniqueString);
    const type = 'credit_card';
    const name = `${row.bank} ${row.network} - ${row.last_4_digits}`;
    const provider = row.bank;
    const metadata = JSON.stringify({
      network: row.network,
      panLast4: row.last_4_digits,
      legacy_card_id: row.card_id
    });
    
    // Construct safe SQL
    sqlStatements += `INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('${id}', '${row.user_id}', '${type}', '${name}', '${provider}', '${metadata}'::jsonb, '${row.status}') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;\n`;
  });

  fs.writeFileSync('supabase/backfill_pm.sql', sqlStatements);
  console.log('Generated supabase/backfill_pm.sql');

} catch (err) {
  console.error('Failed', err);
}
