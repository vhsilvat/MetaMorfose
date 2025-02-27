import { z } from "zod";

// Esquema de validação para a etapa 1 da anamnese
export const anamneseStep1Schema = z.object({
  age: z.number().min(16, "Você deve ter pelo menos 16 anos").max(100, "Idade inválida"),
  height: z.number().min(120, "Altura mínima de 120cm").max(220, "Altura máxima de 220cm"),
  primaryGoals: z.array(z.string()).min(1, "Selecione pelo menos um objetivo principal"),
  secondaryGoals: z.array(z.string()),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"], {
    invalid_type_error: "Selecione um nível de experiência",
  }),
});

// Tipo TypeScript para a etapa 1
export type AnamneseStep1 = z.infer<typeof anamneseStep1Schema>;

// Esquema de validação para a etapa 2 da anamnese
export const anamneseStep2Schema = z.object({
  trainingHistory: z.string().min(10, "Descreva um pouco do seu histórico de treino"),
  previousInjuries: z.array(
    z.object({
      bodyPart: z.string().min(2, "Especifique a parte do corpo"),
      description: z.string().min(5, "Descreva brevemente a lesão"),
      whenHappened: z.string().min(2, "Indique quando ocorreu"),
      isRecurrent: z.boolean(),
      affectsTraining: z.boolean(),
    })
  ),
  currentTrainingFrequency: z.number().min(0).max(7, "Frequência semanal inválida"),
});

// Tipo TypeScript para a etapa 2
export type AnamneseStep2 = z.infer<typeof anamneseStep2Schema>;

// Esquema de validação para a etapa 3 da anamnese
export const anamneseStep3Schema = z.object({
  posturalObservations: z.array(z.string()),
  initialMeasurements: z.object({
    weight: z.number().min(30, "Peso mínimo de 30kg").max(300, "Peso máximo de 300kg"),
    neck: z.number().optional(),
    chest: z.number().optional(),
    waist: z.number().optional(),
    hips: z.number().optional(),
    rightArm: z.number().optional(),
    leftArm: z.number().optional(),
    rightThigh: z.number().optional(),
    leftThigh: z.number().optional(),
    rightCalf: z.number().optional(),
    leftCalf: z.number().optional(),
  }),
});

// Tipo TypeScript para a etapa 3
export type AnamneseStep3 = z.infer<typeof anamneseStep3Schema>;

// Esquema de validação para a etapa 4 da anamnese
export const anamneseStep4Schema = z.object({
  dietType: z.string().min(2, "Selecione um tipo de dieta"),
  foodAllergies: z.array(z.string()),
  foodPreferences: z.object({
    likes: z.array(z.string()),
    dislikes: z.array(z.string()),
  }),
  mealsPerDay: z.number().min(1, "Mínimo de 1 refeição").max(10, "Máximo de 10 refeições"),
  supplementsUsed: z.array(z.string()),
});

// Tipo TypeScript para a etapa 4
export type AnamneseStep4 = z.infer<typeof anamneseStep4Schema>;

// Esquema de validação para a etapa 5 da anamnese
export const anamneseStep5Schema = z.object({
  sleepPatterns: z.object({
    averageDuration: z.number().min(3, "Mínimo de 3 horas").max(14, "Máximo de 14 horas"),
    qualityRating: z.number().min(1, "Mínimo de 1").max(10, "Máximo de 10"),
    bedtime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
    wakeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
    sleepChallenges: z.array(z.string()),
  }),
  stressLevels: z.number().min(1, "Mínimo de 1").max(10, "Máximo de 10"),
  recoveryCapacity: z.number().min(1, "Mínimo de 1").max(10, "Máximo de 10"),
  lifestyle: z.object({
    occupation: z.string().min(2, "Informe sua ocupação"),
    activityLevel: z.enum(["sedentary", "lightly active", "moderately active", "very active"], {
      invalid_type_error: "Selecione um nível de atividade",
    }),
    workSchedule: z.string().min(2, "Informe seu horário de trabalho"),
  }),
});

// Tipo TypeScript para a etapa 5
export type AnamneseStep5 = z.infer<typeof anamneseStep5Schema>;