import { clerkClient } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

/**
 * Verifica se o usuário está autenticado e tem um perfil completo no sistema
 */
export async function getUserProfile() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return null;
    }
    
    // Inicializa cliente Convex
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    
    // Busca o perfil do usuário no Convex
    const userProfile = await convex.query(api.users.getUserProfile, {
      clerkId: user.id
    });
    
    return {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      profile: userProfile
    };
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    return null;
  }
}

/**
 * Redireciona o usuário baseado no estágio da anamnese
 */
export async function getRedirectPathForUser() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return "/sign-in";
    }
    
    // Inicializa cliente Convex
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    
    // Busca o perfil do usuário no Convex
    const userProfile = await convex.query(api.users.getUserProfile, {
      clerkId: user.id
    });
    
    if (!userProfile) {
      // Usuário existe no Clerk mas não no Convex, aguarda sincronização
      return "/waiting";
    }
    
    // Verifica se o usuário completou a anamnese
    if (!userProfile.isComplete) {
      // Redireciona para a próxima etapa da anamnese
      return `/anamnese/step-${userProfile.anamneseLevel + 1}`;
    }
    
    // Usuário com anamnese completa vai para o dashboard
    return "/dashboard";
  } catch (error) {
    console.error("Erro ao determinar redirecionamento:", error);
    return "/error";
  }
}