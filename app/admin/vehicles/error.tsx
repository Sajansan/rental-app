"use client";

export default function VehiclesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section role="alert" className="space-y-3 rounded border border-red-200 bg-red-50 p-5 text-red-900">
    <h1 className="text-xl font-semibold">Vehicle management could not be loaded.</h1>
    <p>Check the Supabase connection and your access, then try again.</p>
    <button className="rounded border border-red-300 bg-white px-3 py-2" onClick={reset}>Try again</button>
  </section>;
}
