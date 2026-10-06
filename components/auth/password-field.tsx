"use client";

import { useState, type InputHTMLAttributes } from "react";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> & {
  id: string;
  label: string;
};

export function PasswordField({ id, label, className = "field", disabled, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const toggleLabel = `${visible ? "Hide" : "Show"} ${label.toLowerCase()}`;

  return (
    <div>
      <label className="block text-sm font-medium" htmlFor={id}>{label}</label>
      <div className="relative mt-2">
        <input {...props} id={id} disabled={disabled} type={visible ? "text" : "password"} className={className} style={{ ...props.style, paddingRight: "3.25rem" }} />
        <button
          type="button"
          disabled={disabled}
          aria-label={toggleLabel}
          aria-controls={id}
          aria-pressed={visible}
          title={toggleLabel}
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-lg text-stone-500 transition hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="m3 3 18 18" />}
          </svg>
        </button>
      </div>
    </div>
  );
}
