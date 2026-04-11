/**
 * crm_users テーブル作成 + 初期ユーザー登録
 *
 * 使い方:
 *   SB_SERVICE_KEY=sb_secret_xxxx node scripts/setup-users.mjs
 *
 * Supabase Dashboard の SQL Editor でも実行可能 (下記SQLをコピペ)
 */

const SB_URL = process.env.SB_URL || 'https://xdcpohbfcdbdxjtwtbwg.supabase.co';
const SB_KEY = process.env.SB_SERVICE_KEY;
if (!SB_KEY) {
  console.error('ERROR: SB_SERVICE_KEY 環境変数を設定してください');
  process.exit(1);
}

/*
  Supabase Dashboard SQL Editor で実行するSQL:

  create table if not exists crm_users (
    user_id text primary key,
    password text not null,
    name text not null,
    created_at timestamptz default now()
  );
  alter table crm_users enable row level security;
  create policy "allow_read" on crm_users for select using (true);

  -- 初期ユーザー追加
  insert into crm_users (user_id, password, name) values
    ('horiuchi', 'lit2026', '堀内 勝（管理者）'),
    ('nozaki', 'hokkai2026', '野崎 亮太'),
    ('kato', 'hokkai2026', '加藤 アトム'),
    ('abe', 'hokkai2026', '阿部 椋也'),
    ('shimakura', 'hokkai2026', '島倉 知希'),
    ('otani', 'hokkai2026', '大谷 恭広'),
    ('kano', 'hokkai2026', '加納 楓馬'),
    ('kumagai', 'hokkai2026', '熊谷 翔太'),
    ('konishi', 'hokkai2026', '小西 輝也'),
    ('sato', 'hokkai2026', '佐藤 虹太')
  on conflict (user_id) do nothing;
*/

async function main() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SB_URL, SB_KEY);

  // テーブル存在チェック
  const { error: checkErr } = await supabase.from('crm_users').select('user_id', { head: true });

  if (checkErr) {
    console.error('crm_users テーブルが存在しません。');
    console.error('Supabase Dashboard → SQL Editor で以下を実行してください:\n');
    console.error(`create table if not exists crm_users (
  user_id text primary key,
  password text not null,
  name text not null,
  created_at timestamptz default now()
);
alter table crm_users enable row level security;
create policy "allow_read" on crm_users for select using (true);`);
    console.error('\n実行後、再度このスクリプトを実行してください。');
    process.exit(1);
  }

  console.log('crm_users テーブル: OK');

  // 初期ユーザー登録
  const users = [
    { user_id: 'horiuchi', password: 'lit2026', name: '堀内 勝（管理者）' },
    { user_id: 'nozaki', password: 'hokkai2026', name: '野崎 亮太' },
    { user_id: 'kato', password: 'hokkai2026', name: '加藤 アトム' },
    { user_id: 'abe', password: 'hokkai2026', name: '阿部 椋也' },
    { user_id: 'shimakura', password: 'hokkai2026', name: '島倉 知希' },
    { user_id: 'otani', password: 'hokkai2026', name: '大谷 恭広' },
    { user_id: 'kano', password: 'hokkai2026', name: '加納 楓馬' },
    { user_id: 'kumagai', password: 'hokkai2026', name: '熊谷 翔太' },
    { user_id: 'konishi', password: 'hokkai2026', name: '小西 輝也' },
    { user_id: 'sato', password: 'hokkai2026', name: '佐藤 虹太' },
  ];

  const { error } = await supabase
    .from('crm_users')
    .upsert(users, { onConflict: 'user_id' });

  if (error) {
    console.error('ユーザー登録エラー:', error.message);
    process.exit(1);
  }

  // 登録確認
  const { data, error: listErr } = await supabase
    .from('crm_users')
    .select('user_id, name');

  if (!listErr) {
    console.log(`\n登録ユーザー (${data.length}件):`);
    data.forEach(u => console.log(`  ${u.user_id} → ${u.name}`));
  }

  console.log('\n初期ユーザー登録完了');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
