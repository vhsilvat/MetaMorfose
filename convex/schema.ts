import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users (sincronizado com Clerk)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    anamneseLevel: v.number(), // 0-5, indicando progresso da anamnese
    registeredAt: v.string(), // ISO date string
    lastActiveAt: v.optional(v.string()),
    isComplete: v.boolean(), // indica se a anamnese está completa
    stripeCustomerId: v.optional(v.string()), // ID do cliente no Stripe
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Anamnese (5 etapas progressivas)
  anamnese: defineTable({
    userId: v.id("users"),
    step: v.number(), // 1-5
    completedAt: v.optional(v.string()), // ISO date string
    
    // Etapa 1: Dados essenciais
    age: v.optional(v.number()),
    height: v.optional(v.number()), // em cm
    primaryGoals: v.optional(v.array(v.string())),
    secondaryGoals: v.optional(v.array(v.string())),
    experienceLevel: v.optional(v.string()), // beginner, intermediate, advanced
    
    // Etapa 2: Histórico de treino e lesões
    trainingHistory: v.optional(v.string()),
    previousInjuries: v.optional(v.array(v.object({
      bodyPart: v.string(),
      description: v.string(),
      whenHappened: v.string(),
      isRecurrent: v.boolean(),
      affectsTraining: v.boolean()
    }))),
    currentTrainingFrequency: v.optional(v.number()),
    
    // Etapa 3: Avaliações posturais e medidas
    posturalObservations: v.optional(v.array(v.string())),
    initialMeasurements: v.optional(v.object({
      weight: v.number(),
      neck: v.optional(v.number()),
      chest: v.optional(v.number()),
      waist: v.optional(v.number()),
      hips: v.optional(v.number()),
      rightArm: v.optional(v.number()),
      leftArm: v.optional(v.number()),
      rightThigh: v.optional(v.number()),
      leftThigh: v.optional(v.number()),
      rightCalf: v.optional(v.number()),
      leftCalf: v.optional(v.number())
    })),
    
    // Etapa 4: Preferências nutricionais
    dietType: v.optional(v.string()), // omnivore, vegetarian, vegan, etc.
    foodAllergies: v.optional(v.array(v.string())),
    foodPreferences: v.optional(v.object({
      likes: v.array(v.string()),
      dislikes: v.array(v.string())
    })),
    mealsPerDay: v.optional(v.number()),
    supplementsUsed: v.optional(v.array(v.string())),
    
    // Etapa 5: Ajustes finos
    sleepPatterns: v.optional(v.object({
      averageDuration: v.number(),
      qualityRating: v.number(), // 1-10
      bedtime: v.string(),
      wakeTime: v.string(),
      sleepChallenges: v.array(v.string())
    })),
    stressLevels: v.optional(v.number()), // 1-10
    recoveryCapacity: v.optional(v.number()), // 1-10
    lifestyle: v.optional(v.object({
      occupation: v.string(),
      activityLevel: v.string(), // sedentary, lightly active, moderately active, very active
      workSchedule: v.string()
    }))
  })
    .index("by_user_and_step", ["userId", "step"]),

  // Workouts
  workouts: defineTable({
    userId: v.id("users"),
    date: v.string(), // ISO date string
    type: v.string(), // strength, cardio, flexibility, etc.
    duration: v.number(), // em minutos
    perceivedEffort: v.number(), // 1-10
    notes: v.optional(v.string()),
    plannedWorkoutId: v.optional(v.id("dailyPlans")), // ID do treino planejado associado
    exercises: v.array(v.object({
      name: v.string(),
      sets: v.array(v.object({
        weight: v.optional(v.number()),
        reps: v.number(),
        rpe: v.optional(v.number()), // Rate of Perceived Exertion 1-10
        restTime: v.optional(v.number()) // em segundos
      })),
      notes: v.optional(v.string())
    }))
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_planned_workout", ["plannedWorkoutId"]),

  // Nutrition
  nutrition: defineTable({
    userId: v.id("users"),
    date: v.string(), // ISO date string
    totalCalories: v.optional(v.number()),
    macros: v.optional(v.object({
      protein: v.number(), // em gramas
      carbs: v.number(),
      fat: v.number()
    })),
    hydration: v.optional(v.number()), // em ml
    meals: v.array(v.object({
      time: v.string(), // formato HH:MM
      description: v.string(),
      foods: v.array(v.object({
        name: v.string(),
        portion: v.string(), // ex: "100g", "1 scoop"
        calories: v.optional(v.number()),
        protein: v.optional(v.number()),
        carbs: v.optional(v.number()),
        fat: v.optional(v.number())
      }))
    })),
    supplements: v.optional(v.array(v.object({
      name: v.string(),
      dosage: v.string(),
      timeConsumed: v.string()
    }))),
    notes: v.optional(v.string())
  })
    .index("by_user_date", ["userId", "date"]),

  // Physical Metrics
  physicalMetrics: defineTable({
    userId: v.id("users"),
    date: v.string(), // ISO date string
    weight: v.number(), // em kg
    bodyMeasurements: v.optional(v.object({
      neck: v.optional(v.number()),
      chest: v.optional(v.number()),
      waist: v.optional(v.number()),
      hips: v.optional(v.number()),
      rightArm: v.optional(v.number()),
      leftArm: v.optional(v.number()),
      rightThigh: v.optional(v.number()),
      leftThigh: v.optional(v.number()),
      rightCalf: v.optional(v.number()),
      leftCalf: v.optional(v.number())
    })),
    bodyComposition: v.optional(v.object({
      bodyFatPercentage: v.number(),
      leanMass: v.number(), // em kg
      fatMass: v.number() // em kg
    })),
    notes: v.optional(v.string())
  })
    .index("by_user_date", ["userId", "date"]),

  // Sleep Data
  sleepData: defineTable({
    userId: v.id("users"),
    date: v.string(), // ISO date string
    duration: v.number(), // em minutos
    quality: v.number(), // 1-10
    bedTime: v.string(), // formato HH:MM
    wakeTime: v.string(), // formato HH:MM
    interruptions: v.optional(v.number()),
    deepSleepPercent: v.optional(v.number()),
    remSleepPercent: v.optional(v.number()),
    notes: v.optional(v.string())
  })
    .index("by_user_date", ["userId", "date"]),

  // Wellbeing
  wellbeing: defineTable({
    userId: v.id("users"),
    date: v.string(), // ISO date string
    energyLevel: v.number(), // 1-10
    stressLevel: v.number(), // 1-10
    mood: v.string(), // ex: "good", "excellent", "low"
    pain: v.optional(v.array(v.object({
      bodyPart: v.string(),
      intensity: v.number(), // 1-10
      description: v.string()
    }))),
    generalNotes: v.optional(v.string())
  })
    .index("by_user_date", ["userId", "date"]),

  // Daily Plans (gerados pela IA)
  dailyPlans: defineTable({
    userId: v.id("users"),
    date: v.string(), // ISO date string
    schedule: v.array(v.object({
      time: v.string(), // formato HH:MM
      activity: v.string(),
      duration: v.number(), // em minutos
      details: v.optional(v.string())
    })),
    workoutPlan: v.optional(v.object({
      type: v.string(),
      focusArea: v.string(),
      exercises: v.array(v.object({
        name: v.string(),
        sets: v.number(),
        repsRange: v.string(), // ex: "8-12"
        restTime: v.number(), // em segundos
        notes: v.optional(v.string())
      })),
      warmup: v.optional(v.string()),
      cooldown: v.optional(v.string())
    })),
    nutritionPlan: v.optional(v.object({
      totalCaloriesTarget: v.number(),
      macrosTarget: v.object({
        protein: v.number(), // em gramas
        carbs: v.number(),
        fat: v.number()
      }),
      hydrationTarget: v.number(), // em ml
      mealSuggestions: v.array(v.object({
        time: v.string(),
        description: v.string(),
        options: v.array(v.string())
      }))
    })),
    wellbeingTips: v.optional(v.array(v.string())),
    completed: v.boolean(),
    generatedBy: v.string() // "system", "user", "coach"
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_completed", ["userId", "completed"]),

  // Feedbacks
  feedbacks: defineTable({
    userId: v.id("users"),
    date: v.string(), // ISO date string
    relatedPlanId: v.optional(v.id("dailyPlans")),
    planCompletion: v.number(), // 0-100%
    workoutFeedback: v.optional(v.object({
      difficulty: v.number(), // 1-10
      enjoyment: v.number(), // 1-10
      effectiveness: v.number(), // 1-10
      comments: v.optional(v.string())
    })),
    nutritionFeedback: v.optional(v.object({
      adherence: v.number(), // 1-10
      satisfaction: v.number(), // 1-10
      challenges: v.optional(v.array(v.string())),
      comments: v.optional(v.string())
    })),
    generalFeedback: v.optional(v.string())
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_related_plan", ["relatedPlanId"]),

  // User Progress
  userProgress: defineTable({
    userId: v.id("users"),
    unlockedFeatures: v.array(v.string()),
    achievements: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      achievedAt: v.string() // ISO date string
    })),
    weeklyStreak: v.number(),
    completedWorkouts: v.number(),
    totalTrainingTime: v.number(), // em minutos
    level: v.number() // nível do usuário no sistema
  })
    .index("by_user", ["userId"]),

  // Onboarding State
  onboardingState: defineTable({
    userId: v.id("users"),
    completedSteps: v.array(v.string()),
    nextStep: v.string(),
    scheduledReminders: v.array(v.object({
      type: v.string(), // "anamnese", "measurement", "feedback"
      date: v.string(), // ISO date string
      sent: v.boolean()
    })),
    nextCollection: v.optional(v.object({
      type: v.string(),
      dueDate: v.string() // ISO date string
    }))
  })
    .index("by_user", ["userId"])
    .index("by_reminders", ["scheduledReminders", "sent"]),
    
  // Chat Messages (histórico de conversas com a IA)
  chatMessages: defineTable({
    userId: v.id("users"),
    timestamp: v.string(), // ISO date string
    prompt: v.string(),
    response: v.string(),
    context: v.optional(v.string()), // Contexto adicional fornecido à IA
    modelId: v.optional(v.string()) // Identificador do modelo usado
  })
    .index("by_user_time", ["userId", "timestamp"]),
    
  // Subscriptions (assinaturas do Stripe)
  subscriptions: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.string(), // active, canceled, past_due, etc.
    currentPeriodEnd: v.string(), // ISO date string
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.string(), // ISO date string
    updatedAt: v.string(), // ISO date string
    lastPaymentStatus: v.optional(v.string()),
    lastPaymentDate: v.optional(v.string()),
    paymentHistory: v.array(v.object({
      invoiceId: v.string(),
      status: v.string(),
      amount: v.number(),
      date: v.string() // ISO date string
    }))
  })
    .index("by_user", ["userId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"])
    .index("by_stripe_customer", ["stripeCustomerId"]),
});