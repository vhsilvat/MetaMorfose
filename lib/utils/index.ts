import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utilidade para combinar classes condicionalmente (usado pelo Shadcn UI)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatar data ISO para exibição amigável
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Formatar duração em minutos para formato legível
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// Calcular o índice de massa corporal (IMC)
export function calculateBMI(weight: number, heightCm: number): number {
  // Converte altura de cm para metros
  const heightM = heightCm / 100;
  
  // Calcula o IMC: peso (kg) / altura² (m)
  const bmi = weight / (heightM * heightM);
  
  // Retorna o valor arredondado para uma casa decimal
  return Math.round(bmi * 10) / 10;
}

// Obter classificação do IMC
export function getBMIClassification(bmi: number): string {
  if (bmi < 18.5) {
    return "Abaixo do peso";
  } else if (bmi < 25) {
    return "Peso normal";
  } else if (bmi < 30) {
    return "Sobrepeso";
  } else if (bmi < 35) {
    return "Obesidade Grau I";
  } else if (bmi < 40) {
    return "Obesidade Grau II";
  } else {
    return "Obesidade Grau III";
  }
}

// Formatar número com separador de milhares
export function formatNumber(number: number): string {
  return number.toLocaleString('pt-BR');
}

// Calcular percentual de progresso
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

// Verificar se uma data é hoje
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

// Verificar se uma data está no futuro
export function isFuture(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  
  return date > now;
}

// Verificar se uma data está no passado
export function isPast(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  
  return date < now;
}

// Obter a diferença de dias entre duas datas
export function getDaysDifference(date1: string, date2: string): number {
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  
  // Diferença em milissegundos
  const diffTime = Math.abs(secondDate.getTime() - firstDate.getTime());
  
  // Converter para dias
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}