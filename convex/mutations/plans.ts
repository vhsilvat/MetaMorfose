import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getUser } from "../auth";
import { Id } from "../_generated/dataModel";

// Criar um novo plano diário
export const createDailyPlan = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    schedule: v.array(v.object({
      time: v.string(),
      activity: v.string(),
      duration: v.number(),
      details: v.optional(v.string())
    })),
    workoutPlan: v.optional(v.object({
      type: v.string(),
      focusArea: v.string(),
      exercises: v.array(v.object({
        name: v.string(),
        sets: v.number(),
        repsRange: v.string(),
        restTime: v.number(),
        notes: v.optional(v.string())
      })),
      warmup: v.optional(v.string()),
      cooldown: v.optional(v.string())
    })),
    nutritionPlan: v.optional(v.object({
      totalCaloriesTarget: v.number(),
      macrosTarget: v.object({
        protein: v.number(),
        carbs: v.number(),
        fat: v.number()
      }),
      hydrationTarget: v.number(),
      mealSuggestions: v.array(v.object({
        time: v.string(),
        description: v.string(),
        options: v.array(v.string())
      }))
    })),
    wellbeingTips: v.optional(v.array(v.string())),
    completed: v.boolean(),
    generatedBy: v.string()
  },
  handler: async (ctx, args) => {
    // Verificar se já existe um plano para este dia
    const existingPlan = await ctx.db
      .query("dailyPlans")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();
    
    if (existingPlan) {
      // Atualiza o plano existente
      await ctx.db.patch(existingPlan._id, {
        schedule: args.schedule,
        workoutPlan: args.workoutPlan,
        nutritionPlan: args.nutritionPlan,
        wellbeingTips: args.wellbeingTips,
        completed: args.completed,
        generatedBy: args.generatedBy
      });
      
      return existingPlan._id;
    }
    
    // Cria um novo plano
    return await ctx.db.insert("dailyPlans", {
      userId: args.userId,
      date: args.date,
      schedule: args.schedule,
      workoutPlan: args.workoutPlan,
      nutritionPlan: args.nutritionPlan,
      wellbeingTips: args.wellbeingTips,
      completed: args.completed,
      generatedBy: args.generatedBy
    });
  }
});

// Atualizar um plano diário existente
export const updateDailyPlan = mutation({
  args: {
    planId: v.id("dailyPlans"),
    schedule: v.optional(v.array(v.object({
      time: v.string(),
      activity: v.string(),
      duration: v.number(),
      details: v.optional(v.string())
    }))),
    workoutPlan: v.optional(v.object({
      type: v.string(),
      focusArea: v.string(),
      exercises: v.array(v.object({
        name: v.string(),
        sets: v.number(),
        repsRange: v.string(),
        restTime: v.number(),
        notes: v.optional(v.string())
      })),
      warmup: v.optional(v.string()),
      cooldown: v.optional(v.string())
    })),
    nutritionPlan: v.optional(v.object({
      totalCaloriesTarget: v.number(),
      macrosTarget: v.object({
        protein: v.number(),
        carbs: v.number(),
        fat: v.number()
      }),
      hydrationTarget: v.number(),
      mealSuggestions: v.array(v.object({
        time: v.string(),
        description: v.string(),
        options: v.array(v.string())
      }))
    })),
    wellbeingTips: v.optional(v.array(v.string())),
    completed: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    const plan = await ctx.db.get(args.planId);
    
    if (!plan) {
      throw new Error("Plano não encontrado");
    }
    
    if (plan.userId !== user._id) {
      throw new Error("Você não tem permissão para atualizar este plano");
    }
    
    // Constrói objeto com campos atualizados
    const updates: any = {};
    
    if (args.schedule !== undefined) {
      updates.schedule = args.schedule;
    }
    
    if (args.workoutPlan !== undefined) {
      updates.workoutPlan = args.workoutPlan;
    }
    
    if (args.nutritionPlan !== undefined) {
      updates.nutritionPlan = args.nutritionPlan;
    }
    
    if (args.wellbeingTips !== undefined) {
      updates.wellbeingTips = args.wellbeingTips;
    }
    
    if (args.completed !== undefined) {
      updates.completed = args.completed;
    }
    
    // Atualiza o plano
    await ctx.db.patch(args.planId, updates);
    
    return { success: true };
  }
});

// Enviar feedback sobre um plano diário
export const submitPlanFeedback = mutation({
  args: {
    planId: v.id("dailyPlans"),
    planCompletion: v.number(),
    workoutFeedback: v.optional(v.object({
      difficulty: v.number(),
      enjoyment: v.number(),
      effectiveness: v.number(),
      comments: v.optional(v.string())
    })),
    nutritionFeedback: v.optional(v.object({
      adherence: v.number(),
      satisfaction: v.number(),
      challenges: v.optional(v.array(v.string())),
      comments: v.optional(v.string())
    })),
    generalFeedback: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    const plan = await ctx.db.get(args.planId);
    
    if (!plan) {
      throw new Error("Plano não encontrado");
    }
    
    if (plan.userId !== user._id) {
      throw new Error("Você não tem permissão para enviar feedback para este plano");
    }
    
    // Cria o registro de feedback
    const feedbackId = await ctx.db.insert("feedbacks", {
      userId: user._id,
      date: new Date().toISOString(),
      relatedPlanId: args.planId,
      planCompletion: args.planCompletion,
      workoutFeedback: args.workoutFeedback,
      nutritionFeedback: args.nutritionFeedback,
      generalFeedback: args.generalFeedback
    });
    
    // Marca o plano como completo
    await ctx.db.patch(args.planId, {
      completed: true
    });
    
    return { success: true, feedbackId };
  }
});