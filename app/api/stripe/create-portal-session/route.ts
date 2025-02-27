import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Inicializa o cliente Stripe
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2023-10-16",
});

// Inicializa o cliente HTTP Convex
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Busca o usuário no Convex
    const userProfile = await convex.query(api.queries.users.getUserProfile, {
      clerkId: userId
    });
    
    if (!userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Busca a assinatura atual do usuário
    const subscription = await convex.query(api.queries.subscriptions.getCurrentSubscription);
    
    // Verifica se o usuário tem um ID de cliente no Stripe
    if (!userProfile.stripeCustomerId && (!subscription || !subscription.stripeCustomerId)) {
      return NextResponse.json(
        { error: "No Stripe customer found for this user" },
        { status: 400 }
      );
    }
    
    // Obtém o ID do cliente Stripe
    const stripeCustomerId = userProfile.stripeCustomerId || subscription!.stripeCustomerId;
    
    // Cria a sessão do portal de gerenciamento
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });
    
    // Retorna a URL para redirecionamento
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating portal session:", error);
    
    return NextResponse.json(
      { error: error.message || "Error creating portal session" },
      { status: 500 }
    );
  }
}