/**
 * Supabase cases テーブル作成 + hokkai-crm.html から283件upsert
 *
 * 使い方:
 *   node scripts/migrate-all.mjs
 *
 * 前提: npm install @supabase/supabase-js 済み
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SB_URL  = 'https://xdcpohbfcdbdxjtwtbwg.supabase.co';
const SB_KEY  = process.env.SB_SERVICE_KEY;
if (!SB_KEY) {
  console.error('ERROR: SB_SERVICE_KEY 環境変数を設定してください');
  console.error('例: SB_SERVICE_KEY=sb_secret_xxxx node scripts/migrate-all.mjs');
  process.exit(1);
}

const supabase = createClient(SB_URL, SB_KEY);

// ── Step 1: テーブル存在チェック ──
async function tableExists() {
  const { error } = await supabase.from('cases').select('id', { head: true, count: 'exact' });
  return !error;
}

// ── Step 2: テーブル作成 (rpc経由) ──
const CREATE_SQL = `
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
);`;

const RLS_SQL = `alter table cases enable row level security;`;

const POLICY_SQL = `
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'allow_all' and tablename = 'cases') then
    create policy "allow_all" on cases for all using (true) with check (true);
  end if;
end $$;`;

async function createTable() {
  console.log('テーブル作成中...');

  // service_role は PostgREST の DDL を実行できないので
  // Supabase の SQL 実行エンドポイントを試す
  const headers = {
    'apikey': SB_KEY,
    'Authorization': `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
  };

  // 方法1: /rest/v1/rpc/exec_sql (カスタム関数がある場合)
  // 方法2: /pg/query (Supabase 内部)
  // 方法3: /query
  const sqlStatements = [CREATE_SQL, RLS_SQL, POLICY_SQL].join('\n');

  const endpoints = [
    `${SB_URL}/rest/v1/rpc/exec_sql`,
    `${SB_URL}/rest/v1/rpc/query`,
    `${SB_URL}/pg/query`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST', headers,
        body: JSON.stringify({ query: sqlStatements, sql: sqlStatements }),
      });
      if (res.ok) {
        console.log(`  テーブル作成成功 (${url})`);
        return true;
      }
    } catch { /* next */ }
  }

  console.error('');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('自動テーブル作成ができませんでした。');
  console.error('Supabase Dashboard → SQL Editor で以下を実行してください:');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error(sqlStatements);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('実行後、再度このスクリプトを実行してください。');
  console.error('');
  return false;
}

// ── Step 3: hokkai-crm.html から D 配列を抽出 ──
function extractData() {
  const htmlPath = join(ROOT, 'hokkai-crm.html');
  console.log(`データ抽出: ${htmlPath}`);
  const html = readFileSync(htmlPath, 'utf8');
  const m = html.match(/var D=(\[.*?\]);/s);
  if (!m) throw new Error('hokkai-crm.html 内に var D=[...] が見つかりません');
  return JSON.parse(m[1]);
}

// ── Step 4: upsert ──
async function upsertData(records) {
  console.log(`${records.length} 件を upsert 中...`);

  // 100件ずつバッチ処理
  const BATCH = 100;
  let total = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error } = await supabase
      .from('cases')
      .upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`  バッチ ${i}-${i + batch.length} エラー:`, error.message);
    } else {
      total += batch.length;
      console.log(`  ${total} / ${records.length} 完了`);
    }
  }
  return total;
}

// ── Main ──
async function main() {
  // 1. テーブル確認 or 作成
  const exists = await tableExists();
  if (exists) {
    console.log('cases テーブル: 存在確認OK');
  } else {
    const created = await createTable();
    if (!created) {
      // テーブルが作られたか再確認
      const retry = await tableExists();
      if (!retry) process.exit(1);
    }
  }

  // 2. データ抽出
  const records = extractData();
  console.log(`抽出件数: ${records.length} 件`);

  // 3. Upsert
  const upserted = await upsertData(records);

  // 4. DB側の件数確認
  const { count, error } = await supabase
    .from('cases')
    .select('id', { count: 'exact', head: true });

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  upsert 完了: ${upserted} 件`);
  if (!error) console.log(`  DB 内合計:   ${count} 件`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
