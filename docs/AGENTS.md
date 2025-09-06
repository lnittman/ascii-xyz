# Documentation Agent System

This directory uses an agent-based documentation system where each subdirectory represents a specific role and mindset. Each AGENTS.md file contains metaprompts that guide the creation of role-specific documentation.

## Directory Roles

- **vision/** - Strategic CEO mindset for product philosophy
- **development/design/** - Design leadership perspective
- **development/product/** - Product management thinking
- **development/architecture/** - Senior architect patterns
- **development/intelligence/** - AI/ML strategy and approach

## How to Use

1. Navigate to any subdirectory
2. Read the AGENTS.md file for that role
3. Use the metaprompt to generate appropriate documentation
4. Focus on philosophy and principles, not implementation

## Core Principle

All documentation in this directory should be **technology-agnostic**. If you switched from React to Vue, from Next.js to SvelteKit, or from PostgreSQL to MongoDB, these docs should remain 100% valid.

## The Litmus Test

Before adding content, ask: "Would this still be true if we completely changed our tech stack?"

- ✅ YES → It belongs here
- ❌ NO → It belongs in technical documentation outside of docs/