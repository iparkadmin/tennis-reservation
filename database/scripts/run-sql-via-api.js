#!/usr/bin/env node
/**
 * Supabase Management API で SQL を実行するスクリプト
 *
 * 使い方:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx SUPABASE_PROJECT_REF=yawzyrzfbphxrthlrzjg node run-sql-via-api.js <sql-file>
 *
 * 前提:
 *   - https://supabase.com/dashboard/account/tokens で Personal Access Token を取得
 *   - 環境変数 SUPABASE_ACCESS_TOKEN にトークンを設定
 *   - 環境変数 SUPABASE_PROJECT_REF にプロジェクト ID を設定（例: yawzyrzfbphxrthlrzjg）
 */

const fs = require('fs');
const path = require('path');

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF || 'yawzyrzfbphxrthlrzjg';

const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error('Usage: SUPABASE_ACCESS_TOKEN=sbp_xxx node run-sql-via-api.js <sql-file>');
  process.exit(1);
}

if (!token || !token.startsWith('sbp_')) {
  console.error('Error: SUPABASE_ACCESS_TOKEN is required. Get it from https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

const absPath = path.isAbsolute(sqlPath) ? sqlPath : path.join(process.cwd(), sqlPath);
if (!fs.existsSync(absPath)) {
  console.error('Error: SQL file not found:', absPath);
  process.exit(1);
}

const sql = fs.readFileSync(absPath, 'utf8');

async function runQuery(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

async function main() {
  console.log('Running SQL via Supabase Management API...');
  console.log('Project:', projectRef);
  console.log('---');

  try {
    const result = await runQuery(sql);
    if (result.result !== undefined) {
      console.log('Result:', JSON.stringify(result.result, null, 2));
    }
    if (result.error) {
      console.error('Error:', result.error);
      process.exit(1);
    }
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }

  console.log('---');
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
