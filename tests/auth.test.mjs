import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, dependencies = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports, FormData, console,
    require(name) {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename: file });
  return exports;
}

const validation = load('lib/auth-validation.ts');
const redirect = (path) => { throw new Error(`redirect:${path}`); };
function accountClient({ role = 'customer', user = { id: 'user-1' }, error = null, missing = false, profileError = null } = {}) {
  return {
    auth: { getUser: async () => ({ data: { user }, error }) },
    from(table) {
      assert.equal(table, 'profiles');
      return { select(columns) {
        assert.equal(columns, 'id, full_name, phone, role, avatar_url');
        return { eq(column, id) {
          assert.equal(column, 'id');
          assert.equal(id, 'user-1');
          return { maybeSingle: async () => ({ data: missing ? null : { id, full_name: 'Test', role, phone: null, avatar_url: null }, error: profileError }) };
        } };
      } };
    },
  };
}
function auth(client) {
  return load('lib/auth.ts', {
    'server-only': {}, react: { cache: (fn) => fn },
    'next/navigation': { redirect },
    '@/lib/supabase/server': { createClient: async () => client },
  });
}

test('registration rejects empty names, invalid emails, short and mismatched passwords', () => {
  assert.match(validation.validateRegistration(' ', 'a@b.com', 'abcdef', 'abcdef'), /name/);
  assert.match(validation.validateRegistration('A', 'bad', 'abcdef', 'abcdef'), /email/);
  assert.match(validation.validateRegistration('A', 'a@b.com', 'abc', 'abc'), /6/);
  assert.match(validation.validateRegistration('A', 'a@b.com', 'abcdef', 'different'), /match/);
  assert.equal(validation.validateRegistration('A', 'a@b.com', 'abcdef', 'abcdef'), undefined);
});

test('unauthenticated access redirects to login for both roles', async () => {
  for (const role of ['customer', 'admin']) {
    await assert.rejects(auth(accountClient({ user: null })).requireRole(role), /redirect:\/login$/);
  }
});

test('roles are read from the current user profile and wrong-role visits redirect', async () => {
  for (const role of ['customer', 'admin']) {
    const service = auth(accountClient({ role }));
    assert.equal((await service.requireRole(role)).role, role);
    await assert.rejects(service.requireRole(role === 'admin' ? 'customer' : 'admin'), new RegExp(`redirect:/${role}$`));
  }
});

test('missing profiles, unsupported roles, RLS errors and service errors fail closed', async () => {
  for (const options of [{ missing: true }, { role: 'owner' }, { profileError: { message: 'denied' } }, { error: { status: 503 } }]) {
    const service = auth(accountClient(options));
    assert.equal((await service.getAccount()).status, 'error');
    await assert.rejects(service.requireRole('admin'), /redirect:\/login\?error=account/);
  }
});

function actions(client, account = { status: 'authenticated', profile: { role: 'customer' } }) {
  return load('app/auth/actions.ts', {
    'next/navigation': { redirect }, 'next/cache': { revalidatePath() {} },
    '@/lib/supabase/server': { createClient: async () => client },
    '@/lib/auth': { getAccount: async () => account },
    '@/lib/auth-validation': validation,
  });
}
function form(extra = {}) {
  const data = new FormData();
  Object.entries({ full_name: 'Test User', phone: '123', email: 'test@example.com', password: 'abcdef', confirm_password: 'abcdef', ...extra }).forEach(([k, v]) => data.set(k, v));
  return data;
}

test('signup ignores a forged role and reports when confirmation blocks an immediate session', async () => {
  let payload;
  const service = actions({ auth: { signUp: async (value) => {
    payload = value;
    return { data: { session: null }, error: null };
  } } });
  const result = await service.register({}, form({ role: 'admin' }));
  assert.match(result.error, /Turn off Confirm email/);
  assert.equal(JSON.stringify(payload.options.data), JSON.stringify({ full_name: 'Test User', phone: '123' }));
});

test('immediate signup sessions and successful logins redirect using the profile role', async () => {
  for (const role of ['customer', 'admin']) {
    const service = actions({ auth: {
      signUp: async () => ({ data: { session: {} }, error: null }),
      signInWithPassword: async () => ({ error: null }),
    } }, { status: 'authenticated', profile: { role } });
    await assert.rejects(service.login({}, form()), new RegExp(`redirect:/${role}$`));
    await assert.rejects(service.register({}, form()), new RegExp(`redirect:/${role}$`));
  }
});

test('login handles invalid credentials, unconfirmed email, network and missing profile errors', async () => {
  for (const [code, message] of [['invalid_credentials', /Invalid email/], ['email_not_confirmed', /Turn off Confirm email/]]) {
    const result = await actions({ auth: { signInWithPassword: async () => ({ error: { code } }) } }).login({}, form());
    assert.match(result.error, message);
  }
  const network = await actions({ auth: { signInWithPassword: async () => { throw new Error('network'); } } }).login({}, form());
  assert.match(network.error, /connect/);
  const missing = await actions({ auth: { signInWithPassword: async () => ({ error: null }) } }, { status: 'error', message: 'Unable to load your profile.' }).login({}, form());
  assert.match(missing.error, /profile/);
});

test('logout redirects only after successful signOut', async () => {
  await assert.rejects(actions({ auth: { signOut: async () => ({ error: null }) } }).logout(), /redirect:\/login$/);
  const result = await actions({ auth: { signOut: async () => ({ error: {} }) } }).logout();
  assert.match(result.error, /Unable to log out/);
});
