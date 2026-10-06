import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, dependencies = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, URL, URLSearchParams, console, require(name) { if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`); return dependencies[name]; } }, { filename: file });
  return exports;
}
const { authLinkDestination } = load('lib/auth-recovery.ts');

test('dashboard recovery links landing on home or another page retain their session fragment and go to reset', () => {
  const fragment = '#access_token=fixture-access&refresh_token=fixture-refresh&type=recovery';
  for (const path of ['/', '/vehicles', '/login']) assert.equal(authLinkDestination(`https://roadlyrentals.vercel.app${path}${fragment}`), `/reset-password${fragment}`);
});
test('expired links arriving at the homepage go to the reset error screen', () => {
  assert.equal(authLinkDestination('https://roadlyrentals.vercel.app/#error=access_denied&error_code=otp_expired'), '/reset-password#error=access_denied&error_code=otp_expired');
});
test('ordinary navigation and signup fragments do not redirect or loop', () => {
  for (const path of ['/', '/#how-it-works', '/#type=signup', '/reset-password#type=recovery', '/auth/callback?code=fixture']) assert.equal(authLinkDestination(`https://roadlyrentals.vercel.app${path}`), null);
});
test('old PKCE links and token-hash links route to fixed local handlers', () => {
  assert.equal(authLinkDestination('https://roadlyrentals.vercel.app/?code=fixture&next=https://attacker.example'), '/auth/callback?code=fixture&next=https://attacker.example');
  assert.equal(authLinkDestination('https://roadlyrentals.vercel.app/?type=recovery&token_hash=fixture'), '/reset-password?type=recovery&token_hash=fixture');
});

function callback(client) {
  return load('app/auth/callback/route.ts', {
    'next/server': { NextResponse: { redirect(url) { return { location: url.href, headers: new Headers() }; } } },
    '@/lib/supabase/server': { createClient: async () => client },
  });
}
// Headers is a Web API shared with the route handler in the isolated test context.
test('PKCE recovery callback exchanges the code before routing to the password form', async () => {
  let passed;
  const route = callback({ auth: { exchangeCodeForSession: async (code, options) => { passed = { code, options }; return { data: { user: { id: 'fixture-user' }, redirectType: 'recovery' }, error: null }; } } });
  const url = new URL('https://roadlyrentals.vercel.app/auth/callback?code=fixture&sb_flow_id=flow&next=https://attacker.example');
  const response = await route.GET({ nextUrl: url, url: url.href });
  assert.equal(response.location, 'https://roadlyrentals.vercel.app/reset-password');
  assert.equal(passed.code, 'fixture');
  assert.equal(passed.options.flowId, 'flow');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});
test('failed and missing authorization codes show a reset error instead of landing at home', async () => {
  for (const query of ['', '?code=expired']) {
    const route = callback({ auth: { exchangeCodeForSession: async () => ({ data: { user: null }, error: { code: 'expired' } }) } });
    const url = new URL(`https://roadlyrentals.vercel.app/auth/callback${query}`);
    const response = await route.GET({ nextUrl: url, url: url.href });
    assert.equal(response.location, 'https://roadlyrentals.vercel.app/reset-password?error=invalid-link');
  }
});
test('signup callbacks retain the normal sign-in destination', async () => {
  const route = callback({ auth: { exchangeCodeForSession: async () => ({ data: { user: { id: 'fixture-user' }, redirectType: 'signup' }, error: null }) } });
  const url = new URL('https://roadlyrentals.vercel.app/auth/callback?code=fixture');
  assert.equal((await route.GET({ nextUrl: url, url: url.href })).location, 'https://roadlyrentals.vercel.app/login');
});
