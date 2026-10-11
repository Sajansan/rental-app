import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Roadly · Car & Van Rentals",
    short_name: "Roadly",
    description: "Your next drive in Sri Lanka.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef4ff",
    theme_color: "#2563eb",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
