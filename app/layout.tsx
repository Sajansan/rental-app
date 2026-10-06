import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/site/navbar";

export const metadata: Metadata = {
  title: { default: "Roadly · Car & Van Rentals", template: "%s · Roadly" },
  description: "Find your next drive in Sri Lanka. Compare cars and vans, choose your dates and track your booking with Roadly.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem("roadly-theme")==="dark"?"dark":"light"}catch{document.documentElement.dataset.theme="light"}` }} /></head>
      <body className="min-h-full flex flex-col"><Navbar />{children}<footer className="site-footer mt-auto border-t"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-7 text-sm"><span>© {new Date().getFullYear()} Roadly Rentals</span><span>Clear pricing. Reliable journeys.</span></div></footer></body>
    </html>
  );
}
