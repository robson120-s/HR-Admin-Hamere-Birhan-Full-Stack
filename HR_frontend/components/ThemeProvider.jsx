// components/ThemeProvider.jsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// This component is a "bridge" to the actual provider
export function ThemeProvider({ children }) {
  // All the logic and props go inside this client component
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}