'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { SubscriptionProvider } from '@/hooks/useSubscription';
import { FollowsProvider } from '@/hooks/useFollows';
import { ToastProvider } from '@/hooks/useToast';
import TrialWelcomeToast from '@/components/TrialWelcomeToast';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <FollowsProvider>
          <ToastProvider>
            <TrialWelcomeToast />
            {children}
          </ToastProvider>
        </FollowsProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
