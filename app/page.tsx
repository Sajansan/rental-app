import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-5 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Car &amp; Van Rental</h1>
      <p className="text-lg text-slate-600">Find and book your ideal vehicle.</p>
      <div className="flex gap-3">
        <Link href="/login" className="rounded-md bg-blue-700 px-5 py-2 text-white hover:bg-blue-800">Login</Link>
        <Link href="/register" className="rounded-md border border-slate-300 px-5 py-2 hover:bg-slate-100">Register</Link>
      </div>
    </main>
  );
}
