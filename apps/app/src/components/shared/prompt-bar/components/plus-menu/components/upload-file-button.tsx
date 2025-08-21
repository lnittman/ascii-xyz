import { FileArrowUp } from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type React from 'react';
import { useRef } from 'react';

import { cn } from '@repo/design/lib/utils';

interface UploadFileButtonProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
}

export function UploadFileButton({
  onFileSelect,
  accept = '*/*',
  multiple = true,
}: UploadFileButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <>
      <DropdownMenuPrimitive.Item
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-none px-2 py-1.5 text-foreground text-sm outline-none transition-colors',
          'focus:bg-accent focus:text-accent-foreground',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
        )}
        onSelect={(e) => {
          // Prevent the default handling to avoid closing the dropdown before we process files
          e.preventDefault();
        }}
      >
        <div className="flex w-full items-center" onClick={handleClick}>
          <FileArrowUp weight="duotone" className="mr-1.5 h-4 w-4" />
          <span>upload a file</span>
        </div>
      </DropdownMenuPrimitive.Item>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
      />
    </>
  );
}
