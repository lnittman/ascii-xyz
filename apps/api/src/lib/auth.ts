import { type KeyLike, createRemoteJWKSet, importJWK, jwtVerify } from 'jose';
import type { Env } from '../index';

export async function verifyAuth(
  authHeader: string | undefined,
  env: Env
): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const issuer = env.CLERK_JWT_ISSUER || env.CLERK_ISSUER;
    const jwksUrl = issuer
      ? `${issuer.replace(/\/$/, '')}/.well-known/jwks.json`
      : undefined;

    let key: KeyLike | ReturnType<typeof createRemoteJWKSet> | undefined;
    if (jwksUrl) {
      key = createRemoteJWKSet(new URL(jwksUrl));
    } else if (env.CLERK_JWT_PUBLIC_KEY || env.CLERK_PEM_PUBLIC_KEY) {
      key = await importJWK(
        {
          kty: 'RSA',
          use: 'sig',
          alg: 'RS256',
          n: env.CLERK_JWT_PUBLIC_KEY || env.CLERK_PEM_PUBLIC_KEY,
        },
        'RS256'
      ).catch(() => undefined);
    }

    const { payload } = await jwtVerify(
      token,
      key as any,
      issuer ? { issuer } : {}
    );
    const clerkId = (payload.sub as string) || (payload.sub as string) || null;
    return clerkId ?? null;
  } catch (_err) {
    return null;
  }
}

export async function authFromRequest(
  req: Request,
  env: Env
): Promise<{ userId: string | null }> {
  const header = req.headers.get('Authorization') || undefined;
  const userId = await verifyAuth(header, env);
  return { userId };
}
