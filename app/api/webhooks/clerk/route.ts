import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// Inicializa o cliente HTTP Convex para chamar funções do backend
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  // Verifica se o webhook secret está configurado
  if (!process.env.CLERK_WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Obtém os headers para validação
  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  // Valida que todos os headers necessários estão presentes
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Obtém o corpo da requisição como texto
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Cria uma instância do Webhook para validar a assinatura
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verifica a assinatura
  try {
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }

  // Processa os eventos do Clerk
  const eventType = evt.type;

  // Trata eventos de usuário
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    // Obtém o email principal
    const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id)?.email_address;
    
    if (!primaryEmail) {
      return new Response('No primary email found', { status: 400 });
    }

    try {
      // Chama a mutation do Convex para criar/atualizar usuário
      await convex.mutation(api.auth.createOrUpdateUser, {
        clerkId: id,
        email: primaryEmail,
        firstName: first_name || undefined,
        lastName: last_name || undefined,
        imageUrl: image_url || undefined
      });

      return new Response('User created or updated successfully', { status: 200 });
    } catch (error) {
      console.error('Error syncing user to Convex:', error);
      return new Response('Error syncing user to Convex', { status: 500 });
    }
  }

  // Trata evento de deleção de usuário
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      // Chama a mutation do Convex para excluir o usuário
      await convex.mutation(api.auth.deleteUser, {
        clerkId: id
      });

      return new Response('User deleted successfully', { status: 200 });
    } catch (error) {
      console.error('Error deleting user from Convex:', error);
      return new Response('Error deleting user from Convex', { status: 500 });
    }
  }

  // Retorna OK para outros eventos
  return new Response('Webhook processed', { status: 200 });
}