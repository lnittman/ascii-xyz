# MCP Tool Instructions

This directory contains XML instruction files for MCP (Model Context Protocol) tools that are dynamically injected into agent prompts.

## Current Tools

- **firecrawl.xml** - Web scraping and search capabilities
- **gmail.xml** - Email management and contact operations  
- **github.xml** - GitHub repository and issue management

## How It Works

1. XML files in this directory define tool schemas and usage instructions
2. The `instructions.xml` files in agent directories include these XML files using `<include>` tags
3. The `loadPrompt` utility processes these includes and injects the tool definitions into agent prompts
4. Agents can then use these tools according to the instructions and schemas defined

## Adding New Tools

Use the provided script to add new MCP tools:

```bash
node scripts/add-mcp-tool.js <tool-name>
```

This will:
1. Create a new XML template file
2. Add the include statement to the chat agent instructions
3. Provide next steps for implementation

## XML Structure

Each tool XML file should follow this structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<tool_instructions>
  <tools>
    <tool>
      <name>tool.action_name</name>
      <description>What this tool does</description>
      <usage>When to use this tool</usage>
      <parameters>
        <parameter name="param_name" type="string" required="true">Parameter description</parameter>
      </parameters>
      <example>
        <request>
          {
            "name": "tool.action_name",
            "arguments": {
              "param_name": "example_value"
            }
          }
        </request>
      </example>
    </tool>
  </tools>
</tool_instructions>
```

## Benefits

- **Modularity**: Tools can be added/removed independently
- **Reusability**: Same tool definitions can be shared across multiple agents
- **Maintainability**: Tool instructions are separate from agent logic
- **Build Safety**: XML files are outside the src directory so they don't interfere with builds 