import { v } from "convex/values";
import { query } from "../_generated/server";
import { getUser } from "../auth";
import { Id } from "../_generated/dataModel";

// Buscar dados de anamnese do usuário por ID
export const getUserAnamneseById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("anamnese")
      .withIndex("by_user_and_step", (q) => q.eq("userId", args.userId))
      .collect();
  }
});

// Buscar dados de anamnese do usuário atual
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

// Verificar o progresso da anamnese do usuário
export const getAnamneseProgress = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    const anamneseSteps = await ctx.db
      .query("anamnese")
      .withIndex("by_user_and_step", (q) => q.eq("userId", user._id))
      .collect();
    
    const completedSteps = anamneseSteps.map(step => step.step);
    
    return {
      currentLevel: user.anamneseLevel,
      completedSteps,
      isComplete: user.isComplete,
      nextStep: user.anamneseLevel + 1 <= 5 ? user.anamneseLevel + 1 : null
    };
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