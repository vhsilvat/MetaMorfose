import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { Anthropic } from '@anthropic-ai/sdk';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// Inicializa o cliente Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Inicializa o cliente HTTP Convex
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    // Verifica autenticação
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Lê o corpo da requisição
    const { prompt, context } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Obtém dados do usuário para contextualizar a resposta
    const userProfile = await convex.query(api.queries.users.getUserProfile, {
      clerkId: userId
    });
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    // Constrói o contexto para o modelo
    const systemPrompt = `
      Você é um assistente especializado em saúde, fitness e bem-estar chamado Claude, integrado ao sistema MetaMorfose.
      
      O MetaMorfose é um sistema de acompanhamento holístico que monitora treinos, nutrição, sono e bem-estar geral, 
      fornecendo planos personalizados com base nos dados dos usuários.
      
      Suas respostas devem ser personalizadas com base no perfil e nos dados do usuário.
      
      Perfil do usuário:
      - Nome: ${userProfile.firstName || 'Usuário'} ${userProfile.lastName || ''}
      - Nível de anamnese completado: ${userProfile.anamneseLevel}/5
      - Anamnese completa: ${userProfile.isComplete ? 'Sim' : 'Não'}
      
      ${context ? `Contexto adicional: ${context}` : ''}
      
      Responda de maneira amigável, motivadora e educativa. Se o usuário tiver dúvidas sobre algo que você não tem dados suficientes,
      sugira-o a registrar essas informações no sistema. Quando fornecido contexto adicional com dados do usuário, use-o para
      personalizar sua resposta.
      
      Seja conciso e direto em suas respostas. Se o usuário tiver uma dúvida que requer informações adicionais sobre seu progresso
      específico, encorage-o a ver o dashboard do sistema para dados mais detalhados.
    `;
    
    // Chama a API da Anthropic
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    
    // Registra a interação (opcional)
    await convex.mutation(api.mutations.chat.recordChatInteraction, {
      prompt,
      response: message.content[0].text,
      timestamp: new Date().toISOString()
    });
    
    // Retorna a resposta do modelo
    return NextResponse.json({
      response: message.content[0].text,
      model: message.model,
      id: message.id
    });
    
  } catch (error: any) {
    console.error('Error calling Anthropic API:', error);
    
    return NextResponse.json(
      { error: error.message || 'Error processing request' },
      { status: 500 }
    );
  }
}