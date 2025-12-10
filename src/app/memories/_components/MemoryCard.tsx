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
      className={styles.memoryCard}
      onClick={() => onClick(memory)}
    >
      <div className={styles.memoryHeader}>
        <h3 className={styles.memoryTitle}>{displayTitle}</h3>
        <span className={styles.memoryDate}>
          {formatDate(new Date(dateValue))}
        </span>
      </div>
      <p className={styles.memoryContent}>
        {truncateText(displayText, 150)}
      </p>
      <MemoryTagList
        tags={memory.tags || []}
        className={styles.memoryTags}
      />
    </div>
  );
};

export default MemoryCard;