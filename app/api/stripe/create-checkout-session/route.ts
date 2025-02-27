import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs";
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
    
    // Obtém os dados do corpo da requisição
    const { priceId, successUrl, cancelUrl } = await req.json();
    
    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }
    
    // Obtém o usuário atual do Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Busca o usuário no Convex
    const userProfile = await convex.query(api.queries.users.getUserProfile, {
      clerkId: userId
    });
    
    // Parâmetros para a sessão de checkout
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
      customer_email: user.emailAddresses[0].emailAddress,
      client_reference_id: userId,
      locale: "pt-BR",
      allow_promotion_codes: true,
      metadata: {
        userId: userId,
      },
    };
    
    // Se o usuário já tem um ID de cliente no Stripe, use-o
    if (userProfile?.stripeCustomerId) {
      params.customer = userProfile.stripeCustomerId;
    }
    
    // Cria a sessão de checkout
    const session = await stripe.checkout.sessions.create(params);
    
    // Retorna a URL para redirecionamento
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    
    return NextResponse.json(
      { error: error.message || "Error creating checkout session" },
      { status: 500 }
    );
  }
}