import { useMemo } from 'react';
import type { Memory } from '../types';
import { getDisplayText, getDisplayTitle } from '../utils';

export const useMemoriesFilter = (
  memories: Memory[],
  searchTerm: string,
  currentFilter: string
) => {
  const filteredMemories = useMemo(() => {
    console.log('🔍 Filtering - searchTerm:', searchTerm, 'currentFilter:', currentFilter, 'total memories:', memories.length);

    let filtered = memories;

    // 태그 필터: All이 아닌 경우 해당 태그가 있는 메모리만 표시
    if (currentFilter !== 'All') {
      filtered = filtered.filter(memory =>
        memory.tags && memory.tags.includes(currentFilter)
      );
      console.log('📌 After tag filter:', filtered.length);
    }

    // 검색 필터
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(memory => {
        const displayText = getDisplayText(memory);
        const displayTitle = getDisplayTitle(memory);

        const titleMatch = displayTitle.toLowerCase().includes(searchLower);
        const textMatch = displayText.toLowerCase().includes(searchLower);
        const tagMatch = memory.tags && memory.tags.some(tag => tag.toLowerCase().includes(searchLower));

        return titleMatch || textMatch || tagMatch;
      });
      console.log('🔎 After search filter:', filtered.length);
    }

    // 날짜순 정렬 (최신순)
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    console.log('✅ Final filtered count:', sorted.length);
    return sorted;
  }, [memories, currentFilter, searchTerm]);

  return {
    filteredMemories,
  };
};
