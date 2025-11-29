"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import MemoryDetailModal from '@/components/MemoryDetailModal';
import MemoryHeader from './_components/MemoryHeader';
import styles from './Memories.module.css';
import AuthOverlay from '@/components/AuthOverlay';

import { useAuth } from '@/contexts/AuthContext';

interface Memory {
  id?: string;
  input_text?: string;
  content?: string;
  title?: string;
  timestamp?: string;
  createdAt?: string;
  tags?: string[];
  category?: string;
  user_id?: string;
}

const Memories = () => {

  // 기존 state들...
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [apiMemories, setApiMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 로그인 상태를 추적하는 state 추가
  const { isLoggedIn, userName, isHydrated } = useAuth();

  const memoriesData = apiMemories;

  const filterTags = [
    { id: 'All', label: 'All' },
    { id: 'Exploration', label: 'Exploration' },
    { id: 'Inspiration', label: 'Inspiration' },
    { id: 'Refinement', label: 'Refinement' },
    { id: 'Solution', label: 'Solution' },
    { id: 'Empathy', label: 'Empathy' },
    { id: 'Play', label: 'Play' },
    { id: 'Others', label: 'Others' }
  ];

    // 텍스트 콘텐츠 추출
  const getDisplayText = (memory: Memory): string => {
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

   // 제목 생성
  const getDisplayTitle = (memory: Memory): string => {
    if (memory.title) return memory.title;
    
    const text = getDisplayText(memory);
    if (text) {
      const firstLine = text.split('\n')[0];
      return truncateText(firstLine, 50) || 'Untitled Memory';
    }
    
    return 'Untitled Memory';
  };

  // 텍스트 자르기
  const truncateText = (text: string, maxLength: number): string => {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
  };

  // 날짜 포맷팅
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
  };

  // 필터링된 메모리
  const filteredMemories = useMemo(() => {
    let filtered = memoriesData;

    // 태그 필터: All이 아닌 경우 해당 태그가 있는 메모리만 표시
    if (currentFilter !== 'all') {
      filtered = filtered.filter(memory =>
        memory.tags && memory.tags.includes(currentFilter)
      );
    }

    // 검색 필터
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(memory => {
        const displayText = getDisplayText(memory);
        const displayTitle = getDisplayTitle(memory);
        
        return displayTitle.toLowerCase().includes(searchLower) ||
               displayText.toLowerCase().includes(searchLower) ||
               (memory.tags && memory.tags.some(tag => tag.toLowerCase().includes(searchLower)));
      });
    }

    // 날짜순 정렬 (최신순)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [memoriesData, currentFilter, searchTerm]);

  // 메모리 카드 클릭
  const handleMemoryClick = (memory: Memory) => {
    setSelectedMemory(memory);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMemory(null);
  };

  // 메모리 삭제 핸들러
  const handleDelete = async (memoryId: string) => {
    try {
      const response = await fetch(`/api/memories/${encodeURIComponent(memoryId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete memory');
      }

      // 삭제 성공 후 메모리 목록 새로고침
      await fetchMemories(userName || '');
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error; // 모달이 에러를 처리할 수 있도록 re-throw
    }
  };

  //memories endpoint api 호출, 파라미터 userName(유저 지갑 주소)
  const fetchMemories = async (userName: string) => {
    // 로그인되지 않은 경우 빈 배열 설정
    if (!isLoggedIn) {
      setApiMemories([]);
      setIsLoading(false);
      return;
    }
    // 로그인된 경우에만 데이터 fetch
    setIsLoading(true);
    try {
      const response = await fetch(`/api/memories?userName=${encodeURIComponent(userName)}`);
      if (!response.ok) throw new Error('Failed to fetch memories');
      
      const data = await response.json();
      const transformedData: Memory[] = data.map((item: any) => {
        let parsedContent = '';
        let inputText = '';

        if (item.content) {
          try {
            const parsed = JSON.parse(item.content);
            inputText = parsed.input_text || '';
            parsedContent = inputText;
          } catch {
            parsedContent = item.content;
          }
        }

        return {
          id: item.id,
          title: item.title,
          input_text: inputText || parsedContent,
          content: parsedContent,
          createdAt: item.createdAt,
          tags: item.tags || [],
          category: item.category || 'notes'
        };
      });

      setApiMemories(transformedData);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 새로고침 핸들러
  const handleRefresh = async () => {
    fetchMemories(userName || '');
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        searchInput?.focus();
      }
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 로그인 상태가 변경될 때마다 데이터 fetch
  useEffect(() => {
    fetchMemories(userName || '');
  }, [isLoggedIn, userName]);

  return (
    <>
      <Sidebar />
      {/* Main Content */}
      <main className={styles['main-content']}>

        {isHydrated && !isLoggedIn && <AuthOverlay />}

        <MemoryHeader
          filteredMemories={filteredMemories}
          handleRefresh={handleRefresh}
        />

        <div className={styles['content']}>
          <div className={styles['filters']}>
            {filterTags.map((tag) => (
              <div
                key={tag.id}
                className={`${styles['filter-tag']} ${currentFilter === tag.id ? styles['active'] : ''}`}
                onClick={() => setCurrentFilter(tag.id)}
              >
                {tag.label}
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className={styles['empty-state']}>
              <div className={styles['loading-spinner']}>Loading memories...</div>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className={styles['empty-state']}>
              <svg className={styles['empty-icon']} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <h3>No memories found</h3>
              <p>No data available in the database collection.</p>
            </div>
          ) : (
            <div className={styles['memories-grid']}>
              {filteredMemories.map((memory) => {
                const displayText = getDisplayText(memory);
                const displayTitle = getDisplayTitle(memory);
                const dateValue = memory.createdAt || new Date().toISOString();
                
                return (
                  <div
                    key={memory.id}
                    className={styles['memory-card']}
                    onClick={() => handleMemoryClick(memory)}
                  >
                    <div className={styles['memory-header']}>
                      <h3 className={styles['memory-title']}>{displayTitle}</h3>
                      <span className={styles['memory-date']}>
                        {formatDate(new Date(dateValue))}
                      </span>
                    </div>
                    <p className={styles['memory-content']}>
                      {truncateText(displayText, 150)}
                    </p>
                    <div className={styles['memory-tags']}>
                      {(memory.tags || []).map((tag, index) => (
                        <span key={index} className={styles['memory-tag']}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <MemoryDetailModal
        isOpen={isModalOpen}
        memory={selectedMemory}
        onClose={closeModal}
        onDelete={handleDelete}
      />
    </>
  );
};

export default Memories;