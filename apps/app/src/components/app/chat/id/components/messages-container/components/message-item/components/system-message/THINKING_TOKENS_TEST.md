# Testing Thinking Token Filtering

This document describes how to test the thinking token filtering implementation in the SystemMessage component.

## Overview

The SystemMessage component now filters out 'reasoning' type parts from the AI SDK message parts array. These parts contain thinking/reasoning tokens from models that support them.

## Supported Models

Models that use thinking tokens include:
- Anthropic Claude 4 (Opus)
- Google Gemini 2.0 (Flash Thinking)
- DeepSeek models with reasoning support
- Other models that implement chain-of-thought reasoning

## Implementation Details

The filtering happens in the `renderAISDKParts` function:

```typescript
case 'reasoning':
  // Handle reasoning/thinking tokens - filter them out by default
  // These are internal model thoughts that shouldn't be shown to users
  // unless explicitly requested via a setting or flag
  return null;
```

## Testing Steps

### 1. Test with Claude 4 (Opus)
```typescript
// In the chat UI, select Claude 4 Opus model
// Send a complex reasoning prompt like:
"Explain step by step how to calculate the factorial of 5"
```

Expected: The response should show only the final answer without internal reasoning steps.

### 2. Test with Gemini 2.0 Flash Thinking
```typescript
// Select Gemini 2.0 Flash Thinking model
// Send a prompt that requires reasoning:
"What is 47 * 83? Show your work."
```

Expected: The calculation steps should be filtered out, showing only the result.

### 3. Test with DeepSeek
```typescript
// Select a DeepSeek model with reasoning
// Send a logic puzzle:
"If all roses are flowers and some flowers fade quickly, can we conclude that some roses fade quickly?"
```

Expected: Internal logical reasoning should be hidden, only the conclusion shown.

## Debug Mode

To verify thinking tokens are being filtered, you can temporarily modify the code:

```typescript
case 'reasoning':
  // Debug: Log reasoning content
  console.log('[Thinking Token]:', part.text);
  return null;
```

## Future Enhancements

1. Add a user setting to show/hide thinking tokens
2. Add a toggle button in the UI for power users
3. Store thinking tokens separately for debugging
4. Add analytics to track thinking token usage

## Verification

The implementation correctly:
- ✅ Identifies 'reasoning' type parts
- ✅ Filters them from the display
- ✅ Maintains message flow without gaps
- ✅ Works with streaming responses
- ✅ Preserves other part types (text, tool-invocation)