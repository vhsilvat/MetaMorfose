import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, internalMutation, query } from "./_generated/server";

// Função para verificar a autenticação do usuário
export const getUserAuth = async (ctx: QueryCtx | MutationCtx) => {
  // Para ambiente de desenvolvimento, retorna uma autenticação mockada
  if (process.env.NODE_ENV === "development") {
    return {
      userId: "mock_clerk_id",
      email: "user@example.com",
      firstName: "Usuário",
      lastName: "Teste",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=mock"
    };
  }
  
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    throw new ConvexError("Você precisa estar autenticado para realizar esta ação");
  }
  
  return {
    userId: identity.subject,
    email: identity.email!,
    firstName: identity.name?.split(" ")[0],
    lastName: identity.name?.split(" ").slice(1).join(" "),
    imageUrl: identity.pictureUrl
  };
};

// Função para obter o usuário atual do banco de dados
export const getUser = async (ctx: QueryCtx | MutationCtx) => {
  const auth = await getUserAuth(ctx);
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", auth.userId))
    .first();
  
  if (!user) {
    // Em ambiente de desenvolvimento, criar um usuário mockado se não existir
    if (process.env.NODE_ENV === "development") {
      const userId = await ctx.db.insert("users", {
        clerkId: auth.userId,
        email: auth.email,
        firstName: auth.firstName,
        lastName: auth.lastName,
        imageUrl: auth.imageUrl,
        registeredAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        anamneseLevel: 0,
        isComplete: false
      });
      
      // Inicializa o estado de onboarding do usuário
      await ctx.db.insert("onboardingState", {
        userId,
        completedSteps: [],
        nextStep: "anamnese-step-1",
        scheduledReminders: [{
          type: "anamnese",
          date: new Date().toISOString(),
          sent: false
        }]
      });
      
      // Inicializa o progresso do usuário
      await ctx.db.insert("userProgress", {
        userId,
        unlockedFeatures: ["dashboard", "anamnese"],
        achievements: [],
        weeklyStreak: 0,
        completedWorkouts: 0,
        totalTrainingTime: 0,
        level: 1
      });
      
      return await ctx.db.get(userId);
    }
    
    throw new ConvexError("Usuário não encontrado no banco de dados");
  }
  
  return user;
};

// Criar ou atualizar usuário quando o Clerk envia um webhook
export const createOrUpdateUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    if (existingUser) {
      // Atualiza o usuário existente
      return await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        lastActiveAt: new Date().toISOString()
      });
    } else {
      // Cria um novo usuário
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        registeredAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        anamneseLevel: 0,
        isComplete: false
      });
      
      // Inicializa o estado de onboarding do usuário
      await ctx.db.insert("onboardingState", {
        userId,
        completedSteps: [],
        nextStep: "anamnese-step-1",
        scheduledReminders: [{
          type: "anamnese",
          date: new Date().toISOString(),
          sent: false
        }]
      });
      
      // Inicializa o progresso do usuário
      await ctx.db.insert("userProgress", {
        userId,
        unlockedFeatures: ["dashboard", "anamnese"],
        achievements: [],
        weeklyStreak: 0,
        completedWorkouts: 0,
        totalTrainingTime: 0,
        level: 1
      });
      
      return userId;
    }
  }
});

// Deletar usuário quando o Clerk envia um webhook de deleção
export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    if (!user) {
      throw new ConvexError("Usuário não encontrado");
    }
    
    // Aqui faríamos a exclusão de todos os dados relacionados ao usuário
    // Por segurança, poderia ser interessante manter alguns dados anonimizados
    
    await ctx.db.delete(user._id);
    return { success: true };
  }
});

// Verificar o nível atual de anamnese do usuário
export const getAnamneseLevel = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    return user.anamneseLevel;
  }
});