import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that combines multiple class names and properly merges Tailwind CSS classes
 * using clsx and tailwind-merge.
 *
 * @param inputs - Class values to merge
 * @returns - Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a URL string to ensure it has the proper protocol
 */
export function formatUrl(url: string): string {
  if (!url) {
    return '';
  }

  // If URL doesn't start with a protocol, add https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
}

/**
 * Format a timestamp to a readable date string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Safely extract hostname from a URL
 */
export function extractHostname(url: string): string {
  try {
    const urlObj = new URL(formatUrl(url));
    return urlObj.hostname;
  } catch (_error) {
    return url;
  }
}

/**
 * Create a slug from a string
 */
export function createSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate a string to a specified length
 */
export function truncate(str: string, length: number): string {
  if (!str) {
    return '';
  }
  if (str.length <= length) {
    return str;
  }
  return `${str.substring(0, length)}...`;
}

/**
 * Safely parse JSON with a fallback value
 */
export function parseJSON<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (_error) {
    return fallback;
  }
}

/**
 * Delay execution for a given time
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Extracts the domain name from a URL.
 *
 * @param url - URL to extract domain from
 * @returns - Domain name
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(formatUrl(url));
    return urlObj.hostname;
  } catch (_error) {
    return url;
  }
}

/**
 * Truncates text to a maximum length, adding an ellipsis if truncated.
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns - Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Check if a string is a valid URL
 */
export function isUrl(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch (_e) {
    return false;
  }
}
