import type { WebhookEvent } from '@clerk/backend';
import { httpRouter } from 'convex/server';
import { Webhook } from 'svix';
import { internal } from './_generated/api';
import { httpAction } from './_generated/server';

const http = httpRouter();

// Clerk webhook handler for user sync
http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response('Error occurred', { status: 400 });
    }
    
    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await ctx.runMutation(internal.functions.internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;

      case 'user.deleted': {
        const data = (event as unknown as { data?: { id?: string } }).data;
        const clerkUserId = data?.id;
        if (!clerkUserId) {
          break;
        }
        await ctx.runMutation(internal.functions.internal.users.deleteFromClerk, {
          clerkUserId,
        });
        break;
      }
      
      default:
        // Ignored event type
        }

    return new Response(null, { status: 200 });
  }),
});

// Validate Clerk webhook signature
async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return null;
  }
  const svixHeaders = {
    'svix-id': svixId,
    'svix-timestamp': svixTimestamp,
    'svix-signature': svixSignature,
  } as const;
  
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return null;
  }
  
  const wh = new Webhook(webhookSecret);
  
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch {
    return null;
  }
}

export default http;
