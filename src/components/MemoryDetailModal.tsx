// components/MemoryDetailModal.jsx
import React, { useState } from 'react';
import { toast } from 'sonner';
import { MemoryTagList } from './ui/MemoryTag';
import styles from './MemoryDetailModal.module.css';
import ConfirmModal from './ConfirmModal';

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
  session_id?: string;
  model_version?: string;
  tokens_input?: number;
}

type MemoryDetailModalProps = {
  isOpen: boolean;
  memory: Memory | null;
  onClose: () => void;
  onDelete: (memoryId: string) => Promise<void>;
};

const MemoryDetailModal = ({ isOpen, memory, onClose, onDelete }: MemoryDetailModalProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  // 삭제 버튼 클릭 시 확인 모달 열기
  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  // 삭제 확인
  const handleConfirmDelete = async () => {
    if (!memory?.id) return;

    try {
      await onDelete(memory.id);
      setShowConfirm(false);
      onClose(); // 삭제 성공 후 모달 닫기
    } catch (error) {
      console.error('Failed to delete memory:', error);
      toast.error('Failed to delete memory. Please try again.');
    }
  };

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


  if (!isOpen || !memory) return null;

  const displayText = getDisplayText(memory);

  return (
    <div className={`${styles.modal} ${styles.show}`} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {getDisplayTitle(memory)}
          </h2>
          {memory.tags && memory.tags.length > 0 && (
            <MemoryTagList
              tags={memory.tags}
              className={styles.headerTags}
              showTooltip={true}
              tagPrefix="#"
            />
          )}
          <div className={styles.headerButtons}>
            <button className={styles.deleteBtn} onClick={handleDeleteClick} title="Delete memory">
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
              </svg>
            </button>
            <button className={styles.closeBtn} onClick={onClose}>
              &times;
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          {/* 상단: 메타 정보 요약 */}
          <div className={`${styles.sectionHeader} ${styles.firstSection}`}>
            <span className={styles.sectionTitle}>Memory Info</span>
          </div>
          <div className={styles.metaSummary}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Created:</span>
              <span className={styles.metaValue}>
                {new Date(memory.createdAt || new Date()).toLocaleString()}
              </span>
            </div>
            {memory.session_id && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Session:</span>
                <span className={styles.metaValue}>
                  {memory.session_id}
                </span>
              </div>
            )}
            {memory.model_version && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Model:</span>
                <span className={styles.metaValue}>
                  {memory.model_version}
                </span>
              </div>
            )}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>ID:</span>
              <span className={styles.metaValue} style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
                {memory.id ? `${memory.id.substring(0, 12)}...` : 'N/A'}
              </span>
            </div>
            {memory.tokens_input !== undefined && memory.tokens_input !== null && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Tokens:</span>
                <span className={styles.metaValue}>
                  {memory.tokens_input}
                </span>
              </div>
            )}
          </div>
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Main Content</span>
            </div>

            <div className={styles.contentWrapper}>
              <div className={styles.contentCard}>
                {displayText}
              </div>
            </div>
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Memory"
        message="Are you sure you want to delete this memory? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
        danger
      />
    </div>
  );
};

export default MemoryDetailModal;
