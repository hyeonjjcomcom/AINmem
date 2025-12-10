import React from 'react';
import type { FilterTag } from '../types';
import styles from './GraphFilters.module.css';

interface GraphFiltersProps {
  filterTags: FilterTag[];
  currentFilter: string;
  onFilterChange: (filterId: string) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
}

const GraphFilters: React.FC<GraphFiltersProps> = ({
  filterTags,
  currentFilter,
  onFilterChange,
  showLabels,
  onToggleLabels,
}) => {
  return (
    <div className={styles.filtersWrapper}>
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
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendCircle} ${styles.constant}`}></div>
          <span>Constants</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendCircle} ${styles.predicate}`}></div>
          <span>Predicates</span>
        </div>
        <div className={styles.legendDivider}></div>
        <div className={styles.toggleContainer}>
          <span className={styles.toggleLabel}>Labels</span>
          <button
            className={`${styles.toggleSwitch} ${showLabels ? styles.active : ''}`}
            onClick={onToggleLabels}
            role="switch"
            aria-checked={showLabels}
          >
            <span className={styles.toggleSlider}></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphFilters;
