'use client';

import type { RefObject } from 'react';

import { MagnifyingGlass, X } from '@phosphor-icons/react';

interface SearchBarProps {
  inputRef: RefObject<HTMLInputElement | null>;
  search: string;
  closeCommandModal: () => void;
  setSearch: (value: string) => void;
}

export function SearchBar({
  inputRef,
  search,
  closeCommandModal,
  setSearch,
}: SearchBarProps) {
  return (
    <div className="relative flex items-center border-b px-3 py-2">
      <div className="flex w-6 items-center justify-center">
        <MagnifyingGlass
          weight="duotone"
          className="h-4 w-4 shrink-0 text-muted-foreground"
        />
      </div>

      <input
        ref={inputRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="search..."
        className="search-input flex h-9 w-full bg-transparent py-2 font-title text-foreground text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />

      <button
        onClick={closeCommandModal}
        className="absolute right-3 flex h-7 w-7 items-center justify-center transition-colors hover:bg-accent/50"
      >
        <X weight="duotone" className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
