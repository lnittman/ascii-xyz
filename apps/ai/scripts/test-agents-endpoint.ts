#!/usr/bin/env tsx

async function testEndpoints() {
  const API_URL = 'https://apps-ai.luke-nittmann.workers.dev';

  // Test health
  try {
    const health = await fetch(`${API_URL}/health`);
    const _healthData = await health.json();
  } catch (_error) {}

  // Test agents with error handling
  try {
    const agents = await fetch(`${API_URL}/api/agents`);
    const text = await agents.text();

    if (agents.ok && text) {
      try {
        const _json = JSON.parse(text);
      } catch (_e) {}
    }
  } catch (_error) {}

  // Test tools
  try {
    const tools = await fetch(`${API_URL}/api/tools`);
    const _toolsText = await tools.text();
  } catch (_error) {}
}

testEndpoints().catch(console.error);
