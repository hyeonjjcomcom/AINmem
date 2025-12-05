import React from 'react';
import styles from './MemoryHeader.module.css';

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

interface MemoryHeaderProps {
    filteredMemories: Memory[];
    handleRefresh: () => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}
const MemoryHeader = ({ filteredMemories, handleRefresh, searchTerm, setSearchTerm }: MemoryHeaderProps) => {
    return (
        <header className={styles['header']}>
          <div className={styles['header-left']}>
            <h1 className={styles['page-title']}>Memories</h1>
            <p className={styles['page-subtitle']}>
              Store and explore your personal knowledge • {filteredMemories.length} memories
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
            <button 
              className={`${styles['btn']} ${styles['btn-primary']}`}
              onClick={handleRefresh}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              Refresh
            </button>
          </div>
        </header>
    );
}
export default MemoryHeader;