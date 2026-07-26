import React from 'react';
import '../styles/globals.css';
import ToastProvider from '../components/Toast';
import ThemeProvider from '../components/ThemeProvider';

export const metadata = {
  title: 'Fireflies Clone | AI Meeting Assistant',
  description: 'A polished Fireflies.ai-inspired meeting assistant demo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
