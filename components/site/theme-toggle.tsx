"use client";

export function ThemeToggle() {
  function toggleTheme(event: React.MouseEvent<HTMLButtonElement>) {
    const next = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem("roadly-theme", next ? "dark" : "light"); } catch { /* Keep the in-memory preference if storage is unavailable. */ }
    event.currentTarget.setAttribute("aria-label", `Switch to ${next ? "light" : "dark"} theme`);
    event.currentTarget.setAttribute("title", `Switch to ${next ? "light" : "dark"} theme`);
  }

  return <button type="button" onClick={toggleTheme} aria-label="Switch theme" title="Switch theme" className="theme-toggle"><span className="theme-light-icon" aria-hidden="true">☾</span><span className="theme-dark-icon" aria-hidden="true">☼</span><span className="hidden sm:inline theme-light-label">Dark</span><span className="hidden sm:inline theme-dark-label">Light</span></button>;
}
