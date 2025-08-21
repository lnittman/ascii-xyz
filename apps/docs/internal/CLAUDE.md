# Claude Guide to Arbor Documentation

Welcome! This is the centralized documentation repository for the Arbor platform, optimized for AI assistants.

## 📚 Documentation Philosophy

This documentation follows a **domain-agnostic structure** that can be applied to any project:
- **Single-word directories** (snake_case when needed)
- **Kebab-case filenames** (lowercase with hyphens)
- **Maximum 3 levels of nesting**
- **Clear INDEX.md files** at each level for navigation

## 🗂️ Directory Structure

```
docs/
├── guides/              # How-to guides and tutorials
├── reference/           # Technical specifications
├── concepts/            # High-level explanations
├── operations/          # Operational procedures
├── planning/            # Future plans and roadmap
├── archive/             # Historical documentation
└── meta/                # Documentation about docs
```

## 🔍 Finding Information

### Quick Navigation
1. **Start with INDEX.md** in the directory you're interested in
2. **Check README.md** at the root for overview
3. **Browse category indexes** for specific topics

### Key Documents by Task

#### Understanding Arbor
- [System Overview](./reference/architecture/system-overview.md)
- [Platform Architecture](./reference/architecture/platform-overview.md)
- [Current Priorities](./planning/current-priorities.md)

#### Development
- [Getting Started](./guides/development/getting-started.md)
- [Development Setup](./guides/development/development-setup.md)
- [API Reference](./reference/api/endpoints.md)

#### Deployment
- [Deployment Guide](./guides/deployment/deployment.md)
- [Deployment Summary](./guides/deployment/deployment-summary.md)

#### Architecture
- [Architecture Overview](./reference/architecture/index.md)
- [Data Flow](./reference/architecture/data-flow-diagrams.md)
- [Tech Decisions](./reference/architecture/decision-records/)

## 📝 Documentation Standards

### File Naming
- **Directories**: `lowercase` or `snake_case`
- **Files**: `kebab-case.md`
- **Special files**: `UPPERCASE.md` (README, INDEX, CLAUDE)

### Content Structure
1. **Clear headings** with proper hierarchy
2. **Code examples** with language tags
3. **Links** to related documents
4. **Metadata** at document top when relevant

### Writing Style
- **Concise** - Get to the point
- **Examples** - Show, don't just tell
- **Context** - Link to related docs
- **Updates** - Keep current with codebase

## 🤖 AI-Optimized Features

### Structured for LLMs
- Consistent naming conventions
- Shallow directory structure
- Clear categorization
- Self-documenting organization

### Navigation Helpers
- INDEX.md files provide overviews
- Cross-references between related docs
- Clear section purposes
- Temporal organization for archives

### Context Windows
- Documents sized for reasonable chunks
- Related content grouped together
- Important info near document tops
- Summary sections for long documents

## 🔧 Working with Docs

### Finding Latest Info
1. Check main categories first
2. Look in planning/ for upcoming changes
3. Git history for historical context
4. Operations/state/ has current status

### Understanding Changes
- Git history shows documentation evolution
- Git commits preserve point-in-time states
- MIGRATION-SUMMARY.md explains recent changes

### Adding Documentation
1. Choose appropriate category
2. Follow naming conventions
3. Update relevant INDEX.md
4. Link from related documents

## 📍 Quick Links

### For New Contributors
- [Getting Started](./guides/development/getting-started.md)
- [Development Setup](./guides/development/development-setup.md)
- [Architecture Overview](./reference/architecture/system-overview.md)

### For Operators
- [Deployment Guide](./guides/deployment/deployment.md)
- [Operations Procedures](./operations/index.md)
- [Monitoring Setup](./operations/monitoring/)

### For Architects
- [System Design](./reference/architecture/)
- [Tech Decisions](./reference/architecture/decision-records/)
- [Future Plans](./planning/roadmap.md)

## 🏗️ Repository Context

This documentation is part of the arbor-xyz monorepo and covers:
- **arbor-xyz**: Main web platform (current directory)
  - **apps/app**: Main web application
  - **apps/ai**: AI service (Mastra)
  - **apps/api**: API service
  - **apps/daemon**: Desktop daemon
  - **docs/**: This documentation
- **arbor-apple**: iOS application (separate repo)

Each app/directory has CLAUDE.md files for specific guidance.

## 💡 Tips for Claude/AI Assistants

1. **Start with INDEX.md** files for overviews
2. **Check multiple related files** for full context
3. **Use archive/** for historical decisions
4. **Reference planning/** for future direction
5. **Cross-check with main repo CLAUDE.md files**

Remember: This structure is designed to be intuitive and efficient for both humans and AI. When in doubt, follow the established patterns.