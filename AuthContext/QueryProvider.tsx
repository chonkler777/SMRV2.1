'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, 
      gcTime: 10 * 60 * 1000, 
      retry: 2, 
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), 
      refetchOnWindowFocus: false, 
      refetchOnReconnect: true, 
      refetchOnMount: false, 
    },
    mutations: {
      retry: 1, 
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}