// Read-only connectivity check. Never inserts rows or modifies Supabase settings.
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = { ...process.env };
if (fs.existsSync('.env.local')) {
  for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z_]+)\s*=\s*(.*)$/);
    if (match && !env[match[1]]) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Supabase public configuration is missing.');
const supabase = createClient(url, key, { auth: { persistSession:false, autoRefreshToken:false } });
let failed = false;
for (const table of ['vehicles', 'vehicle_images', 'bookings', 'payments']) {
  const { error, count } = await supabase.from(table).select('id', { head:true, count:'exact' });
  if (error) {
    failed = true;
    console.error(`${table}: read failed (${error.code || 'network/connection error'})`);
  } else console.log(`${table}: read succeeded; ${count} rows visible to an unsigned visitor`);
}
process.exitCode = failed ? 1 : 0;
