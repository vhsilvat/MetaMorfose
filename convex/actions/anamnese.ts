import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { getUser } from "../auth";
import { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";

// Buscar dados de anamnese do usuário
export const getUserAnamnese = query({
  args: { step: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Busca todas as etapas de anamnese do usuário
    let anamneseQuery = ctx.db
      .query("anamnese")
      .withIndex("by_user_and_step", (q) => q.eq("userId", user._id));
    
    // Se um step específico foi solicitado
    if (args.step !== undefined) {
      anamneseQuery = anamneseQuery.filter((q) => q.eq(q.field("step"), args.step));
    }
    
    return await anamneseQuery.collect();
  }
});

// Verificar se o usuário pode acessar uma determinada etapa de anamnese
export const canAccessAnamneseStep = query({
  args: { step: v.number() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Verifica se o nível de anamnese do usuário permite acessar a etapa solicitada
    return user.anamneseLevel >= args.step - 1;
  }
});

// Enviar dados da primeira etapa de anamnese
export const submitAnamneseStep1 = mutation({
  args: {
    age: v.number(),
    height: v.number(),
    primaryGoals: v.array(v.string()),
    secondaryGoals: v.array(v.string()),
    experienceLevel: v.string()
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Verifica se esta etapa já foi completada
    const existingStep = await ctx.db
      .query("anamnese")
      .withIndex("by_user_and_step", (q) => 
        q.eq("userId", user._id).eq("step", 1)
      )
      .first();
    
    // Dados da etapa 1
    const stepData = {
      userId: user._id,
      step: 1,
      completedAt: new Date().toISOString(),
      age: args.age,
      height: args.height,
      primaryGoals: args.primaryGoals,
      secondaryGoals: args.secondaryGoals,
      experienceLevel: args.experienceLevel
    };
    
    // Se já existe, atualiza os dados
    if (existingStep) {
      await ctx.db.patch(existingStep._id, stepData);
    } else {
      // Caso contrário, cria um novo registro
      await ctx.db.insert("anamnese", stepData);
    }
    
    // Atualiza o nível de anamnese do usuário se for maior que o atual
    if (user.anamneseLevel < 1) {
      await ctx.db.patch(user._id, { anamneseLevel: 1 });
      
      // Atualiza o estado de onboarding
      const onboardingState = await ctx.db
        .query("onboardingState")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
      
      if (onboardingState) {
        await ctx.db.patch(onboardingState._id, {
          completedSteps: [...onboardingState.completedSteps, "anamnese-step-1"],
          nextStep: "anamnese-step-2",
          scheduledReminders: [
            ...onboardingState.scheduledReminders,
            {
              type: "anamnese",
              date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // +2 dias
              sent: false
            }
          ]
        });
      }
    }
    
    return { success: true };
  }
});

// Enviar dados da segunda etapa de anamnese
export const submitAnamneseStep2 = mutation({
  args: {
    trainingHistory: v.string(),
    previousInjuries: v.array(v.object({
      bodyPart: v.string(),
      description: v.string(),
      whenHappened: v.string(),
      isRecurrent: v.boolean(),
      affectsTraining: v.boolean()
    })),
    currentTrainingFrequency: v.number()
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Verifica se o usuário pode acessar esta etapa
    if (user.anamneseLevel < 1) {
      throw new Error("Você precisa completar a primeira etapa da anamnese");
    }
    
    // Verifica se esta etapa já foi completada
    const existingStep = await ctx.db
      .query("anamnese")
      .withIndex("by_user_and_step", (q) => 
        q.eq("userId", user._id).eq("step", 2)
      )
      .first();
    
    // Dados da etapa 2
    const stepData = {
      userId: user._id,
      step: 2,
      completedAt: new Date().toISOString(),
      trainingHistory: args.trainingHistory,
      previousInjuries: args.previousInjuries,
      currentTrainingFrequency: args.currentTrainingFrequency
    };
    
    // Se já existe, atualiza os dados
    if (existingStep) {
      await ctx.db.patch(existingStep._id, stepData);
    } else {
      // Caso contrário, cria um novo registro
      await ctx.db.insert("anamnese", stepData);
    }
    
    // Atualiza o nível de anamnese do usuário se for maior que o atual
    if (user.anamneseLevel < 2) {
      await ctx.db.patch(user._id, { anamneseLevel: 2 });
      
      // Atualiza o estado de onboarding
      const onboardingState = await ctx.db
        .query("onboardingState")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
      
      if (onboardingState) {
        await ctx.db.patch(onboardingState._id, {
          completedSteps: [...onboardingState.completedSteps, "anamnese-step-2"],
          nextStep: "anamnese-step-3",
          scheduledReminders: [
            ...onboardingState.scheduledReminders,
            {
              type: "anamnese",
              date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // +4 dias
              sent: false
            }
          ]
        });
      }
    }
    
    return { success: true };
  }
});

// Enviar dados da terceira etapa de anamnese
export const submitAnamneseStep3 = mutation({
  args: {
    posturalObservations: v.array(v.string()),
    initialMeasurements: v.object({
      weight: v.number(),
      neck: v.optional(v.number()),
      chest: v.optional(v.number()),
      waist: v.optional(v.number()),
      hips: v.optional(v.number()),
      rightArm: v.optional(v.number()),
      leftArm: v.optional(v.number()),
      rightThigh: v.optional(v.number()),
      leftThigh: v.optional(v.number()),
      rightCalf: v.optional(v.number()),
      leftCalf: v.optional(v.number())
    })
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Verifica se o usuário pode acessar esta etapa
    if (user.anamneseLevel < 2) {
      throw new Error("Você precisa completar as etapas anteriores da anamnese");
    }
    
    // Verifica se esta etapa já foi completada
    const existingStep = await ctx.db
      .query("anamnese")
      .withIndex("by_user_and_step", (q) => 
        q.eq("userId", user._id).eq("step", 3)
      )
      .first();
    
    // Dados da etapa 3
    const stepData = {
      userId: user._id,
      step: 3,
      completedAt: new Date().toISOString(),
      posturalObservations: args.posturalObservations,
      initialMeasurements: args.initialMeasurements
    };
    
    // Se já existe, atualiza os dados
    if (existingStep) {
      await ctx.db.patch(existingStep._id, stepData);
    } else {
      // Caso contrário, cria um novo registro
      await ctx.db.insert("anamnese", stepData);
    }
    
    // Registra também estas medidas na tabela de métricas físicas
    await ctx.db.insert("physicalMetrics", {
      userId: user._id,
      date: new Date().toISOString(),
      weight: args.initialMeasurements.weight,
      bodyMeasurements: {
        neck: args.initialMeasurements.neck,
        chest: args.initialMeasurements.chest,
        waist: args.initialMeasurements.waist,
        hips: args.initialMeasurements.hips,
        rightArm: args.initialMeasurements.rightArm,
        leftArm: args.initialMeasurements.leftArm,
        rightThigh: args.initialMeasurements.rightThigh,
        leftThigh: args.initialMeasurements.leftThigh,
        rightCalf: args.initialMeasurements.rightCalf,
        leftCalf: args.initialMeasurements.leftCalf
      }
    });
    
    // Atualiza o nível de anamnese do usuário se for maior que o atual
    if (user.anamneseLevel < 3) {
      await ctx.db.patch(user._id, { anamneseLevel: 3 });
      
      // Atualiza o estado de onboarding
      const onboardingState = await ctx.db
        .query("onboardingState")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
      
      if (onboardingState) {
        await ctx.db.patch(onboardingState._id, {
          completedSteps: [...onboardingState.completedSteps, "anamnese-step-3"],
          nextStep: "anamnese-step-4",
          scheduledReminders: [
            ...onboardingState.scheduledReminders,
            {
              type: "anamnese",
              date: new Date().toISOString(), // imediatamente
              sent: false
            }
          ]
        });
      }
    }
    
    return { success: true };
  }
});

// Enviar dados da quarta etapa de anamnese
export const submitAnamneseStep4 = mutation({
  args: {
    dietType: v.string(),
    foodAllergies: v.array(v.string()),
    foodPreferences: v.object({
      likes: v.array(v.string()),
      dislikes: v.array(v.string())
    }),
    mealsPerDay: v.number(),
    supplementsUsed: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Verifica se o usuário pode acessar esta etapa
    if (user.anamneseLevel < 3) {
      throw new Error("Você precisa completar as etapas anteriores da anamnese");
    }
    
    // Verifica se esta etapa já foi completada
    const existingStep = await ctx.db
      .query("anamnese")
      .withIndex("by_user_and_step", (q) => 
        q.eq("userId", user._id).eq("step", 4)
      )
      .first();
    
    // Dados da etapa 4
    const stepData = {
      userId: user._id,
      step: 4,
      completedAt: new Date().toISOString(),
      dietType: args.dietType,
      foodAllergies: args.foodAllergies,
      foodPreferences: args.foodPreferences,
      mealsPerDay: args.mealsPerDay,
      supplementsUsed: args.supplementsUsed
    };
    
    // Se já existe, atualiza os dados
    if (existingStep) {
      await ctx.db.patch(existingStep._id, stepData);
    } else {
      // Caso contrário, cria um novo registro
      await ctx.db.insert("anamnese", stepData);
    }
    
    // Atualiza o nível de anamnese do usuário se for maior que o atual
    if (user.anamneseLevel < 4) {
      await ctx.db.patch(user._id, { anamneseLevel: 4 });
      
      // Atualiza o estado de onboarding
      const onboardingState = await ctx.db
        .query("onboardingState")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
      
      if (onboardingState) {
        await ctx.db.patch(onboardingState._id, {
          completedSteps: [...onboardingState.completedSteps, "anamnese-step-4"],
          nextStep: "anamnese-step-5",
          scheduledReminders: [
            ...onboardingState.scheduledReminders,
            {
              type: "anamnese",
              date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // +5 dias
              sent: false
            }
          ]
        });
      }
      
      // Desbloqueia recursos adicionais
      const userProgress = await ctx.db
        .query("userProgress")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
      
      if (userProgress) {
        await ctx.db.patch(userProgress._id, {
          unlockedFeatures: [
            ...userProgress.unlockedFeatures,
            "nutrition",
            "metrics"
          ]
        });
      }
    }
    
    return { success: true };
  }
});

// Enviar dados da quinta etapa de anamnese
export const submitAnamneseStep5 = mutation({
  args: {
    sleepPatterns: v.object({
      averageDuration: v.number(),
      qualityRating: v.number(),
      bedtime: v.string(),
      wakeTime: v.string(),
      sleepChallenges: v.array(v.string())
    }),
    stressLevels: v.number(),
    recoveryCapacity: v.number(),
    lifestyle: v.object({
      occupation: v.string(),
      activityLevel: v.string(),
      workSchedule: v.string()
    })
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Verifica se o usuário pode acessar esta etapa
    if (user.anamneseLevel < 4) {
      throw new Error("Você precisa completar as etapas anteriores da anamnese");
    }
    
    // Verifica se esta etapa já foi completada
    const existingStep = await ctx.db
      .query("anamnese")
      .withIndex("by_user_and_step", (q) => 
        q.eq("userId", user._id).eq("step", 5)
      )
      .first();
    
    // Dados da etapa 5
    const stepData = {
      userId: user._id,
      step: 5,
      completedAt: new Date().toISOString(),
      sleepPatterns: args.sleepPatterns,
      stressLevels: args.stressLevels,
      recoveryCapacity: args.recoveryCapacity,
      lifestyle: args.lifestyle
    };
    
    // Se já existe, atualiza os dados
    if (existingStep) {
      await ctx.db.patch(existingStep._id, stepData);
    } else {
      // Caso contrário, cria um novo registro
      await ctx.db.insert("anamnese", stepData);
    }
    
    // Registra também os dados de sono na tabela específica
    await ctx.db.insert("sleepData", {
      userId: user._id,
      date: new Date().toISOString(),
      duration: args.sleepPatterns.averageDuration,
      quality: args.sleepPatterns.qualityRating,
      bedTime: args.sleepPatterns.bedtime,
      wakeTime: args.sleepPatterns.wakeTime,
      notes: args.sleepPatterns.sleepChallenges.join(", ")
    });
    
    // Registra dados de bem-estar
    await ctx.db.insert("wellbeing", {
      userId: user._id,
      date: new Date().toISOString(),
      energyLevel: 10 - args.stressLevels, // inverso do nível de estresse
      stressLevel: args.stressLevels,
      mood: args.stressLevels <= 3 ? "excellent" : args.stressLevels <= 6 ? "good" : "fair",
      generalNotes: `Capacidade de recuperação auto-avaliada: ${args.recoveryCapacity}/10`
    });
    
    // Atualiza o nível de anamnese do usuário e marca como completo
    await ctx.db.patch(user._id, { 
      anamneseLevel: 5,
      isComplete: true
    });
    
    // Atualiza o estado de onboarding
    const onboardingState = await ctx.db
      .query("onboardingState")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    if (onboardingState) {
      await ctx.db.patch(onboardingState._id, {
        completedSteps: [...onboardingState.completedSteps, "anamnese-step-5", "anamnese-complete"],
        nextStep: "create-first-plan",
        scheduledReminders: [
          ...onboardingState.scheduledReminders,
          {
            type: "first-plan",
            date: new Date().toISOString(), // imediatamente
            sent: false
          }
        ],
        nextCollection: {
          type: "daily-plan",
          dueDate: new Date().toISOString()
        }
      });
    }
    
    // Desbloqueia todos os recursos
    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    if (userProgress) {
      await ctx.db.patch(userProgress._id, {
        unlockedFeatures: [
          ...userProgress.unlockedFeatures,
          "sleep",
          "wellbeing",
          "dailyPlans",
          "statistics",
          "ai-chat"
        ],
        achievements: [
          ...userProgress.achievements,
          {
            id: "anamnese-complete",
            name: "Perfil Completo",
            description: "Completou todas as etapas da anamnese inicial",
            achievedAt: new Date().toISOString()
          }
        ],
        level: 2
      });
    }
    
    // Gera o primeiro plano diário usando a IA
    await ctx.scheduler.runAfter(0, internal.actions.planner.generateFirstPlan, {
      userId: user._id._id
    });
    
    return { success: true };
  }
});

// Gerar o primeiro plano diário após a conclusão da anamnese
export const generateFirstPlan = action({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Esta função seria implementada para gerar o primeiro plano diário
    // utilizando os dados da anamnese e a API da Anthropic
    
    // Por questões de implementação, não vamos incluir o código completo aqui
    // mas seria feito um processamento dos dados da anamnese e uma chamada à API do Claude
    
    // Depois, o resultado seria inserido na tabela dailyPlans
    
    return { success: true };
  }
});