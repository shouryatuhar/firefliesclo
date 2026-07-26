import React from 'react';
import '../styles/globals.css';
import Sidebar from '../components/Sidebar';
import ToastProvider from '../components/Toast';

// Root layout for Next.js App Router. Wraps pages with Sidebar and toast provider.
export const metadata = {
  title: 'Fireflies Clone',
  description: 'Meeting transcripts and AI summaries demo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* ToastProvider supplies toast context to entire app */}
        <ToastProvider>
          <div className="min-h-screen flex">
            {/* Left sidebar */}
            <aside className="w-72 bg-[var(--sidebar-bg)] text-white flex flex-col">
              <Sidebar />
            </aside>

            {/* Main content area */}
            <main className="flex-1 bg-white p-8">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
