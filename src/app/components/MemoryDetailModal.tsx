// components/MemoryDetailModal.jsx
import React from 'react';
import styles from './MemoryDetailModal.module.css'; // 스타일 분리 or 기존 스타일 재사용

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

type MemoryDetailModalProps = {
  isOpen: boolean;
  memory: Memory | null;
  onClose: () => void;
};

const MemoryDetailModal = ({ isOpen, memory, onClose }: MemoryDetailModalProps) => {
  if (!isOpen || !memory) return null;

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

  return (
    <div className={`${styles['modal']} ${styles['show']}`} onClick={onClose}>
      <div
        className={styles['modal-content']}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>
            {getDisplayTitle(memory)}
          </h2>
          <button className={styles['close-btn']} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles['modal-body']}>
          <div className={styles['detail-section']}>
            <div className={styles['detail-label']}>Content</div>
            <div className={styles['detail-content']}>
              {getDisplayText(memory)}
            </div>
          </div>

          <div className={styles['detail-section']}>
            <div className={styles['detail-label']}>Document ID</div>
            <div className={styles['detail-content']}>
              {memory.id || 'N/A'}
            </div>
          </div>

          <div className={styles['detail-section']}>
            <div className={styles['detail-label']}>Timestamp</div>
            <div className={styles['detail-content']}>
              {new Date(memory.createdAt || new Date()).toLocaleString()}
            </div>
          </div>

          {memory.tags && memory.tags.length > 0 && (
            <div className={styles['detail-section']}>
              <div className={styles['detail-label']}>Tags</div>
              <div className={styles['detail-content']}>
                {memory.tags.join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryDetailModal;
