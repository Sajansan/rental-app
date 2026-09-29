"use client";
import { useState, useTransition } from "react";
import { updateBookingStatus } from "@/app/bookings/actions";
import type { BookingStatus } from "@/types/profile";
const choices: Record<BookingStatus, BookingStatus[]> = { pending:["confirmed","rejected","cancelled"], confirmed:["active","cancelled"], active:["completed"], completed:[], cancelled:[], rejected:[] };
export function BookingStatusControl({ id, status }: { id: string; status: BookingStatus }) {
  const [message,setMessage]=useState(""); const [pending,start]=useTransition();
  if (!choices[status].length) return null;
  return <div className="flex flex-wrap gap-2">{choices[status].map((next)=><button key={next} disabled={pending} onClick={()=>start(async()=>{ const result=await updateBookingStatus(id,next); setMessage(result.error??`Booking ${next}.`); })} className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize disabled:opacity-50 ${next==="rejected"||next==="cancelled"?"border border-stone-300 text-stone-700 hover:bg-stone-50":"bg-emerald-900 text-white hover:bg-emerald-800"}`}>{pending?"Saving…":next}</button>)}{message&&<p role="status" className="basis-full text-sm text-stone-600">{message}</p>}</div>;
}
