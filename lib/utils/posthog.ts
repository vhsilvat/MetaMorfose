import posthog from 'posthog-js';

// Inicializa o PostHog no lado do cliente
export const initPostHog = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      // Ativa o modo de desenvolvimento em ambiente não produtivo
      loaded: (posthog) => {
        if (process.env.NODE_ENV !== 'production') {
          posthog.debug();
        }
      },
      capture_pageview: false, // Vamos capturar manualmente para mais controle
      persistence: 'localStorage',
      autocapture: true,
      disable_session_recording: false, // Ativa gravação de sessão
      session_recording: {
        maskAllInputs: true, // Mascara campos de input por segurança
        maskInputOptions: {
          password: true,
          email: true,
          number: false,
          textareas: false
        }
      }
    });
  }
};

// Evento de página visualizada (pageview)
export const capturePageview = (url: string) => {
  if (typeof window !== 'undefined' && posthog.isFeatureEnabled('capture-pageviews')) {
    posthog.capture('$pageview', { $current_url: url });
  }
};

// Evento de anamnese completada
export const captureAnamneseStepCompleted = (step: number) => {
  posthog.capture('anamnese_step_completed', { step });
};

// Evento de treino registrado
export const captureWorkoutLogged = (workoutType: string, duration: number, exerciseCount: number) => {
  posthog.capture('workout_logged', {
    workout_type: workoutType,
    duration,
    exercise_count: exerciseCount
  });
};

// Evento de plano diário gerado
export const capturePlanGenerated = (planType: string) => {
  posthog.capture('plan_generated', { plan_type: planType });
};

// Evento de conquista desbloqueada
export const captureAchievementUnlocked = (achievementId: string, achievementName: string) => {
  posthog.capture('achievement_unlocked', {
    achievement_id: achievementId,
    achievement_name: achievementName
  });
};

// Identificar usuário
export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.identify(userId, userProperties);
  }
};

// Marcar grupos a que o usuário pertence
export const setUserGroup = (groupType: string, groupKey: string) => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.group(groupType, groupKey);
  }
};

// Resetar identificação (para logout)
export const resetIdentity = () => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.reset();
  }
};