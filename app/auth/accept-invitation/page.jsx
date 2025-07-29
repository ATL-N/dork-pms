'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/app/context/NotificationContext';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { addNotification } = useNotification();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      addNotification('No invitation token found.', 'error');
      return;
    }

    // Wait for session to load
    if (status === 'loading') {
      return;
    }

    // If not authenticated, redirect to sign-in with callback URL
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/auth/accept-invitation?token=${token}`);
      return;
    }

    // If authenticated, proceed to accept invitation
    const acceptInvitation = async () => {
      try {
        const response = await fetch('/api/invitations/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to accept invitation.');
        }

        addNotification('Invitation accepted successfully! Redirecting...', 'success');
        // Redirect to dashboard or a specific farm page
        router.push('/');
      } catch (err) {
        addNotification(`Error: ${err.message}`, 'error');
      }
    };

    acceptInvitation();
  }, [searchParams, session, status, router, addNotification]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 card text-center">
        <h1 className="text-2xl font-bold">
          Processing Invitation...
        </h1>
        {status !== 'loading' && (
          <p>Please wait while we set things up for you.</p>
        )}
      </div>
    </div>
  );
}
