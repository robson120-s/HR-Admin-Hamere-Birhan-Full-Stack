
// lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  const filtered = inputs.filter(Boolean).join(" ");
  return twMerge(clsx(filtered));
}