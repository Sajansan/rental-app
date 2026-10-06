// Local visual fixture only. Never imported by application routes or deployments.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import http from 'node:http';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const require = createRequire(import.meta.url);
const root = process.cwd();
let pathname = '/admin';
const date = '2026-10-06T06:00:00Z';
const profile = { id: 'preview-user', full_name: 'Preview administrator', email: 'preview@example.test', role: 'admin', phone: null, avatar_url: null };
const customer = { id: 'preview-customer', full_name: 'Sample customer', phone: '077 000 0000', created_at: date, bookingCount: 2 };
const vehicle = { id: '11111111-1111-4111-8111-111111111111', name: 'Toyota Aqua', brand: 'Toyota', model: 'Aqua', registration_number: 'PREVIEW-001', vehicle_type: 'car', year: 2023, seats: 5, transmission: 'automatic', fuel_type: 'hybrid', price_per_day: 6500, description: 'Sample vehicle used for a local design preview.', status: 'available', created_at: date, updated_at: date, images: [] };
const bookings = ['pending','confirmed'].map((status, index) => ({ id: `preview-booking-${index}`, vehicle_id: vehicle.id, user_id: customer.id, pickup_date: '2026-10-12', return_date: '2026-10-15', price_per_day: 6500, total_price: 19500, pickup_location: 'Colombo', status, notes: null, created_at: date, updated_at: date, vehicle, profile: customer, payments: [], images: [] }));
const payments = [{ id: 'preview-payment', booking_id: bookings[1].id, user_id: customer.id, amount: 19500, status: 'paid', payment_method: 'bank_transfer', paid_at: date, created_at: date }];
const client = { from(table) { let filtered = false; const query = { select() { return query; }, eq() { filtered = true; return query; }, in() { return query; }, order() { return query; }, then(resolve) { resolve({ data: table === 'payments' ? payments : [], count: table === 'vehicles' ? (filtered ? 2 : 4) : table === 'profiles' ? 8 : 1, error: null }); } }; return query; } };
const cache = new Map();
const mocks = {
  'react': { ...React, useActionState: (_action, state) => [state, () => {}, false], useTransition: () => [false, () => {}] },
  'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
  'next/image': { __esModule: true, default: (props) => { const imageProps = { ...props }; delete imageProps.priority; return React.createElement('img', imageProps); } },
  'next/navigation': { usePathname: () => pathname, useRouter: () => ({ refresh() {} }), notFound() { throw new Error('Not found'); }, redirect() { throw new Error('Redirect'); } },
  'server-only': {},
  '@/lib/auth': { requireRole: async () => profile, getAccount: async () => ({ status: 'authenticated', profile }) },
  '@/lib/supabase/server': { createClient: async () => client },
  '@/lib/vehicles': { getVehicles: async () => [vehicle], getVehicle: async () => vehicle },
  '@/lib/bookings': { getAdminBookings: async () => bookings, getAdminBooking: async () => bookings[0], getCustomerProfiles: async () => [customer], getCustomerHistory: async () => ({ profile: customer, bookings }), rentalDays: () => 3 },
  '@/app/auth/actions': {}, '@/app/admin/payments/actions': {}, '@/app/bookings/actions': {}, '@/app/admin/vehicles/actions': {},
};
function load(file) {
  const absolute = path.resolve(root, file);
  if (cache.has(absolute)) return cache.get(absolute);
  const exports = {};
  cache.set(absolute, exports);
  const source = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { exports, console, URL, URLSearchParams, require(name) {
    if (name in mocks) return mocks[name];
    if (name.startsWith('@/') || name.startsWith('.')) { const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(absolute), name); const resolved = ['.tsx','.ts'].map(extension => base + extension).find(candidate => fs.existsSync(candidate)); if (!resolved) throw new Error(`Missing ${name}`); return load(resolved); }
    return require(name);
  } }, { filename: absolute });
  return exports;
}
const pages = { '/admin': 'app/admin/page.tsx', '/admin/bookings': 'app/admin/bookings/page.tsx', '/admin/customers': 'app/admin/customers/page.tsx', '/admin/payments': 'app/admin/payments/page.tsx', '/admin/vehicles': 'app/admin/vehicles/page.tsx', '/admin/vehicles/new': 'app/admin/vehicles/new/page.tsx', '/admin/bookings/preview-booking-0': 'app/admin/bookings/[id]/page.tsx', '/admin/customers/preview-customer': 'app/admin/customers/[id]/page.tsx' };
http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, 'http://localhost:3014');
    if (url.pathname.startsWith('/_next/static/')) { const file = path.resolve(root, '.next/static', url.pathname.slice('/_next/static/'.length)); if (!file.startsWith(path.resolve(root,'.next/static') + path.sep)) { res.writeHead(403).end(); return; } res.setHeader('Content-Type','text/css'); res.end(fs.readFileSync(file)); return; }
    if (url.pathname === '/logo.svg') { res.setHeader('Content-Type','image/svg+xml'); res.end(fs.readFileSync(path.join(root,'public/logo.svg'))); return; }
    if (!(url.pathname in pages)) { res.writeHead(404).end(); return; }
    pathname = url.pathname;
    const page = await load(pages[pathname]).default({ searchParams: Promise.resolve(Object.fromEntries(url.searchParams)), params: Promise.resolve({ id: pathname.split('/').at(-1) }) });
    const layout = await load('app/admin/layout.tsx').default({ children: page });
    const navbar = await load('components/site/navbar.tsx').Navbar();
    const css = fs.readdirSync(path.join(root,'.next/static/chunks')).filter(file => file.endsWith('.css')).map(file => `<link rel="stylesheet" href="/_next/static/chunks/${file}">`).join('');
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.end(`<!doctype html><html data-theme="${url.searchParams.get('theme') === 'dark' ? 'dark' : 'light'}"><head><title>Roadly local design preview</title><meta name="viewport" content="width=device-width, initial-scale=1">${css}</head><body class="min-h-full flex flex-col">${renderToStaticMarkup(navbar)}${renderToStaticMarkup(layout)}</body></html>`);
  } catch (error) { console.error(error); res.writeHead(500).end('Preview failed'); }
}).listen(3014,'127.0.0.1',()=>console.log('Local fixture preview at http://localhost:3014/admin'));


