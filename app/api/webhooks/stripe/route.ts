import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2023-10-16',
});

// Inicializa o cliente HTTP Convex para chamar funções do backend
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Manipula diferentes tipos de eventos
  switch (event.type) {
    // Quando uma assinatura é criada com sucesso
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;

    // Quando uma assinatura é atualizada (upgrade, downgrade, etc.)
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    // Quando uma assinatura é cancelada
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    // Quando um pagamento falha
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    // Quando um pagamento é bem-sucedido
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    // Quando um cliente é criado no Stripe
    case 'customer.created':
      await handleCustomerCreated(event.data.object as Stripe.Customer);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Handlers para os diferentes tipos de eventos

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    
    // Busca o usuário relacionado a este cliente do Stripe
    const user = await convex.query(api.queries.subscriptions.getUserByStripeCustomerId, {
      stripeCustomerId: customerId
    });

    if (!user) {
      console.error('User not found for Stripe customer:', customerId);
      return;
    }

    // Atualiza a assinatura do usuário no Convex
    await convex.mutation(api.mutations.subscriptions.createOrUpdateSubscription, {
      userId: user._id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCustomerId: customerId,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });

    // Desbloqueia recursos premium com base no plano assinado
    await convex.mutation(api.mutations.users.updateUserProgress, {
      unlockedFeatures: [
        "dashboard", 
        "anamnese", 
        "workouts", 
        "nutrition", 
        "metrics", 
        "sleep", 
        "wellbeing", 
        "dailyPlans", 
        "statistics", 
        "ai-chat",
        "premium-insights",
        "advanced-tracking"
      ]
    });

    console.log('Subscription created and user updated successfully:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Atualiza a assinatura no banco de dados
    await convex.mutation(api.mutations.subscriptions.updateSubscriptionStatus, {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripePriceId: subscription.items.data[0].price.id
    });

    console.log('Subscription updated successfully:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Marca a assinatura como cancelada no banco de dados
    await convex.mutation(api.mutations.subscriptions.updateSubscriptionStatus, {
      stripeSubscriptionId: subscription.id,
      status: 'canceled',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: true
    });

    // Quando a assinatura for cancelada e o período de graça terminar,
    // deveria restringir os recursos premium (mas por enquanto não fazemos isso)
    
    console.log('Subscription marked as canceled:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) return;

    // Atualiza o status de pagamento no banco de dados
    await convex.mutation(api.mutations.subscriptions.recordPaymentStatus, {
      stripeSubscriptionId: invoice.subscription as string,
      status: 'failed',
      invoiceId: invoice.id,
      amount: invoice.total / 100,
      date: new Date(invoice.created * 1000).toISOString()
    });

    console.log('Payment failure recorded:', invoice.id);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) return;

    // Atualiza o status de pagamento no banco de dados
    await convex.mutation(api.mutations.subscriptions.recordPaymentStatus, {
      stripeSubscriptionId: invoice.subscription as string,
      status: 'succeeded',
      invoiceId: invoice.id,
      amount: invoice.total / 100,
      date: new Date(invoice.created * 1000).toISOString()
    });

    console.log('Payment success recorded:', invoice.id);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  try {
    // Aqui poderíamos criar um registro do cliente do Stripe, se necessário
    console.log('Stripe customer created:', customer.id);
  } catch (error) {
    console.error('Error handling customer created:', error);
  }
}