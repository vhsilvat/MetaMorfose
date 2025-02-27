'use client';

import { PostHogProvider as PostHogProviderLib } from 'posthog-js/react';
import { PropsWithChildren, useEffect, useState } from 'react';
import posthog from 'posthog-js';

export default function PostHogProvider({
  children,
}: PropsWithChildren) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // Inicializa o PostHog apenas no lado do cliente
    setIsMounted(true);
    
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    
    if (posthogKey && posthogHost && typeof window !== 'undefined') {
      // Inicializa o PostHog
      posthog.init(posthogKey, {
        api_host: posthogHost,
        capture_pageview: false, // Vamos capturar pageviews manualmente
        loaded: (ph) => {
          if (process.env.NODE_ENV !== 'production') {
            // Descomente esta linha para desativar o rastreamento em desenvolvimento
            // ph.opt_out_capturing();
          }
        },
      });
      
      // Adiciona informações de debug no console
      console.log('PostHog inicializado com sucesso:', { 
        key: posthogKey.substring(0, 5) + '...',
        host: posthogHost
      });
    }
  }, []);

  // Se não estiver no lado do cliente, renderiza apenas os filhos
  if (!isMounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}