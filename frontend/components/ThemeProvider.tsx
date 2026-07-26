'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';

const ThemeContext = createContext<{
  isDark: true;
} | null>(null);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const value = useMemo(() => ({
    isDark: true as const,
  }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
