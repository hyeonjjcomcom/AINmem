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
    <div className={styles['filters-wrapper']}>
      <div className={styles.filters}>
        {filterTags.map((tag) => (
          <div
            key={tag.id}
            className={`${styles['filter-tag']} ${currentFilter === tag.id ? styles['active'] : ''}`}
            onClick={() => onFilterChange(tag.id)}
          >
            {tag.label}
          </div>
        ))}
      </div>
      <div className={styles.legend}>
        <div className={styles['legend-item']}>
          <div className={`${styles['legend-circle']} ${styles.constant}`}></div>
          <span>Constants</span>
        </div>
        <div className={styles['legend-item']}>
          <div className={`${styles['legend-circle']} ${styles.predicate}`}></div>
          <span>Predicates</span>
        </div>
        <div className={styles['legend-divider']}></div>
        <div className={styles['toggle-container']}>
          <span className={styles['toggle-label']}>Labels</span>
          <button
            className={`${styles['toggle-switch']} ${showLabels ? styles.active : ''}`}
            onClick={onToggleLabels}
            role="switch"
            aria-checked={showLabels}
          >
            <span className={styles['toggle-slider']}></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphFilters;
