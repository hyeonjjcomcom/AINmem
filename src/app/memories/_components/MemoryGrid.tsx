import React from 'react';
import MemoryCard from './MemoryCard';
import type { Memory } from '../types';
import styles from './MemoryGrid.module.css';

interface MemoryGridProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
}

const MemoryGrid: React.FC<MemoryGridProps> = ({ memories, onMemoryClick }) => {
  if (memories.length === 0) return null;

  return (
    <div className={styles.memoriesGrid}>
      {memories.map((memory) => (
        <MemoryCard
          key={memory.id}
          memory={memory}
          onClick={onMemoryClick}
        />
      ))}
    </div>
  );
};

export default MemoryGrid;