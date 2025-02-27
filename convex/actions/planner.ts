import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { getUser } from "../auth";
import { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { Anthropic } from "@anthropic-ai/sdk";

// Gerar o primeiro plano diário para um usuário
export const generateFirstPlan = action({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Inicializa o cliente Anthropic
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    
    // Obtém os dados do usuário a partir do ID fornecido
    const user = await ctx.runQuery(internal.queries.users.getUserProfileById, {
      userId: args.userId as Id<"users">
    });
    
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    
    // Busca os dados de anamnese do usuário
    const anamneseData = await ctx.runQuery(internal.queries.anamnese.getUserAnamneseById, {
      userId: args.userId as Id<"users">
    });
    
    if (!anamneseData || anamneseData.length === 0) {
      throw new Error("Dados de anamnese não encontrados");
    }
    
    // Constrói os dados consolidados para enviar ao modelo
    const userData = {
      personal: {
        age: anamneseData.find(a => a.step === 1)?.age,
        height: anamneseData.find(a => a.step === 1)?.height,
        experienceLevel: anamneseData.find(a => a.step === 1)?.experienceLevel,
        primaryGoals: anamneseData.find(a => a.step === 1)?.primaryGoals,
        secondaryGoals: anamneseData.find(a => a.step === 1)?.secondaryGoals
      },
      training: {
        history: anamneseData.find(a => a.step === 2)?.trainingHistory,
        injuries: anamneseData.find(a => a.step === 2)?.previousInjuries,
        frequency: anamneseData.find(a => a.step === 2)?.currentTrainingFrequency
      },
      physical: {
        weight: anamneseData.find(a => a.step === 3)?.initialMeasurements?.weight,
        measurements: anamneseData.find(a => a.step === 3)?.initialMeasurements,
        posturalObservations: anamneseData.find(a => a.step === 3)?.posturalObservations
      },
      nutrition: {
        dietType: anamneseData.find(a => a.step === 4)?.dietType,
        foodAllergies: anamneseData.find(a => a.step === 4)?.foodAllergies,
        foodPreferences: anamneseData.find(a => a.step === 4)?.foodPreferences,
        mealsPerDay: anamneseData.find(a => a.step === 4)?.mealsPerDay,
        supplementsUsed: anamneseData.find(a => a.step === 4)?.supplementsUsed
      },
      lifestyle: {
        sleep: anamneseData.find(a => a.step === 5)?.sleepPatterns,
        stressLevels: anamneseData.find(a => a.step === 5)?.stressLevels,
        recoveryCapacity: anamneseData.find(a => a.step === 5)?.recoveryCapacity,
        occupation: anamneseData.find(a => a.step === 5)?.lifestyle?.occupation,
        activityLevel: anamneseData.find(a => a.step === 5)?.lifestyle?.activityLevel,
        workSchedule: anamneseData.find(a => a.step === 5)?.lifestyle?.workSchedule
      }
    };
    
    // Constrói o prompt para o Claude
    const prompt = `
      Você é um especialista em treinamento físico, nutrição e bem-estar. Vou fornecer a você dados de um usuário e você deve gerar um plano diário personalizado.
      
      # Dados do Usuário
      ${JSON.stringify(userData, null, 2)}
      
      # Sua Tarefa
      Gere um plano diário detalhado para o usuário incluindo:
      
      1. Um cronograma diário (horários e atividades)
      2. Um plano de treino específico (se for dia de treino)
      3. Recomendações nutricionais (refeições, macros, hidratação)
      4. Dicas de bem-estar
      
      # Formato de Resposta
      Sua resposta deve ser um objeto JSON no seguinte formato:
      
      \`\`\`json
      {
        "schedule": [
          {
            "time": "06:30",
            "activity": "Acordar e hidratação",
            "duration": 15,
            "details": "Beber 500ml de água com limão"
          },
          ...
        ],
        "workoutPlan": {
          "type": "Hipertrofia",
          "focusArea": "Pernas e Glúteos",
          "exercises": [
            {
              "name": "Agachamento",
              "sets": 4,
              "repsRange": "8-12",
              "restTime": 90,
              "notes": "Focar na forma e profundidade"
            },
            ...
          ],
          "warmup": "5-10 minutos de mobilidade articular e ativação dos músculos que serão trabalhados",
          "cooldown": "5 minutos de alongamento estático"
        },
        "nutritionPlan": {
          "totalCaloriesTarget": 2500,
          "macrosTarget": {
            "protein": 180,
            "carbs": 270,
            "fat": 75
          },
          "hydrationTarget": 3000,
          "mealSuggestions": [
            {
              "time": "07:00",
              "description": "Café da manhã",
              "options": [
                "Ovos mexidos com pão integral e abacate",
                "Smoothie proteico com frutas e aveia"
              ]
            },
            ...
          ]
        },
        "wellbeingTips": [
          "Faça pausas de 5 minutos a cada hora de trabalho",
          "Pratique respiração profunda antes de dormir",
          ...
        ]
      }
      \`\`\`
      
      Forneça apenas o JSON sem explicações adicionais.
    `;
    
    // Chama a API da Anthropic
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      temperature: 0.7,
      system: "Você é um assistente especializado em treinamento físico, nutrição e bem-estar, com foco em criar planos personalizados baseados em dados do usuário.",
      messages: [
        { role: "user", content: prompt }
      ]
    });
    
    // Parseia a resposta JSON
    try {
      // Extrai o JSON da resposta
      const responseText = message.content[0].text;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/```\n([\s\S]*?)\n```/) ||
                        [null, responseText];
      
      const planData = JSON.parse(jsonMatch[1]);
      
      // Salva o plano no banco de dados
      const today = new Date().toISOString().split('T')[0];
      
      const planId = await ctx.runMutation(internal.mutations.plans.createDailyPlan, {
        userId: args.userId as Id<"users">,
        date: today,
        schedule: planData.schedule,
        workoutPlan: planData.workoutPlan,
        nutritionPlan: planData.nutritionPlan,
        wellbeingTips: planData.wellbeingTips,
        completed: false,
        generatedBy: "system"
      });
      
      // Atualiza o estado de onboarding
      const onboardingState = await ctx.runQuery(internal.queries.users.getOnboardingState, {
        userId: args.userId as Id<"users">
      });
      
      if (onboardingState) {
        await ctx.runMutation(internal.mutations.users.updateOnboardingState, {
          onboardingId: onboardingState._id,
          completedSteps: [...onboardingState.completedSteps, "first-plan-generated"],
          nextStep: "track-first-workout",
          nextCollection: {
            type: "workout",
            dueDate: today
          }
        });
      }
      
      return {
        success: true,
        planId
      };
    } catch (error) {
      console.error("Erro ao processar resposta do Claude:", error);
      throw new Error("Erro ao gerar plano diário");
    }
  }
});

// Gerar um plano diário para o usuário atual
export const generateDailyPlan = action({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Implementação similar à função acima, mas para gerar planos diários regulares
    // Seria necessário incluir lógica para considerar os dados históricos e o progresso do usuário
    return { success: true };
  }
});

// Atualizar o status de um plano diário como completo
export const markPlanCompleted = mutation({
  args: { planId: v.id("dailyPlans"), completion: v.number() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    const plan = await ctx.db.get(args.planId);
    
    if (!plan) {
      throw new Error("Plano não encontrado");
    }
    
    if (plan.userId !== user._id) {
      throw new Error("Você não tem permissão para atualizar este plano");
    }
    
    await ctx.db.patch(args.planId, {
      completed: true
    });
    
    // Registra o feedback do plano
    await ctx.db.insert("feedbacks", {
      userId: user._id,
      date: new Date().toISOString(),
      relatedPlanId: args.planId,
      planCompletion: args.completion,
      generalFeedback: `Plano concluído com ${args.completion}% de execução`
    });
    
    return { success: true };
  }
});

// Buscar o plano diário atual do usuário
export const getCurrentPlan = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    const today = new Date().toISOString().split('T')[0];
    
    const plan = await ctx.db
      .query("dailyPlans")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .first();
    
    return plan;
  }
});

// Buscar histórico de planos do usuário
export const getPlanHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    let query = ctx.db
      .query("dailyPlans")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id))
      .order("desc");
    
    if (args.limit) {
      query = query.take(args.limit);
    } else {
      query = query.take(30); // Padrão: últimos 30 dias
    }
    
    return await query.collect();
  }
});