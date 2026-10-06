type IconName = "arrow" | "check" | "car" | "van" | "calendar" | "wallet" | "users" | "grid" | "menu" | "search";
const paths: Record<IconName, string> = {
  arrow: "M5 12h14m-6-6 6 6-6 6", check: "m5 12 4 4L19 6",
  car: "M5 17H3v-6l2-6h14l2 6v6h-2M5 17h14M3 11h18M7 14h.01M17 14h.01M5 17v3m14-3v3",
  van: "M3 6h14l4 6v6H3V6Zm0 6h18M13 6v6M6 18v2m12-2v2M6 15h.01M18 15h.01",
  calendar: "M8 3v4m8-4v4M3 10h18M4 5h16v16H4V5Zm4 9h3m2 3h3",
  wallet: "M3 7h17v14H3V7Zm0 0V4h15v3m-3 6h6v4h-6v-4Z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-4M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 0a4 4 0 0 1 0 8",
  grid: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
  menu: "M4 6h16M4 12h16M4 18h16", search: "M21 21l-5-5M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z",
};
export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <svg aria-hidden="true" className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
