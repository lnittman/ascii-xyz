/**
 * Export types from the oRPC router
 *
 * These types are automatically inferred from the router definition.
 * The router uses Zod schemas which provide both runtime validation
 * and compile-time type safety.
 */

// Re-export the router type
export type { Router as AppRouter } from './router';

// If we need specific input/output types, they should be inferred
// from the router itself. For now, we'll let TypeScript infer
// these types at the usage site through the oRPC client.

// The oRPC client will automatically provide type safety when calling
// procedures like:
// - client.projects.create({ name: "..." })
// - client.chats.update({ id: "...", name: "..." })
// etc.

// No need to manually define types - they're already defined in the router!
