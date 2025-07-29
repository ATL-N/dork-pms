'use client';

import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from './context/NotificationContext';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </SessionProvider>
  );
}
