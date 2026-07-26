'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem { id: string; type: ToastType; message: string }

const ToastContext = createContext<{
  pushToast: (type: ToastType, message: string) => void;
} | null>(null);

// Provider component that renders toasts and exposes pushToast
export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((t) => [...t, { id, type, message }]);
    // auto-dismiss
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              t.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : t.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-900'
                  : 'border-indigo-200 bg-indigo-50 text-indigo-900'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook for consuming toast context
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export { ToastContext, ToastProvider };
