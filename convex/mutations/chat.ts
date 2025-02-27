import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getUser } from "../auth";

// Registrar uma interação de chat
export const recordChatInteraction = mutation({
  args: {
    prompt: v.string(),
    response: v.string(),
    timestamp: v.string()
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Não temos uma tabela específica para chats no schema principal, 
    // mas podemos adicioná-la se necessário.
    // Por enquanto, utilizamos o modelo de usuário para armazenar a última interação
    
    // Atualiza o usuário com a timestamp da última interação
    await ctx.db.patch(user._id, {
      lastActiveAt: args.timestamp
    });
    
    // Se quisermos implementar um histórico de chat, podemos criar uma tabela específica
    
    return { success: true };
  }
});

// Obter as últimas interações de chat (se implementarmos essa tabela)
export const getChatHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // Esse é um placeholder para quando implementarmos o histórico de chat
    // Por enquanto, retorna apenas um array vazio
    
    return [];
  }
});