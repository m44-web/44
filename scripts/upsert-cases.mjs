import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SB_URL = process.env.SB_URL || 'https://xdcpohbfcdbdxjtwtbwg.supabase.co';
const SB_KEY = process.env.SB_SERVICE_KEY;
if (!SB_KEY) { console.error('Set SB_SERVICE_KEY env var'); process.exit(1); }

const supabase = createClient(SB_URL, SB_KEY);

// Read and extract D array from hokkai-crm.html
const html = readFileSync('./hokkai-crm.html', 'utf8');
const match = html.match(/var D=(\[.*?\]);/s);
if (!match) {
  console.error('Could not find D array in hokkai-crm.html');
  process.exit(1);
}

const D = JSON.parse(match[1]);
console.log(`Extracted ${D.length} records from hokkai-crm.html`);

// Upsert all records (283 is well within Supabase's single-request limit)
const { data, error } = await supabase
  .from('cases')
  .upsert(D, { onConflict: 'id' });

if (error) {
  console.error('Upsert error:', error.message);
  process.exit(1);
}

// Verify count
const { count, error: countErr } = await supabase
  .from('cases')
  .select('id', { count: 'exact', head: true });

if (countErr) {
  console.log(`Upserted ${D.length} records (count verification failed: ${countErr.message})`);
} else {
  console.log(`Successfully upserted ${D.length} records. Total in table: ${count}`);
}
