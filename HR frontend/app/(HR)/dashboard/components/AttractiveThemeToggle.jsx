// app/(HR)/dashboard/components/AttractiveThemeToggle.jsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function AttractiveThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on the server to avoid hydration mismatch
  if (!mounted) {
    // Render a placeholder to prevent layout shift
    return <div className="w-16 h-8" />;
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div
      onClick={toggleTheme}
      className={`relative flex items-center w-16 h-8 rounded-full cursor-pointer transition-colors duration-300 ease-in-out
                  ${isDark ? "bg-slate-700" : "bg-sky-200"}`}
    >
      {/* Sun Icon */}
      <Sun
        className="absolute left-1.5 z-10 text-yellow-500"
        size={20}
      />

      {/* Moon Icon */}
      <Moon
        className="absolute right-1.5 z-10 text-slate-300"
        size={20}
      />

      {/* The animated sliding thumb */}
      <motion.div
        className="absolute w-7 h-7 bg-white rounded-full shadow-md"
        initial={{ x: isDark ? "2rem" : "0.25rem" }}
        animate={{ x: isDark ? "2rem" : "0.25rem" }} // 2rem = 32px, 0.25rem = 4px
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}