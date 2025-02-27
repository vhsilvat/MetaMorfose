"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Home() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  
  // Se estiver autenticado, redireciona para o dashboard
  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, router]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-6 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">MetaMorfose</h1>
          <div className="flex space-x-4">
            <Link
              href="/sign-in"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Entrar
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Sistema de Acompanhamento Holístico de Saúde e Desempenho Físico
            </h2>
            <p className="text-xl mb-10 text-muted-foreground">
              Acompanhamento integrado de treinos, nutrição, sono e bem-estar, com planos personalizados gerados por IA.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/sign-up"
                className="px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-medium"
              >
                Comece Agora
              </Link>
              <Link
                href="#features"
                className="px-6 py-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-lg font-medium"
              >
                Saiba Mais
              </Link>
            </div>
          </div>
        </section>
        
        <section id="features" className="py-16 px-6 bg-muted">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Funcionalidades Principais</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">Monitoramento Inteligente</h3>
                <p className="text-card-foreground">Acompanhe seus treinos, alimentação, sono e métricas físicas em um só lugar.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">Planos Personalizados</h3>
                <p className="text-card-foreground">Receba cronogramas diários adaptados ao seu perfil e objetivos.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">Dashboard Interativo</h3>
                <p className="text-card-foreground">Visualize seu progresso com gráficos claros e insights personalizados.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">Ajustes Contínuos</h3>
                <p className="text-card-foreground">Seu plano se adapta automaticamente com base nos seus resultados e feedback.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">IA Integrada</h3>
                <p className="text-card-foreground">Converse com um assistente inteligente para tirar dúvidas e receber dicas.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">Abordagem Holística</h3>
                <p className="text-card-foreground">Alcance seus objetivos através de uma visão completa da sua saúde e bem-estar.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 px-6 border-t">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} MetaMorfose. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}