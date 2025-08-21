# Claude Guide to Components

This directory contains React components for the Arbor web application.

## 📁 Component Organization

```
components/
├── app/                  # Application-specific components
│   ├── chat/            # Chat UI components
│   ├── project/         # Project management
│   ├── workspace/       # Workspace components
│   └── auth/            # Authentication UI
├── layouts/             # Layout components
│   ├── app-layout.tsx   # Main app layout
│   ├── sidebar.tsx      # Navigation sidebar
│   └── header.tsx       # App header
├── ui/                  # Base UI components (from @repo/design)
└── providers/           # React context providers
```

## 🎨 Component Patterns

### Chat Components (`app/chat/`)

#### Message Component
```typescript
// app/chat/message.tsx
interface MessageProps {
  message: Message;
  isStreaming?: boolean;
  onRetry?: () => void;
}

export function Message({ message, isStreaming }: MessageProps) {
  return (
    <div className={cn(
      "flex gap-3 p-4",
      message.role === "user" ? "bg-muted/50" : ""
    )}>
      <Avatar role={message.role} />
      <div className="flex-1">
        <MessageContent 
          parts={message.parts} 
          isStreaming={isStreaming}
        />
        {message.toolInvocations && (
          <ToolInvocations tools={message.toolInvocations} />
        )}
      </div>
    </div>
  );
}
```

#### Chat Input
```typescript
// app/chat/input.tsx
export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList>();
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    
    onSubmit(input, files);
    setInput("");
    setFiles(undefined);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4">
      <AttachmentButton onFilesSelect={setFiles} />
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <Button type="submit" disabled={!input.trim() || disabled}>
        Send
      </Button>
    </form>
  );
}
```

### Layout Components

#### App Layout
```typescript
// layouts/app-layout.tsx
export function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useUser();
  
  if (!user) return <Navigate to="/sign-in" />;
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header />
        <div className="h-full overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
```

### Provider Components

#### Chat Provider
```typescript
// providers/chat-provider.tsx
const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const { data: chats } = useChats();
  
  const value = {
    activeChat,
    setActiveChat,
    chats: chats?.data || [],
  };
  
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
```

## 🎯 Component Guidelines

### 1. Composition Pattern
```typescript
// Prefer composition over configuration
<Message>
  <MessageAvatar user={message.user} />
  <MessageContent>{message.content}</MessageContent>
  <MessageActions onEdit={handleEdit} onDelete={handleDelete} />
</Message>
```

### 2. State Management
```typescript
// Use hooks for local state
const [isOpen, setIsOpen] = useState(false);

// Use SWR for server state
const { data, mutate } = useChats();

// Use context for shared UI state
const { theme } = useTheme();
```

### 3. Performance
```typescript
// Memoize expensive computations
const processedMessages = useMemo(
  () => messages.map(transformMessage),
  [messages]
);

// Memoize callbacks
const handleSubmit = useCallback(
  (input: string) => {
    onSubmit(input);
  },
  [onSubmit]
);
```

### 4. Error Boundaries
```typescript
// Wrap features in error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <ChatInterface />
</ErrorBoundary>
```

## 🚨 Common Patterns

### Loading States
```typescript
if (isLoading) {
  return <ChatSkeleton />;
}

if (error) {
  return <ErrorMessage error={error} />;
}

return <ChatContent data={data} />;
```

### Empty States
```typescript
if (!chats?.length) {
  return (
    <EmptyState
      icon={<MessageSquare />}
      title="No chats yet"
      description="Start a new conversation"
      action={
        <Button onClick={createChat}>
          New Chat
        </Button>
      }
    />
  );
}
```

### Streaming UI
```typescript
// Handle streaming responses
{messages.map((message, index) => (
  <Message
    key={message.id}
    message={message}
    isStreaming={
      index === messages.length - 1 && 
      message.role === "assistant" &&
      isStreaming
    }
  />
))}
```

## 📝 Adding Components

1. Create component file in appropriate directory
2. Use TypeScript interfaces for props
3. Export from directory index
4. Add to component library if reusable
5. Include Storybook story if complex

## 🎨 Styling Guidelines

- Use Tailwind classes
- Follow design system tokens
- Keep styling minimal
- Use cn() for conditional classes
- Avoid inline styles

## 🔍 Component Examples

### Tool Invocation Display
```typescript
<ToolInvocation tool={tool}>
  {tool.state === "pending" && <Spinner />}
  {tool.state === "result" && <ToolResult result={tool.result} />}
  {tool.state === "error" && <ToolError error={tool.error} />}
</ToolInvocation>
```

### Attachment Preview
```typescript
<AttachmentPreview attachment={attachment}>
  {attachment.type.startsWith("image/") && (
    <img src={attachment.url} alt={attachment.name} />
  )}
  {attachment.type === "application/pdf" && (
    <PdfIcon className="w-12 h-12" />
  )}
</AttachmentPreview>
```

Remember: Components should be focused, reusable, and follow React best practices. Keep business logic in hooks and services.