import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { Icon } from "./icon";

export function WorkspaceHeading({ eyebrow = "Rental workspace", title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="workspace-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

export function WorkspaceEmpty({ icon, title, description, action }: { icon: ComponentProps<typeof Icon>["name"]; title: string; description: string; action?: ReactNode }) {
  return <div className="workspace-empty"><span className="workspace-empty-icon"><Icon name={icon} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function MetricCard({ label, value, hint, icon, href }: { label: string; value: ReactNode; hint: string; icon: ComponentProps<typeof Icon>["name"]; href: string }) {
  return <Link className="workspace-metric" href={href}><div><span>{label}</span><span className="workspace-metric-icon"><Icon name={icon} /></span></div><strong>{value}</strong><p>{hint}<Icon name="arrow" /></p></Link>;
}
