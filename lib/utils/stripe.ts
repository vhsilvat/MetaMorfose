import Stripe from 'stripe';

// Inicializa o cliente Stripe
export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2023-10-16', // Versão da API do Stripe
  appInfo: {
    name: 'MetaMorfose',
    version: '0.1.0'
  }
});

// Função para obter os planos disponíveis
export async function getPlans() {
  const prices = await stripe.prices.list({
    active: true,
    limit: 10,
    expand: ['data.product']
  });

  return prices.data.map(price => {
    const product = price.product as Stripe.Product;
    
    return {
      id: price.id,
      productId: product.id,
      name: product.name,
      description: product.description,
      features: product.metadata.features ? JSON.parse(product.metadata.features) : [],
      price: price.unit_amount! / 100,
      currency: price.currency,
      interval: price.recurring?.interval,
      intervalCount: price.recurring?.interval_count
    };
  });
}

// Função para criar uma sessão de checkout do Stripe
export async function createCheckoutSession({
  priceId,
  customerId,
  successUrl,
  cancelUrl
}: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    locale: 'pt-BR',
    allow_promotion_codes: true
  };

  // Se o cliente já existir no Stripe, usa o ID dele
  if (customerId) {
    params.customer = customerId;
  }

  const session = await stripe.checkout.sessions.create(params);
  
  return { sessionId: session.id, url: session.url };
}

// Função para obter uma assinatura
export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['customer', 'default_payment_method']
  });
}

// Função para criar um portal do cliente
export async function createCustomerPortalSession({
  customerId,
  returnUrl
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });
  
  return { url: session.url };
}

// Função para cancelar uma assinatura
export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId);
}

// Função para formatar o preço
export function formatPrice(price: number, currency: string = 'brl') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(price);
}

// Função para obter a próxima data de cobrança
export function getNextBillingDate(subscription: Stripe.Subscription) {
  const nextBillingDate = new Date(subscription.current_period_end * 1000);
  
  return nextBillingDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}