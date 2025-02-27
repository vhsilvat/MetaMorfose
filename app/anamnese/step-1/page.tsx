"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { anamneseStep1Schema, AnamneseStep1 } from "@/lib/validations/anamnese";
import { useToast } from "@/components/ui/toast/use-toast";

export default function AnamneseStep1() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [submitting, setSubmitting] = useState(false);
  
  const submitAnamneseStep1 = useMutation(api.actions.anamnese.submitAnamneseStep1);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AnamneseStep1>({
    resolver: zodResolver(anamneseStep1Schema),
    defaultValues: {
      age: undefined,
      height: undefined,
      primaryGoals: [],
      secondaryGoals: [],
      experienceLevel: "beginner",
    },
  });
  
  // Opções de objetivos
  const goalOptions = [
    { value: "hypertrophy", label: "Ganho de massa muscular (hipertrofia)" },
    { value: "strength", label: "Aumento de força" },
    { value: "endurance", label: "Melhora da resistência" },
    { value: "weightLoss", label: "Perda de peso" },
    { value: "health", label: "Melhora da saúde geral" },
    { value: "posture", label: "Correção postural" },
    { value: "flexibility", label: "Aumento da flexibilidade" },
    { value: "athletic", label: "Performance atlética" },
  ];
  
  // Opções de nível de experiência
  const experienceLevelOptions = [
    { value: "beginner", label: "Iniciante (menos de 1 ano)" },
    { value: "intermediate", label: "Intermediário (1-3 anos)" },
    { value: "advanced", label: "Avançado (mais de 3 anos)" },
  ];
  
  // Watcher para os objetivos selecionados
  const primaryGoals = watch("primaryGoals");
  const secondaryGoals = watch("secondaryGoals");
  
  // Toggle para seleção de objetivos primários
  const togglePrimaryGoal = (value: string) => {
    const currentGoals = [...primaryGoals];
    
    if (currentGoals.includes(value)) {
      setValue(
        "primaryGoals",
        currentGoals.filter((goal) => goal !== value)
      );
    } else {
      // Remover dos objetivos secundários se existir lá
      if (secondaryGoals.includes(value)) {
        setValue(
          "secondaryGoals",
          secondaryGoals.filter((goal) => goal !== value)
        );
      }
      setValue("primaryGoals", [...currentGoals, value]);
    }
  };
  
  // Toggle para seleção de objetivos secundários
  const toggleSecondaryGoal = (value: string) => {
    const currentGoals = [...secondaryGoals];
    
    if (currentGoals.includes(value)) {
      setValue(
        "secondaryGoals",
        currentGoals.filter((goal) => goal !== value)
      );
    } else {
      // Remover dos objetivos primários se existir lá
      if (primaryGoals.includes(value)) {
        setValue(
          "primaryGoals",
          primaryGoals.filter((goal) => goal !== value)
        );
      }
      setValue("secondaryGoals", [...currentGoals, value]);
    }
  };
  
  const onSubmit = async (data: AnamneseStep1) => {
    if (!isAuthenticated) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar autenticado para continuar.",
        variant: "destructive",
      });
      router.push("/sign-in");
      return;
    }
    
    setSubmitting(true);
    
    try {
      await submitAnamneseStep1(data);
      
      toast({
        title: "Etapa 1 concluída!",
        description: "Seus dados básicos foram salvos com sucesso.",
        variant: "success",
      });
      
      // Redireciona para o dashboard ou próxima etapa
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast({
        title: "Erro ao salvar dados",
        description: "Ocorreu um erro ao salvar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vamos começar a conhecer você</h1>
        <p className="text-muted-foreground">
          Esta é a primeira etapa da sua anamnese. Preencha os dados abaixo para que possamos
          entender melhor seu perfil e objetivos.
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="age" className="block font-medium">
                Idade
              </label>
              <input
                id="age"
                type="number"
                {...register("age", { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Sua idade"
              />
              {errors.age && (
                <p className="text-sm text-red-500">{errors.age.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="height" className="block font-medium">
                Altura (cm)
              </label>
              <input
                id="height"
                type="number"
                {...register("height", { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Sua altura em centímetros"
              />
              {errors.height && (
                <p className="text-sm text-red-500">{errors.height.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block font-medium">
              Objetivos Principais (selecione de 1 a 3)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {goalOptions.map((goal) => (
                <div
                  key={goal.value}
                  className={`p-3 border rounded-md cursor-pointer ${
                    primaryGoals.includes(goal.value)
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }`}
                  onClick={() => togglePrimaryGoal(goal.value)}
                >
                  {goal.label}
                </div>
              ))}
            </div>
            {errors.primaryGoals && (
              <p className="text-sm text-red-500">
                {errors.primaryGoals.message}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <label className="block font-medium">
              Objetivos Secundários (opcional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {goalOptions.map((goal) => (
                <div
                  key={goal.value}
                  className={`p-3 border rounded-md cursor-pointer ${
                    secondaryGoals.includes(goal.value)
                      ? "bg-secondary text-secondary-foreground"
                      : ""
                  }`}
                  onClick={() => toggleSecondaryGoal(goal.value)}
                >
                  {goal.label}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium">
              Nível de experiência com treinamento
            </label>
            <div className="space-y-2">
              {experienceLevelOptions.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={option.value}
                    value={option.value}
                    {...register("experienceLevel")}
                    className="mr-2"
                  />
                  <label htmlFor={option.value}>{option.label}</label>
                </div>
              ))}
            </div>
            {errors.experienceLevel && (
              <p className="text-sm text-red-500">
                {errors.experienceLevel.message}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </form>
    </div>
  );
}