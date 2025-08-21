export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize SSR client for server-side oRPC calls
    await import('./src/lib/orpc.server');
  }
}
