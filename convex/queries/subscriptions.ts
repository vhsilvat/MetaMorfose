import { v } from "convex/values";
import { query } from "../_generated/server";
import { getUser } from "../auth";

// Buscar assinatura do usuário atual
export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    // Busca a assinatura pelo ID do usuário
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    return subscription;
  }
});

// Buscar usuário pelo ID do cliente Stripe
export const getUserByStripeCustomerId = query({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    // Busca o usuário pelo ID do cliente Stripe
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("stripeCustomerId"), args.stripeCustomerId))
      .first();
    
    return user;
  }
});

// Buscar assinatura pelo ID de assinatura do Stripe
export const getSubscriptionByStripeId = query({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    // Busca a assinatura pelo ID do Stripe
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();
    
    return subscription;
  }
});

// Verificar se o usuário tem assinatura ativa
export const hasActiveSubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    // Busca a assinatura pelo ID do usuário
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    // Verifica se existe assinatura e se está ativa
    if (!subscription) {
      return false;
    }
    
    const activeStatuses = ['active', 'trialing'];
    return activeStatuses.includes(subscription.status);
  }
});

// Buscar histórico de pagamentos
export const getPaymentHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Busca a assinatura pelo ID do usuário
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    if (!subscription || !subscription.paymentHistory) {
      return [];
    }
    
    // Ordena por data (mais recente primeiro)
    const sortedHistory = [...subscription.paymentHistory].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Limita o número de resultados se especificado
    if (args.limit) {
      return sortedHistory.slice(0, args.limit);
    }
    
    return sortedHistory;
  }
});