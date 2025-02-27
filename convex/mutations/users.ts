import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getUser } from "../auth";
import { Id } from "../_generated/dataModel";

// Atualizar o perfil do usuário atual
export const updateUserProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Filtra apenas campos definidos
    const updates: any = {};
    
    if (args.firstName !== undefined) {
      updates.firstName = args.firstName;
    }
    
    if (args.lastName !== undefined) {
      updates.lastName = args.lastName;
    }
    
    if (args.imageUrl !== undefined) {
      updates.imageUrl = args.imageUrl;
    }
    
    // Atualiza o perfil do usuário
    await ctx.db.patch(user._id, {
      ...updates,
      lastActiveAt: new Date().toISOString()
    });
    
    return { success: true };
  }
});

// Atualizar o estado de onboarding do usuário
export const updateOnboardingState = mutation({
  args: {
    onboardingId: v.id("onboardingState"),
    completedSteps: v.optional(v.array(v.string())),
    nextStep: v.optional(v.string()),
    scheduledReminders: v.optional(v.array(v.object({
      type: v.string(),
      date: v.string(),
      sent: v.boolean()
    }))),
    nextCollection: v.optional(v.object({
      type: v.string(),
      dueDate: v.string()
    }))
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    const onboardingState = await ctx.db.get(args.onboardingId);
    
    if (!onboardingState) {
      throw new Error("Estado de onboarding não encontrado");
    }
    
    if (onboardingState.userId !== user._id) {
      throw new Error("Você não tem permissão para atualizar este estado de onboarding");
    }
    
    // Constrói objeto com campos atualizados
    const updates: any = {};
    
    if (args.completedSteps !== undefined) {
      updates.completedSteps = args.completedSteps;
    }
    
    if (args.nextStep !== undefined) {
      updates.nextStep = args.nextStep;
    }
    
    if (args.scheduledReminders !== undefined) {
      updates.scheduledReminders = args.scheduledReminders;
    }
    
    if (args.nextCollection !== undefined) {
      updates.nextCollection = args.nextCollection;
    }
    
    // Atualiza o estado de onboarding
    await ctx.db.patch(args.onboardingId, updates);
    
    return { success: true };
  }
});

// Atualizar o progresso do usuário
export const updateUserProgress = mutation({
  args: {
    unlockedFeatures: v.optional(v.array(v.string())),
    achievements: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      achievedAt: v.string()
    }))),
    weeklyStreak: v.optional(v.number()),
    completedWorkouts: v.optional(v.number()),
    totalTrainingTime: v.optional(v.number()),
    level: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Busca o progresso atual do usuário
    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    if (!userProgress) {
      throw new Error("Progresso do usuário não encontrado");
    }
    
    // Constrói objeto com campos atualizados
    const updates: any = {};
    
    if (args.unlockedFeatures !== undefined) {
      updates.unlockedFeatures = args.unlockedFeatures;
    }
    
    if (args.achievements !== undefined) {
      updates.achievements = args.achievements;
    }
    
    if (args.weeklyStreak !== undefined) {
      updates.weeklyStreak = args.weeklyStreak;
    }
    
    if (args.completedWorkouts !== undefined) {
      updates.completedWorkouts = args.completedWorkouts;
    }
    
    if (args.totalTrainingTime !== undefined) {
      updates.totalTrainingTime = args.totalTrainingTime;
    }
    
    if (args.level !== undefined) {
      updates.level = args.level;
    }
    
    // Atualiza o progresso do usuário
    await ctx.db.patch(userProgress._id, updates);
    
    return { success: true };
  }
});

// Atualizar o nível de anamnese do usuário
export const updateAnamneseLevel = mutation({
  args: {
    anamneseLevel: v.number(),
    isComplete: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    const updates: any = {
      anamneseLevel: args.anamneseLevel
    };
    
    if (args.isComplete !== undefined) {
      updates.isComplete = args.isComplete;
    }
    
    await ctx.db.patch(user._id, updates);
    
    return { success: true };
  }
});

// Adicionar uma nova conquista ao usuário
export const addAchievement = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    description: v.string()
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Busca o progresso atual do usuário
    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    if (!userProgress) {
      throw new Error("Progresso do usuário não encontrado");
    }
    
    // Verifica se a conquista já existe
    if (userProgress.achievements.some(a => a.id === args.id)) {
      return { success: true, alreadyExists: true };
    }
    
    // Adiciona a nova conquista
    const newAchievement = {
      id: args.id,
      name: args.name,
      description: args.description,
      achievedAt: new Date().toISOString()
    };
    
    await ctx.db.patch(userProgress._id, {
      achievements: [...userProgress.achievements, newAchievement]
    });
    
    return { success: true, alreadyExists: false };
  }
});