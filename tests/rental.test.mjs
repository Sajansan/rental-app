import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, dependencies = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, FormData, Date, Intl, console, require(name) { if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`); return dependencies[name]; } }, { filename: file });
  return exports;
}
const id = '00000000-0000-4000-8000-000000000001';
function paymentService({ payment = { id, status: 'pending', booking_id: id }, updated = { id }, roleError = false } = {}) {
  const writes = [];
  const paths = [];
  const client = { from(table) {
    assert.equal(table, 'payments');
    return {
      select() { return { eq() { return { maybeSingle: async () => ({ data: payment, error: null }) }; } }; },
      update(payload) {
        const conditions = [];
        writes.push({ payload, conditions });
        const chain = { eq(column, value) { conditions.push([column,value]); return chain; }, select() { return chain; }, maybeSingle: async () => ({ data: updated, error: null }) };
        return chain;
      },
    };
  } };
  const service = load('app/admin/payments/actions.ts', {
    'next/cache': { revalidatePath(path) { paths.push(path); } },
    '@/lib/auth': { requireRole: async role => { assert.equal(role, 'admin'); if (roleError) throw new Error('Denied'); } },
    '@/lib/supabase/server': { createClient: async () => client },
  });
  return { service, writes, paths };
}
test('non-admin payment updates never reach the database', async () => {
  const { service, writes } = paymentService({ roleError:true });
  await assert.rejects(service.updatePaymentStatus(id, 'paid'), /Denied/);
  assert.equal(writes.length, 0);
});
test('settled payments cannot be overwritten', async () => {
  const { service, writes } = paymentService({ payment:{ id, status:'paid', booking_id:id } });
  assert.match((await service.updatePaymentStatus(id, 'failed')).error, /settled/);
  assert.equal(writes.length, 0);
});
test('successful settlement sets a timestamp and refreshes both customer and admin views', async () => {
  const { service, writes, paths } = paymentService();
  assert.equal((await service.updatePaymentStatus(id, 'paid')).success, true);
  assert.equal(writes[0].payload.status, 'paid');
  assert.ok(Number.isFinite(Date.parse(writes[0].payload.paid_at)));
  assert.ok(writes[0].conditions.some(([column,value]) => column === 'status' && value === 'pending'));
  assert.ok(paths.includes('/customer'));
  assert.ok(paths.includes(`/my-bookings/${id}`));
  assert.ok(paths.includes('/admin'));
});
test('a concurrent payment change is reported as a failure, not a success', async () => {
  const { service, paths } = paymentService({ updated:null });
  assert.match((await service.updatePaymentStatus(id, 'paid')).error, /could not be updated/);
  assert.equal(paths.length, 0);
});
test('failed payments have no paid timestamp', async () => {
  const { service, writes } = paymentService();
  await service.updatePaymentStatus(id, 'failed');
  assert.equal(writes[0].payload.paid_at, null);
});
test('invalid identifiers and unsupported payment states do not write', async () => {
  const { service, writes } = paymentService();
  assert.ok((await service.updatePaymentStatus('invalid', 'paid')).error);
  assert.ok((await service.updatePaymentStatus(id, 'refunded')).error);
  assert.equal(writes.length, 0);
});
const dates = load('lib/dates.ts');
test('date filters reject malformed and impossible query values', () => {
  for (const value of ['invalid', '2026-02-30', '2026-13-01', '', '2026-1-2']) assert.equal(dates.validDate(value), '');
  assert.equal(dates.validDate('2028-02-29'), '2028-02-29');
});
const bookings = load('lib/bookings.ts', { 'server-only': {}, '@/lib/supabase/server': {} });
test('rental duration counts nights, validates leap dates, and rejects reversed or equal dates', () => {
  assert.equal(bookings.rentalDays('2026-10-06', '2026-10-09'), 3);
  assert.equal(bookings.rentalDays('2028-02-28', '2028-03-01'), 2);
  assert.equal(bookings.rentalDays('2026-02-30', '2026-03-02'), null);
  assert.equal(bookings.rentalDays('2026-10-06', '2026-10-06'), null);
  assert.equal(bookings.rentalDays('2026-10-09', '2026-10-06'), null);
});
