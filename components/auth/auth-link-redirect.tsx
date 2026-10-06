"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { authLinkDestination } from "@/lib/auth-recovery";

export function AuthLinkRedirect() {
  const pathname = usePathname();
  useEffect(() => {
    function handleLink() {
      const destination = authLinkDestination(window.location.href);
      if (destination) window.location.replace(destination);
    }
    handleLink();
    window.addEventListener("hashchange", handleLink);
    return () => window.removeEventListener("hashchange", handleLink);
  }, [pathname]);
  return null;
}
