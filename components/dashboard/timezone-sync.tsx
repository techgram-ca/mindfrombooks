"use client";
import { useEffect } from "react";
import { confirmTimezoneAction } from "@/app/dashboard/actions";

/** For accounts created with Google: record the browser's timezone once. */
export function TimezoneSync() {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) void confirmTimezoneAction(tz);
  }, []);
  return null;
}
