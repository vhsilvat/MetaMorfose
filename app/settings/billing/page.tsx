"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast/use-toast";
import { PricingCard } from "@/components/subscription/pricing-card";
import { formatDate } from "@/lib/utils";

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const subscription = useQuery(api.queries.subscriptions.getCurrentSubscription);
  const paymentHistory = useQuery(api.queries.subscriptions.getPaymentHistory);
  const hasActiveSubscription = useQuery(api.queries.subscriptions.hasActiveSubscription);
  
  // Estado para controlar a exibição de mensagens de sucesso/erro
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);
  
  useEffect(() => {
    // Verifica parâmetros de URL após redirecionamento do Stripe
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    
    if (success === "true") {
      setShowSuccess(true);
      toast({
        title: "Assinatura realizada com sucesso!",
        description: "Sua assinatura foi processada com sucesso.",
        variant: "success",
      });
    }
    
    if (canceled === "true") {
      setShowCanceled(true);
      toast({
        title: "Assinatura cancelada",
        description: "O processo de assinatura foi cancelado.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);
  
  // Função para abrir o portal de gerenciamento do Stripe
  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Erro ao abrir portal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o portal de gerenciamento.",
        variant: "destructive",
      });
    }
  };
  
  // Planos de assinatura
  const pricingPlans = [
    {
      title: "Plano Básico",
      price: 29.90,
      interval: "month" as const,
      description: "Para quem está começando sua jornada fitness",
      priceId: "price_1JXYzZHGJMPptFbCvX9i0Qvs", // Exemplo - usar ID real do Stripe
      features: [
        "Acompanhamento básico de treinos",
        "Registro de métricas físicas",
        "Planos de treino semanais",
        "Dashboard personalizado",
      ],
      recommended: false,
    },
    {
      title: "Plano Pro",
      price: 49.90,
      interval: "month" as const,
      description: "Acompanhamento completo para resultados acelerados",
      priceId: "price_1JXYzZHGJMPptFbCvX9i0Qvt", // Exemplo - usar ID real do Stripe
      features: [
        "Todos os recursos do plano Básico",
        "Planos de treino diários personalizados",
        "Recomendações nutricionais detalhadas",
        "Análise de sono e recuperação",
        "Chat ilimitado com IA assistente",
        "Relatórios detalhados de progresso",
      ],
      recommended: true,
    },
    {
      title: "Plano Elite",
      price: 399.90,
      interval: "year" as const,
      description: "Economize 33% com o pagamento anual",
      priceId: "price_1JXYzZHGJMPptFbCvX9i0Qvu", // Exemplo - usar ID real do Stripe
      features: [
        "Todos os recursos do plano Pro",
        "Prioridade em novas funcionalidades",
        "Economia de 33% no valor anual",
        "Acesso antecipado a recursos beta",
        "Exportação de dados para análise externa",
      ],
      recommended: false,
    },
  ];
  
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Assinatura</h1>
      
      {/* Status da assinatura atual */}
      {subscription ? (
        <div className="bg-card p-6 rounded-lg shadow-sm mb-10">
          <h2 className="text-xl font-bold mb-4">Sua Assinatura</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${
                subscription.status === "active" || subscription.status === "trialing"
                  ? "text-green-500"
                  : "text-yellow-500"
              }`}>
                {subscription.status === "active" ? "Ativa" : 
                 subscription.status === "trialing" ? "Período de teste" : 
                 subscription.status === "canceled" ? "Cancelada" :
                 subscription.status === "past_due" ? "Pagamento pendente" : 
                 subscription.status}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Plano:</span>
              <span className="font-medium">
                {subscription.stripePriceId === "price_1JXYzZHGJMPptFbCvX9i0Qvs" ? "Básico" :
                 subscription.stripePriceId === "price_1JXYzZHGJMPptFbCvX9i0Qvt" ? "Pro" :
                 subscription.stripePriceId === "price_1JXYzZHGJMPptFbCvX9i0Qvu" ? "Elite" :
                 "Personalizado"}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Próxima cobrança:</span>
              <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
            </div>
            
            {subscription.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mt-4">
                <p className="text-yellow-800">
                  Sua assinatura está programada para ser cancelada após o período atual.
                  Você ainda terá acesso até {formatDate(subscription.currentPeriodEnd)}.
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={handleManageSubscription}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Gerenciar Assinatura
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted p-6 rounded-lg mb-10">
          <h2 className="text-xl font-bold mb-2">Sem assinatura ativa</h2>
          <p className="text-muted-foreground mb-4">
            Você ainda não possui uma assinatura. Escolha um dos planos abaixo para começar.
          </p>
        </div>
      )}
      
      {/* Planos de assinatura */}
      <h2 className="text-2xl font-bold mb-6">Planos Disponíveis</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {pricingPlans.map((plan, index) => (
          <PricingCard
            key={index}
            title={plan.title}
            price={plan.price}
            description={plan.description}
            features={plan.features}
            priceId={plan.priceId}
            recommended={plan.recommended}
            interval={plan.interval}
            currentPlan={
              subscription && 
              subscription.stripePriceId === plan.priceId &&
              (subscription.status === "active" || subscription.status === "trialing")
            }
          />
        ))}
      </div>
      
      {/* Histórico de pagamentos */}
      {paymentHistory && paymentHistory.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Histórico de Pagamentos</h2>
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3">Data</th>
                  <th className="pb-3">Valor</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">{formatDate(payment.date)}</td>
                    <td className="py-3">R$ {payment.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status === 'succeeded' ? 'Pago' : 
                         payment.status === 'failed' ? 'Falhou' :
                         payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}