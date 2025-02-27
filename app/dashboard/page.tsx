"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate, formatDuration, calculateBMI, getBMIClassification } from "@/lib/utils";

export default function DashboardPage() {
  const dashboardData = useQuery(api.queries.users.getUserDashboardData);
  
  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando dados do dashboard...</p>
      </div>
    );
  }
  
  const { user, latestMetrics, recentWorkouts, recentSleep, recentWellbeing, currentPlan } = dashboardData;
  
  // Se o usuário ainda não completou a anamnese
  if (!user.isComplete) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <h1 className="text-2xl font-bold mb-4">Complete sua anamnese</h1>
          <p className="mb-6">
            Para acessar todas as funcionalidades, complete o processo de anamnese.
            Você está na etapa {user.anamneseLevel + 1} de 5.
          </p>
          <a
            href={`/anamnese/step-${user.anamneseLevel + 1}`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Continuar Anamnese
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Olá, {user.firstName || "Usuário"}
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo do seu progresso e plano para hoje.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Métricas físicas recentes */}
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Métricas Atuais</h2>
          {latestMetrics ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Peso</span>
                <span className="font-medium">{latestMetrics.weight} kg</span>
              </div>
              {latestMetrics.bodyComposition && (
                <>
                  <div className="flex justify-between">
                    <span>Gordura Corporal</span>
                    <span className="font-medium">
                      {latestMetrics.bodyComposition.bodyFatPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Massa Magra</span>
                    <span className="font-medium">
                      {latestMetrics.bodyComposition.leanMass} kg
                    </span>
                  </div>
                </>
              )}
              <div className="pt-2 text-sm text-muted-foreground">
                Atualizado em {formatDate(latestMetrics.date)}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nenhuma métrica registrada ainda.
            </p>
          )}
        </div>
        
        {/* Resumo de treinos */}
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Treinos Recentes</h2>
          {recentWorkouts && recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.slice(0, 3).map((workout) => (
                <div key={workout._id} className="pb-2 border-b">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{formatDate(workout.date)}</span>
                    <span className="text-sm bg-muted px-2 py-1 rounded">
                      {workout.type}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    <span>{workout.exercises.length} exercícios</span>
                    <span className="mx-2">•</span>
                    <span>{formatDuration(workout.duration)}</span>
                  </div>
                </div>
              ))}
              {recentWorkouts.length > 3 && (
                <a href="/workouts" className="text-sm text-primary block text-center">
                  Ver todos os treinos
                </a>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nenhum treino registrado ainda.
            </p>
          )}
        </div>
        
        {/* Bem-estar recente */}
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Bem-estar</h2>
          {recentWellbeing && recentWellbeing.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Energia</span>
                <div className="w-32 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(recentWellbeing[0].energyLevel / 10) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Estresse</span>
                <div className="w-32 bg-muted rounded-full h-2">
                  <div
                    className="bg-destructive h-2 rounded-full"
                    style={{
                      width: `${(recentWellbeing[0].stressLevel / 10) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Humor</span>
                <span>{recentWellbeing[0].mood}</span>
              </div>
              <div className="pt-2 text-sm text-muted-foreground">
                Atualizado em {formatDate(recentWellbeing[0].date)}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nenhum dado de bem-estar registrado ainda.
            </p>
          )}
        </div>
      </div>
      
      {/* Plano diário */}
      <div className="bg-card p-6 rounded-lg shadow-sm mb-10">
        <h2 className="text-2xl font-bold mb-4">Seu plano para hoje</h2>
        {currentPlan ? (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Cronograma</h3>
              <div className="space-y-3">
                {currentPlan.schedule.map((item, index) => (
                  <div key={index} className="flex">
                    <div className="w-20 font-medium">{item.time}</div>
                    <div className="flex-1">
                      <div className="font-medium">{item.activity}</div>
                      {item.details && (
                        <div className="text-sm text-muted-foreground">
                          {item.details}
                        </div>
                      )}
                    </div>
                    <div className="w-20 text-right text-muted-foreground">
                      {formatDuration(item.duration)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {currentPlan.workoutPlan && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Treino</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between mb-3">
                    <div>
                      <span className="font-medium">{currentPlan.workoutPlan.type}</span>
                      <span className="mx-2">•</span>
                      <span>Foco: {currentPlan.workoutPlan.focusArea}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {currentPlan.workoutPlan.exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{exercise.name}</div>
                          {exercise.notes && (
                            <div className="text-sm text-muted-foreground">
                              {exercise.notes}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div>{exercise.sets} séries</div>
                          <div className="text-sm text-muted-foreground">
                            {exercise.repsRange} reps • {formatDuration(exercise.restTime / 60)} descanso
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {currentPlan.nutritionPlan && (
              <div>
                <h3 className="text-lg font-medium mb-3">Nutrição</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-sm text-muted-foreground">Calorias</div>
                      <div className="font-bold text-lg">
                        {currentPlan.nutritionPlan.totalCaloriesTarget}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-sm text-muted-foreground">Proteínas</div>
                      <div className="font-bold text-lg">
                        {currentPlan.nutritionPlan.macrosTarget.protein}g
                      </div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-sm text-muted-foreground">Hidratação</div>
                      <div className="font-bold text-lg">
                        {currentPlan.nutritionPlan.hydrationTarget / 1000}L
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {currentPlan.nutritionPlan.mealSuggestions.map((meal, index) => (
                      <div key={index} className="flex">
                        <div className="w-16 font-medium">{meal.time}</div>
                        <div className="flex-1">
                          <div className="font-medium">{meal.description}</div>
                          <div className="text-sm mt-1">
                            {meal.options.slice(0, 2).join(" ou ")}
                            {meal.options.length > 2 && "..."}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-muted p-6 rounded-lg">
            <p className="mb-4">
              Você ainda não tem um plano para hoje. Gere seu primeiro plano diário!
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Gerar Plano Diário
            </button>
          </div>
        )}
      </div>
    </div>
  );
}