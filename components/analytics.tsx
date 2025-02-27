"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { useUser } from "@clerk/nextjs";

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !posthog) return;

    try {
      // Identifica o usuário se estiver logado
      if (isUserLoaded && user) {
        console.log('Identificando usuário no PostHog:', user.id);
        posthog.identify(user.id, {
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
        });
      } else if (isUserLoaded && !user) {
        console.log('Resetando identificação no PostHog (usuário não logado)');
        posthog.reset();
      }

      // Captura pageview a cada mudança de rota
      if (pathname) {
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        console.log('Capturando pageview:', url);
        posthog.capture("$pageview", { 
          $current_url: url 
        });
      }
    } catch (error) {
      console.error('Erro ao interagir com PostHog:', error);
    }
  }, [pathname, searchParams, user, isUserLoaded, isMounted]);

  return null;
}