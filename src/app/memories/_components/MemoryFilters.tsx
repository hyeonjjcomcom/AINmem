import React from 'react';
import type { FilterTag } from '../types';
import styles from './MemoryFilters.module.css';

interface MemoryFiltersProps {
  filterTags: FilterTag[];
  currentFilter: string;
  onFilterChange: (filterId: string) => void;
}

const MemoryFilters: React.FC<MemoryFiltersProps> = ({
  filterTags,
  currentFilter,
  onFilterChange,
}) => {
  return (
    <div className={styles.filters}>
      {filterTags.map((tag) => (
        <div
          key={tag.id}
          className={`${styles.filterTag} ${currentFilter === tag.id ? styles.active : ''}`}
          onClick={() => onFilterChange(tag.id)}
        >
          {tag.label}
        </div>
      ))}
    </div>
  );
};

export default MemoryFilters;