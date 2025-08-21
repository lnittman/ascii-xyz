'use client';

interface ChatHeaderProps {
  chatId: string;
  chatTitle?: string;
  isProject?: boolean;
}

export function ChatHeader({
  chatId,
  chatTitle,
  isProject = false,
}: ChatHeaderProps) {
  // This component is now deprecated - the header functionality has been moved to the unified Header component
  // Keeping this as a placeholder to avoid breaking existing imports, but it renders nothing
  return null;
}
