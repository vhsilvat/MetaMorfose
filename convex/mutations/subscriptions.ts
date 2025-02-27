import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getUser } from "../auth";
import { Id } from "../_generated/dataModel";

// Criar ou atualizar uma assinatura
export const createOrUpdateSubscription = mutation({
  args: {
    userId: v.id("users"),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    stripeCustomerId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.string(),
    cancelAtPeriodEnd: v.boolean()
  },
  handler: async (ctx, args) => {
    // Verificar se o usuário existe
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    
    // Verificar se já existe uma assinatura para este usuário
    const existingSubscription = await ctx.db
      .query("subscriptions") // Essa tabela ainda não existe no schema, precisaria ser adicionada
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (existingSubscription) {
      // Atualiza a assinatura existente
      await ctx.db.patch(existingSubscription._id, {
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripePriceId: args.stripePriceId,
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        updatedAt: new Date().toISOString()
      });
      
      return existingSubscription._id;
    }
    
    // Cria uma nova assinatura
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      stripeCustomerId: args.stripeCustomerId,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentHistory: []
    });
    
    // Atualiza o usuário com o ID do cliente Stripe
    await ctx.db.patch(args.userId, {
      stripeCustomerId: args.stripeCustomerId
    });
    
    return subscriptionId;
  }
});

// Atualizar o status de uma assinatura
export const updateSubscriptionStatus = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.string(),
    cancelAtPeriodEnd: v.boolean(),
    stripePriceId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Busca a assinatura pelo ID do Stripe
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();
    
    if (!subscription) {
      throw new Error("Assinatura não encontrada");
    }
    
    // Prepara as atualizações
    const updates: any = {
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      updatedAt: new Date().toISOString()
    };
    
    // Atualiza o preço se fornecido
    if (args.stripePriceId) {
      updates.stripePriceId = args.stripePriceId;
    }
    
    // Atualiza a assinatura
    await ctx.db.patch(subscription._id, updates);
    
    return { success: true };
  }
});

// Registrar status de pagamento
export const recordPaymentStatus = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.string(),
    invoiceId: v.string(),
    amount: v.number(),
    date: v.string()
  },
  handler: async (ctx, args) => {
    // Busca a assinatura pelo ID do Stripe
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();
    
    if (!subscription) {
      throw new Error("Assinatura não encontrada");
    }
    
    // Adiciona o registro de pagamento ao histórico
    const paymentRecord = {
      invoiceId: args.invoiceId,
      status: args.status,
      amount: args.amount,
      date: args.date
    };
    
    const updatedPaymentHistory = [
      ...(subscription.paymentHistory || []),
      paymentRecord
    ];
    
    // Atualiza a assinatura
    await ctx.db.patch(subscription._id, {
      paymentHistory: updatedPaymentHistory,
      lastPaymentStatus: args.status,
      lastPaymentDate: args.date,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  }
});