import React, { createContext, useContext } from 'react';
import { useResponsiveLayout, type ResponsiveLayout } from '../hooks/useResponsiveLayout';

const ResponsiveLayoutContext = createContext<ResponsiveLayout | null>(null);

export function ResponsiveLayoutProvider({ children }: { children: React.ReactNode }) {
  const layout = useResponsiveLayout();
  return (
    <ResponsiveLayoutContext.Provider value={layout}>{children}</ResponsiveLayoutContext.Provider>
  );
}

export function useLayoutMetrics(): ResponsiveLayout {
  const ctx = useContext(ResponsiveLayoutContext);
  if (!ctx) {
    throw new Error('useLayoutMetrics must be used within ResponsiveLayoutProvider');
  }
  return ctx;
}
