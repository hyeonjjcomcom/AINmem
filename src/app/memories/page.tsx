"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import styles from './Memories.module.css';

interface Memory {
  _id?: string;
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
  const dbName = "sample_db";
  const collectionName = "memories_collection";

  // 기존 state들...
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [apiMemories, setApiMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 로그인 상태를 추적하는 state 추가
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // 로그인 상태 확인 useEffect
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = sessionStorage.getItem('isLogined') === 'true';
      setIsLoggedIn(loginStatus);
    };

    // 초기 로그인 상태 확인
    checkLoginStatus();

    // storage 변경 감지 (같은 탭에서의 변경도 감지)
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    // 커스텀 이벤트 리스너 (사이드바에서 로그인 시 발생)
    const handleLoginEvent = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleLoginEvent);
    window.addEventListener('userLoggedOut', handleLoginEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLoginEvent);
      window.removeEventListener('userLoggedOut', handleLoginEvent);
    };
  }, []);

  // 로그인 상태가 변경될 때마다 데이터 fetch
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        if (!isLoggedIn) {
          setApiMemories([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        const userName = sessionStorage.getItem('userName') || '';

        const response = await fetch(`/api?endpoint=memories&userName=${encodeURIComponent(userName)}`);

        if (response.ok) {
          const data = await response.json();

          // API 데이터를 Memory 인터페이스에 맞게 변환
          const transformedData: Memory[] = data.map((item: any) => {
            let parsedContent = '';
            let inputText = '';

            // content가 JSON 문자열인 경우 파싱
            if (item.content) {
              try {
                const parsed = JSON.parse(item.content);
                inputText = parsed.input_text || '';
                parsedContent = inputText;
              } catch (e) {
                parsedContent = item.content;
              }
            }

            return {
              _id: item.id,
              id: item.id,
              title: item.title,
              input_text: inputText || parsedContent,
              content: parsedContent,
              timestamp: item.createdAt,
              createdAt: item.createdAt,
              tags: item.tags || [],
              category: item.category || 'notes'
            };
          });

          setApiMemories(transformedData);
        } else {
          console.error('Failed to fetch memories from API');
          setApiMemories([]);
        }
      } catch (error) {
        console.error('Error fetching memories:', error);
        setApiMemories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, [isLoggedIn]);


  const memoriesData = apiMemories;

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

    // 카테고리 필터
    if (currentFilter !== 'all') {
      filtered = filtered.filter(memory => memory.category === currentFilter);
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
      const dateA = new Date(a.timestamp || a.createdAt || 0);
      const dateB = new Date(b.timestamp || b.createdAt || 0);
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

  // 네비게이션 아이템들
  const navItems = [
    { id: 'request', label: 'Request', icon: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' },
    { id: 'memories', label: 'Memories', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
    { id: 'graph', label: 'Graph', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { id: 'analytics', label: 'Analytics', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
    { id: 'settings', label: 'Settings', icon: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z' }
  ];

  const filterTags = [
    { id: 'all', label: 'All' },
    { id: 'personal', label: 'Personal' },
    { id: 'work', label: 'Work' },
    { id: 'ideas', label: 'Ideas' },
    { id: 'notes', label: 'Notes' }
  ];

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

  return (
    <>
      <Sidebar />
      {/* Main Content */}
      <main className={styles['main-content']}>
        <header className={styles['header']}>
          <div className={styles['header-left']}>
            <h1 className={styles['page-title']}>Memories</h1>
            <p className={styles['page-subtitle']}>
              Database: {dbName} / Collection: {collectionName} • {filteredMemories.length} memories
            </p>
          </div>
          <div className={styles['header-right']}>
            <input
              type="text"
              className={styles['search-box']}
              placeholder="Search memories..."
              id="searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={`${styles['btn']} ${styles['btn-secondary']}`}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
              </svg>
              Filter
            </button>
            <button 
              className={`${styles['btn']} ${styles['btn-primary']}`}
              onClick={() => {
                setIsLoading(true);
                const fetchMemories = async () => {
                  try {
                    const response = await fetch('/api?endpoint=memories');
                    
                    if (response.ok) {
                      const data = await response.json();
                      
                      const transformedData: Memory[] = data.map((item: any) => {
                        let parsedContent = '';
                        let inputText = '';
                        
                        if (item.content) {
                          try {
                            const parsed = JSON.parse(item.content);
                            inputText = parsed.input_text || '';
                            parsedContent = inputText;
                          } catch (e) {
                            parsedContent = item.content;
                          }
                        }
                        
                        return {
                          _id: item.id,
                          id: item.id,
                          title: item.title,
                          input_text: inputText || parsedContent,
                          content: parsedContent,
                          timestamp: item.createdAt,
                          createdAt: item.createdAt,
                          tags: item.tags || [],
                          category: item.category || 'notes'
                        };
                      });
                      
                      setApiMemories(transformedData);
                    }
                  } catch (error) {
                    console.error('Error refreshing memories:', error);
                  } finally {
                    setIsLoading(false);
                  }
                };
                fetchMemories();
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              Refresh
            </button>
          </div>
        </header>

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
                const dateValue = memory.timestamp || memory.createdAt || new Date().toISOString();
                
                return (
                  <div
                    key={memory._id || memory.id}
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

      {/* Memory Detail Modal */}
      {isModalOpen && selectedMemory && (
        <div className={`${styles['modal']} ${styles['show']}`} onClick={closeModal}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <h2 className={styles['modal-title']}>
                {getDisplayTitle(selectedMemory)}
              </h2>
              <button className={styles['close-btn']} onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className={styles['modal-body']}>
              <div className={styles['detail-section']}>
                <div className={styles['detail-label']}>Content</div>
                <div className={styles['detail-content']}>
                  {getDisplayText(selectedMemory)}
                </div>
              </div>
              <div className={styles['detail-section']}>
                <div className={styles['detail-label']}>Document ID</div>
                <div className={styles['detail-content']}>
                  {selectedMemory._id || selectedMemory.id || 'N/A'}
                </div>
              </div>
              <div className={styles['detail-section']}>
                <div className={styles['detail-label']}>Timestamp</div>
                <div className={styles['detail-content']}>
                  {new Date(selectedMemory.timestamp || selectedMemory.createdAt || new Date()).toLocaleString()}
                </div>
              </div>
              {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                <div className={styles['detail-section']}>
                  <div className={styles['detail-label']}>Tags</div>
                  <div className={styles['detail-content']}>
                    {selectedMemory.tags.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Memories;