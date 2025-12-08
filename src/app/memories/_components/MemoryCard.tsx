import React from 'react';
import { MemoryTagList } from '@/components/ui/MemoryTag';
import type { Memory } from '../types';
import { getDisplayText, getDisplayTitle, truncateText, formatDate } from '../utils';
import styles from './MemoryCard.module.css';

interface MemoryCardProps {
  memory: Memory;
  onClick: (memory: Memory) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onClick }) => {
  const displayText = getDisplayText(memory);
  const displayTitle = getDisplayTitle(memory);
  const dateValue = memory.createdAt || new Date().toISOString();

  return (
    <div
      className={styles['memory-card']}
      onClick={() => onClick(memory)}
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
      <MemoryTagList
        tags={memory.tags || []}
        className={styles['memory-tags']}
      />
    </div>
  );
};

export default MemoryCard;