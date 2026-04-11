import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.SB_URL || 'https://xdcpohbfcdbdxjtwtbwg.supabase.co';
const SB_KEY = process.env.SB_SERVICE_KEY;
if (!SB_KEY) { console.error('Set SB_SERVICE_KEY env var'); process.exit(1); }

const sql = `
create table if not exists cases (
  id text primary key,
  name text, age text, area text, phone text,
  status text default 'appointment',
  ap_date text, ap_person text, work text,
  ap_comment text, cl_comment text,
  spring boolean default false,
  spring_ctx text, type text,
  estimate text, address text, cl_person text,
  extra text, contract_date text, source text,
  created_at timestamptz default now()
);
alter table cases enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'allow_all' and tablename = 'cases') then
    create policy "allow_all" on cases for all using (true) with check (true);
  end if;
end
$$;
`;

async function run() {
  // Try multiple SQL execution endpoints
  const headers = {
    'apikey': SB_KEY,
    'Authorization': `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
  };

  const endpoints = [
    { url: `${SB_URL}/rest/v1/rpc/exec_sql`, body: { sql } },
    { url: `${SB_URL}/rest/v1/rpc/query`, body: { query: sql } },
    { url: `${SB_URL}/pg/query`, body: { query: sql } },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, { method: 'POST', headers, body: JSON.stringify(ep.body) });
      if (res.ok) {
        console.log(`Table created via ${ep.url}`);
        return verify();
      }
    } catch (e) { /* try next */ }
  }

  // Check if table already exists
  try {
    const checkRes = await fetch(`${SB_URL}/rest/v1/cases?select=id&limit=0`, { headers });
    if (checkRes.ok) {
      console.log('Table "cases" already exists.');
      return;
    }
  } catch (e) { /* ignore */ }

  console.error('Could not create table automatically.');
  console.error('Please run the following SQL in the Supabase Dashboard SQL Editor:');
  console.error(sql);
  process.exit(1);
}

async function verify() {
  const res = await fetch(`${SB_URL}/rest/v1/cases?select=id&limit=0`, {
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` },
  });
  console.log(res.ok ? 'Verified: cases table accessible.' : 'Warning: table verification failed.');
}

run().catch(console.error);
