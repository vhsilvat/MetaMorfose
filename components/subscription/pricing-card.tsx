"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createCheckoutSession } from "@/lib/utils/stripe";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast/use-toast";

interface PricingCardProps {
  title: string;
  price: number;
  description: string;
  features: string[];
  priceId: string;
  recommended?: boolean;
  interval: "month" | "year";
  currentPlan?: boolean;
}

export function PricingCard({
  title,
  price,
  description,
  features,
  priceId,
  recommended = false,
  interval,
  currentPlan = false,
}: PricingCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      // Cria uma sessão de checkout do Stripe
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/settings/billing?success=true`,
          cancelUrl: `${window.location.origin}/settings/billing?canceled=true`,
        }),
      });

      const { url } = await response.json();

      // Redireciona para a página de checkout do Stripe
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Falha ao criar sessão de checkout");
      }
    } catch (error) {
      console.error("Erro ao iniciar checkout:", error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Ocorreu um problema ao iniciar o processo de pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-lg border ${
        recommended
          ? "border-primary shadow-lg"
          : "border-border shadow-sm"
      } p-6 flex flex-col h-full`}
    >
      {recommended && (
        <span className="inline-block px-3 py-1 text-xs font-medium text-primary-foreground bg-primary rounded-full mb-4 self-start">
          Recomendado
        </span>
      )}

      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 text-muted-foreground text-sm">{description}</p>

      <div className="mt-4 mb-6">
        <span className="text-3xl font-bold">{formatCurrency(price)}</span>
        <span className="text-muted-foreground">/{interval === "month" ? "mês" : "ano"}</span>
      </div>

      <ul className="space-y-3 flex-grow mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {currentPlan ? (
        <div className="mt-auto">
          <button
            className="w-full py-2 px-4 rounded-md bg-muted text-center cursor-not-allowed"
            disabled
          >
            Plano Atual
          </button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Gerencie sua assinatura nas configurações
          </p>
        </div>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md ${
            recommended
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
          } transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-auto`}
        >
          {loading ? "Processando..." : "Assinar"}
        </button>
      )}
    </div>
  );
}