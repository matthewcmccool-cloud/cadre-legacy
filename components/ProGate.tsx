'use client';

import { useSubscription } from '@/hooks/useSubscription';
import type { ReactNode } from 'react';

interface ProGateProps {
  children: ReactNode;
  fallback: ReactNode;
}

export default function ProGate({ children, fallback }: ProGateProps) {
  const { isPro } = useSubscription();
  return <>{isPro ? children : fallback}</>;
}
