"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/toast/use-toast";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const userProfile = useQuery(api.queries.users.getCurrentUserProfile);
  const updateProfile = useMutation(api.mutations.users.updateUserProfile);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Preenche o formulário quando os dados do usuário são carregados
  useState(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
    }
  });
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      await updateProfile({
        firstName,
        lastName
      });
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Configurações</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Menu lateral */}
        <div className="space-y-2">
          <button 
            className="w-full text-left py-2 px-4 rounded-md bg-primary text-primary-foreground"
          >
            Perfil
          </button>
          <button 
            onClick={() => router.push("/settings/billing")}
            className="w-full text-left py-2 px-4 rounded-md hover:bg-accent"
          >
            Assinatura
          </button>
          <button 
            className="w-full text-left py-2 px-4 rounded-md hover:bg-accent"
          >
            Notificações
          </button>
          <button 
            className="w-full text-left py-2 px-4 rounded-md hover:bg-accent"
          >
            Privacidade
          </button>
        </div>
        
        {/* Conteúdo principal */}
        <div className="md:col-span-3 space-y-8">
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Seu Perfil</h2>
            
            <div className="flex items-center mb-6">
              <div className="mr-4">
                <UserButton />
              </div>
              <div>
                <p className="font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                <p className="text-muted-foreground">{userProfile.email}</p>
              </div>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Sobrenome</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={userProfile.email}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Gerencie seu email e senha nas configurações do Clerk
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Métricas Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1">Idade</label>
                <div className="px-3 py-2 border rounded-md bg-muted">
                  {userProfile.progress?.age || "Não informado"}
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Altura</label>
                <div className="px-3 py-2 border rounded-md bg-muted">
                  {userProfile.progress?.height ? `${userProfile.progress.height} cm` : "Não informado"}
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Nível de Experiência</label>
                <div className="px-3 py-2 border rounded-md bg-muted">
                  {userProfile.progress?.experienceLevel === "beginner" ? "Iniciante" :
                   userProfile.progress?.experienceLevel === "intermediate" ? "Intermediário" :
                   userProfile.progress?.experienceLevel === "advanced" ? "Avançado" :
                   "Não informado"}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Para atualizar suas métricas básicas, complete ou atualize sua anamnese
              </p>
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Gerenciar Conta</h2>
            
            <button
              onClick={() => router.push("/settings/billing")}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 mr-4"
            >
              Gerenciar Assinatura
            </button>
            
            <button
              className="px-4 py-2 border border-destructive text-destructive rounded-md hover:bg-destructive/10"
            >
              Excluir Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}