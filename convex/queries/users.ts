import { v } from "convex/values";
import { query } from "../_generated/server";
import { getUser } from "../auth";
import { Id } from "../_generated/dataModel";

// Buscar perfil do usuário por ID do Clerk
export const getUserProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    if (!user) {
      return null;
    }
    
    // Busca dados adicionais relevantes para o perfil
    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    const onboardingState = await ctx.db
      .query("onboardingState")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    // Constrói o objeto de perfil do usuário
    return {
      _id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      anamneseLevel: user.anamneseLevel,
      isComplete: user.isComplete,
      registeredAt: user.registeredAt,
      lastActiveAt: user.lastActiveAt,
      progress: userProgress ? {
        level: userProgress.level,
        unlockedFeatures: userProgress.unlockedFeatures,
        achievements: userProgress.achievements,
        weeklyStreak: userProgress.weeklyStreak,
        completedWorkouts: userProgress.completedWorkouts,
        totalTrainingTime: userProgress.totalTrainingTime
      } : null,
      onboarding: onboardingState ? {
        completedSteps: onboardingState.completedSteps,
        nextStep: onboardingState.nextStep,
        nextCollection: onboardingState.nextCollection
      } : null
    };
  }
});

// Buscar perfil do usuário por ID
export const getUserProfileById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      return null;
    }
    
    // Busca dados adicionais relevantes para o perfil
    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    const onboardingState = await ctx.db
      .query("onboardingState")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    // Constrói o objeto de perfil do usuário
    return {
      _id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      anamneseLevel: user.anamneseLevel,
      isComplete: user.isComplete,
      registeredAt: user.registeredAt,
      lastActiveAt: user.lastActiveAt,
      progress: userProgress ? {
        level: userProgress.level,
        unlockedFeatures: userProgress.unlockedFeatures,
        achievements: userProgress.achievements,
        weeklyStreak: userProgress.weeklyStreak,
        completedWorkouts: userProgress.completedWorkouts,
        totalTrainingTime: userProgress.totalTrainingTime
      } : null,
      onboarding: onboardingState ? {
        completedSteps: onboardingState.completedSteps,
        nextStep: onboardingState.nextStep,
        nextCollection: onboardingState.nextCollection
      } : null
    };
  }
});

// Buscar perfil do usuário atual
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    // Busca dados adicionais relevantes para o perfil
    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    const onboardingState = await ctx.db
      .query("onboardingState")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    // Constrói o objeto de perfil do usuário
    return {
      _id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      anamneseLevel: user.anamneseLevel,
      isComplete: user.isComplete,
      registeredAt: user.registeredAt,
      lastActiveAt: user.lastActiveAt,
      progress: userProgress ? {
        level: userProgress.level,
        unlockedFeatures: userProgress.unlockedFeatures,
        achievements: userProgress.achievements,
        weeklyStreak: userProgress.weeklyStreak,
        completedWorkouts: userProgress.completedWorkouts,
        totalTrainingTime: userProgress.totalTrainingTime
      } : null,
      onboarding: onboardingState ? {
        completedSteps: onboardingState.completedSteps,
        nextStep: onboardingState.nextStep,
        nextCollection: onboardingState.nextCollection
      } : null
    };
  }
});

// Buscar estado de onboarding do usuário
export const getOnboardingState = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("onboardingState")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  }
});

// Buscar resumo de dados do usuário para o dashboard
export const getUserDashboardData = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    // Em ambiente de desenvolvimento, retornar dados mockados para exibir a UI
    if (process.env.NODE_ENV === "development") {
      return {
        user: {
          _id: user._id,
          firstName: user.firstName || "Usuário",
          lastName: user.lastName || "Teste",
          anamneseLevel: user.anamneseLevel || 0,
          isComplete: user.isComplete || false
        },
        latestMetrics: {
          _id: "mock_metrics_id",
          userId: user._id,
          date: new Date().toISOString(),
          weight: 75.5,
          bodyComposition: {
            bodyFatPercentage: 15.3,
            leanMass: 64.0,
            fatMass: 11.5
          }
        },
        recentWorkouts: [
          {
            _id: "mock_workout_1",
            userId: user._id,
            date: new Date().toISOString(),
            type: "strength",
            duration: 65,
            perceivedEffort: 8,
            exercises: [
              {
                name: "Supino Reto",
                sets: [
                  { weight: 80, reps: 8, rpe: 8 },
                  { weight: 80, reps: 8, rpe: 9 },
                  { weight: 75, reps: 10, rpe: 9 }
                ]
              },
              {
                name: "Desenvolvimento",
                sets: [
                  { weight: 50, reps: 10, rpe: 7 },
                  { weight: 50, reps: 10, rpe: 8 },
                  { weight: 45, reps: 12, rpe: 9 }
                ]
              }
            ]
          },
          {
            _id: "mock_workout_2",
            userId: user._id,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            type: "cardio",
            duration: 40,
            perceivedEffort: 7,
            exercises: [
              {
                name: "Corrida",
                sets: [
                  { reps: 1 }
                ]
              }
            ]
          }
        ],
        recentSleep: [
          {
            _id: "mock_sleep_1",
            userId: user._id,
            date: new Date().toISOString(),
            duration: 440,
            quality: 8,
            bedTime: "23:00",
            wakeTime: "06:20"
          }
        ],
        recentWellbeing: [
          {
            _id: "mock_wellbeing_1",
            userId: user._id,
            date: new Date().toISOString(),
            energyLevel: 8,
            stressLevel: 4,
            mood: "good"
          }
        ],
        currentPlan: {
          _id: "mock_plan_id",
          userId: user._id,
          date: new Date().toISOString().split('T')[0],
          schedule: [
            { time: "06:30", activity: "Acordar e hidratação", duration: 10 },
            { time: "07:00", activity: "Treino de Força", duration: 60, details: "Foco em peito e ombros" },
            { time: "08:15", activity: "Café da manhã", duration: 20 },
            { time: "12:30", activity: "Almoço", duration: 30 },
            { time: "16:00", activity: "Lanche", duration: 15 },
            { time: "19:30", activity: "Jantar", duration: 30 },
            { time: "22:30", activity: "Rotina de preparação para dormir", duration: 20 }
          ],
          workoutPlan: {
            type: "Força",
            focusArea: "Peito e Ombros",
            exercises: [
              { name: "Supino Reto", sets: 3, repsRange: "8-10", restTime: 90, notes: "Foco na contração" },
              { name: "Supino Inclinado", sets: 3, repsRange: "10-12", restTime: 90 },
              { name: "Desenvolvimento", sets: 3, repsRange: "10-12", restTime: 90 },
              { name: "Elevação Lateral", sets: 3, repsRange: "12-15", restTime: 60 },
              { name: "Tríceps Corda", sets: 3, repsRange: "12-15", restTime: 60 }
            ],
            warmup: "5 minutos de mobilidade de ombros e 5 minutos de cardio leve",
            cooldown: "Alongamento de peito e ombros por 5 minutos"
          },
          nutritionPlan: {
            totalCaloriesTarget: 2600,
            macrosTarget: {
              protein: 180,
              carbs: 290,
              fat: 80
            },
            hydrationTarget: 3000,
            mealSuggestions: [
              {
                time: "08:15",
                description: "Café da manhã",
                options: ["Ovos mexidos com aveia e frutas", "Panquecas proteicas com frutas"]
              },
              {
                time: "11:00",
                description: "Lanche da manhã",
                options: ["Iogurte com frutas e granola", "Shake proteico com banana"]
              },
              {
                time: "12:30",
                description: "Almoço",
                options: ["Frango grelhado com arroz integral e legumes", "Salmão com batata doce e salada"]
              },
              {
                time: "16:00",
                description: "Lanche da tarde",
                options: ["Wrap de peito de peru", "Omelete com legumes"]
              },
              {
                time: "19:30",
                description: "Jantar",
                options: ["Carne magra com vegetais", "Peixe assado com quinoa e brócolis"]
              }
            ]
          },
          wellbeingTips: [
            "Fique atento à sua postura durante o dia",
            "Tente fazer pequenas pausas para se alongar entre períodos de trabalho sentado",
            "Beba água regularmente ao longo do dia"
          ],
          completed: false,
          generatedBy: "system"
        }
      };
    }
    
    // Busca as últimas métricas físicas
    const latestMetrics = await ctx.db
      .query("physicalMetrics")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
    
    // Busca os últimos dados de treino
    const recentWorkouts = await ctx.db
      .query("workouts")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(5);
    
    // Busca os últimos dados de sono
    const recentSleep = await ctx.db
      .query("sleepData")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(7);
    
    // Busca os últimos dados de bem-estar
    const recentWellbeing = await ctx.db
      .query("wellbeing")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(7);
    
    // Busca o plano diário atual
    const today = new Date().toISOString().split('T')[0];
    const currentPlan = await ctx.db
      .query("dailyPlans")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .first();
    
    return {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        anamneseLevel: user.anamneseLevel,
        isComplete: user.isComplete
      },
      latestMetrics,
      recentWorkouts,
      recentSleep,
      recentWellbeing,
      currentPlan
    };
  }
});