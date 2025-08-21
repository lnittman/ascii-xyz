# agent 2: output systems engineer
*"artifacts that evolve with collaboration"*

## scope

this agent enhances the output system to support full versioning, collaborative features, and export capabilities. outputs should feel like living documents that can be refined, shared, and exported seamlessly - similar to claude artifacts but with arbor's engineering-first polish.

## packages to modify

- `apps/app` - output components, version history ui, export features
- `packages/api/services/output.ts` - versioning logic, diff generation
- `packages/database/prisma/schema.prisma` - already has OutputVersion model
- `apps/ai/src/mastra/tools/output/` - enhance output creation tool

## implementation details

### 1. version management system

#### a. automatic versioning on edit
```typescript
// packages/api/services/output.ts
export class OutputService {
  async updateOutput(
    outputId: string,
    content: string,
    userId: string
  ) {
    // get current output
    const current = await this.getById(outputId);
    
    // create new version if content changed
    if (current.content !== content) {
      // save current as version
      const lastVersion = await database.outputVersion.findFirst({
        where: { outputId },
        orderBy: { version: 'desc' }
      });
      
      await database.outputVersion.create({
        data: {
          outputId,
          content: current.content,
          metadata: current.metadata,
          version: (lastVersion?.version || 0) + 1
        }
      });
      
      // update output with new content
      await database.output.update({
        where: { id: outputId },
        data: { content, updatedAt: new Date() }
      });
    }
    
    return this.getById(outputId);
  }
}
```

#### b. version history ui
```typescript
// apps/app/src/components/output/OutputVersionHistory.tsx
export function OutputVersionHistory({ outputId }: { outputId: string }) {
  const { versions, currentVersion } = useOutputVersions(outputId);
  const [comparing, setComparing] = useState<number[]>([]);
  
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        version history ({versions.length} versions)
      </div>
      
      {versions.map((version) => (
        <div 
          key={version.id}
          className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded"
        >
          <input
            type="checkbox"
            checked={comparing.includes(version.version)}
            onChange={(e) => {
              if (e.target.checked) {
                setComparing([...comparing, version.version].slice(-2));
              } else {
                setComparing(comparing.filter(v => v !== version.version));
              }
            }}
          />
          
          <button
            onClick={() => restoreVersion(outputId, version.version)}
            className="flex-1 text-left"
          >
            <div className="font-mono text-xs">
              v{version.version} - {formatRelativeTime(version.createdAt)}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {getVersionPreview(version.content)}
            </div>
          </button>
        </div>
      ))}
      
      {comparing.length === 2 && (
        <button
          onClick={() => showDiff(outputId, comparing[0], comparing[1])}
          className="w-full p-2 bg-primary/10 rounded text-sm"
        >
          compare v{comparing[0]} ↔ v{comparing[1]}
        </button>
      )}
    </div>
  );
}
```

### 2. diff visualization

#### a. diff generation service
```typescript
// packages/api/services/output.ts
import { diffLines, diffWords } from 'diff';

export class OutputService {
  async compareVersions(
    outputId: string,
    version1: number,
    version2: number
  ) {
    const [v1, v2] = await Promise.all([
      database.outputVersion.findUnique({
        where: { outputId_version: { outputId, version: version1 } }
      }),
      database.outputVersion.findUnique({
        where: { outputId_version: { outputId, version: version2 } }
      })
    ]);
    
    if (!v1 || !v2) throw new ApiError('Version not found');
    
    const output = await this.getById(outputId);
    const diffType = output.type === 'code' ? 'lines' : 'words';
    
    const changes = diffType === 'lines' 
      ? diffLines(v1.content, v2.content)
      : diffWords(v1.content, v2.content);
      
    return {
      version1: { number: v1.version, createdAt: v1.createdAt },
      version2: { number: v2.version, createdAt: v2.createdAt },
      changes,
      stats: {
        additions: changes.filter(c => c.added).length,
        deletions: changes.filter(c => c.removed).length
      }
    };
  }
}
```

#### b. diff viewer component
```typescript
// apps/app/src/components/output/OutputDiffViewer.tsx
export function OutputDiffViewer({ 
  outputId, 
  version1, 
  version2 
}: DiffViewerProps) {
  const { data: diff } = useOutputDiff(outputId, version1, version2);
  
  if (!diff) return <LoadingSpinner />;
  
  return (
    <div className="font-mono text-sm">
      <div className="flex justify-between mb-4 text-xs text-muted-foreground">
        <span>v{version1} → v{version2}</span>
        <span>+{diff.stats.additions} -{diff.stats.deletions}</span>
      </div>
      
      <div className="space-y-1">
        {diff.changes.map((change, i) => (
          <div
            key={i}
            className={cn(
              "px-2 py-1",
              change.added && "bg-green-500/20 text-green-300",
              change.removed && "bg-red-500/20 text-red-300"
            )}
          >
            {change.added && '+ '}
            {change.removed && '- '}
            {change.value}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. collaborative features

#### a. output forking
```typescript
// packages/api/services/output.ts
export class OutputService {
  async forkOutput(outputId: string, userId: string) {
    const original = await this.getById(outputId);
    
    // create new output based on original
    const fork = await database.output.create({
      data: {
        chatId: original.chatId,
        messageId: original.messageId,
        title: `${original.title} (fork)`,
        type: original.type,
        content: original.content,
        metadata: {
          ...original.metadata,
          forkedFrom: outputId,
          forkedAt: new Date()
        }
      }
    });
    
    return fork;
  }
}
```

#### b. collaborative editing ui
```typescript
// apps/app/src/components/output/OutputEditor.tsx
export function OutputEditor({ output }: { output: Output }) {
  const [content, setContent] = useState(output.content);
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateOutput } = useUpdateOutput();
  
  const handleSave = async () => {
    await updateOutput({ outputId: output.id, content });
    setIsEditing(false);
  };
  
  return (
    <div className="relative">
      {output.metadata?.forkedFrom && (
        <div className="text-xs text-muted-foreground mb-2">
          forked from output {output.metadata.forkedFrom}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{output.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm"
          >
            {isEditing ? 'cancel' : 'edit'}
          </button>
          {isEditing && (
            <button onClick={handleSave} className="text-sm">
              save version
            </button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <Editor
          value={content}
          onChange={setContent}
          language={getLanguageFromType(output.type)}
        />
      ) : (
        <OutputRenderer output={{ ...output, content }} />
      )}
    </div>
  );
}
```

### 4. export system

#### a. export service
```typescript
// packages/api/services/output.ts
export class OutputService {
  async exportOutput(outputId: string, format: ExportFormat) {
    const output = await this.getById(outputId);
    
    switch (format) {
      case 'markdown':
        return this.exportAsMarkdown(output);
      case 'html':
        return this.exportAsHtml(output);
      case 'pdf':
        return this.exportAsPdf(output);
      case 'raw':
        return {
          filename: `${slugify(output.title)}.${getExtension(output.type)}`,
          content: output.content,
          mimeType: getMimeType(output.type)
        };
    }
  }
  
  private exportAsMarkdown(output: Output) {
    let markdown = `# ${output.title}\n\n`;
    markdown += `*Generated by arbor on ${output.createdAt}*\n\n`;
    
    if (output.type === 'code') {
      markdown += `\`\`\`${output.metadata?.language || ''}\n`;
      markdown += output.content;
      markdown += '\n```';
    } else {
      markdown += output.content;
    }
    
    return {
      filename: `${slugify(output.title)}.md`,
      content: markdown,
      mimeType: 'text/markdown'
    };
  }
}
```

#### b. export ui
```typescript
// apps/app/src/components/output/OutputExportMenu.tsx
export function OutputExportMenu({ outputId }: { outputId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleExport = async (format: ExportFormat) => {
    const response = await fetch(
      `/api/outputs/${outputId}/export?format=${format}`
    );
    const blob = await response.blob();
    const filename = response.headers.get('content-disposition')
      ?.split('filename=')[1] || 'output';
      
    // trigger download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    
    setIsOpen(false);
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="text-sm">export</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('markdown')}>
          markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('html')}>
          html
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          pdf
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('raw')}>
          raw file
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 5. enhanced output panel

#### a. tabbed interface
```typescript
// apps/app/src/components/layout/output-panel/OutputPanel.tsx
export function OutputPanel() {
  const outputs = useCurrentChatOutputs();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b overflow-x-auto">
        {outputs.map((output) => (
          <button
            key={output.id}
            onClick={() => setActiveTab(output.id)}
            className={cn(
              "px-4 py-2 text-sm whitespace-nowrap",
              activeTab === output.id && "border-b-2 border-primary"
            )}
          >
            <span>{output.title}</span>
            {output.isPinned && <Pin className="w-3 h-3 ml-1" />}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-auto">
        {activeTab && (
          <OutputView 
            outputId={activeTab}
            showVersionHistory
            showExportMenu
          />
        )}
      </div>
    </div>
  );
}
```

## dependencies

- agent 1: consistent storage patterns for versioning
- reuse persistence strategies from chat memory

## testing strategy

### unit tests
- version creation on content change
- diff generation accuracy
- export format correctness

### integration tests
- full version history flow
- collaborative editing scenarios
- export functionality

### e2e tests
- create output → edit → view history → compare versions
- fork output → edit fork → maintain separate history
- export in multiple formats

## security considerations

- validate user permissions for output editing
- sanitize html exports to prevent xss
- rate limit version creation
- audit fork creation for abuse

## effort estimate

**4-6 developer days**

### breakdown:
- day 1-2: versioning system and api
- day 2-3: diff visualization and ui
- day 3-4: collaborative features
- day 4-5: export system
- day 5-6: enhanced output panel and testing

## success metrics

- [ ] automatic versioning on every edit
- [ ] visual diff comparison between versions
- [ ] one-click version restore
- [ ] export to 4+ formats
- [ ] fork and edit independently
- [ ] <100ms version switching
- [ ] zero version data loss