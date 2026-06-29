import { format, parseISO } from "date-fns";

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function monthName(dateISO: string): string {
  return format(parseISO(dateISO), "MMMM");
}

export function yearOf(dateISO: string): number {
  return parseISO(dateISO).getFullYear();
}

export function dowShort(dateISO: string): string {
  return format(parseISO(dateISO), "EEE");
}

export function prettyDate(dateISO: string): string {
  return format(parseISO(dateISO), "MMMM d, yyyy");
}

export function prettyDateTime(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy HH:mm");
}

export const DOW_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
