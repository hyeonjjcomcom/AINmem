import type { Memory } from '../types';

/**
 * Extract display text from memory object
 */
export const getDisplayText = (memory: Memory): string => {
  if (memory.input_text) {
    try {
      if (memory.input_text.startsWith('{') || memory.input_text.startsWith('[')) {
        const parsed = JSON.parse(memory.input_text);
        if (parsed.user_id) return parsed.user_id;
        if (parsed.input_text) return parsed.input_text;
        if (parsed.content) return parsed.content;
        if (parsed.text) return parsed.text;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return getDisplayText(parsed[0]);
        }
      } else {
        return memory.input_text;
      }
    } catch (e) {
      return memory.input_text;
    }
  }

  if (memory.content) return memory.content;
  return '';
};

/**
 * Generate display title from memory
 */
export const getDisplayTitle = (memory: Memory): string => {
  if (memory.title) return memory.title;

  const text = getDisplayText(memory);
  if (text) {
    const firstLine = text.split('\n')[0];
    return truncateText(firstLine, 50) || 'Untitled Memory';
  }

  return 'Untitled Memory';
};

/**
 * Truncate text to max length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
};

/**
 * Format date as relative time or absolute date
 */
export const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString();
};
