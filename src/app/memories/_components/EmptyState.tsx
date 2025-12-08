import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  isLoading: boolean;
  isEmpty: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ isLoading, isEmpty }) => {
  if (!isLoading && !isEmpty) return null;

  if (isLoading) {
    return (
      <div className={styles['empty-state']}>
        <div className={styles['loading-spinner']}>Loading memories...</div>
      </div>
    );
  }

  return (
    <div className={styles['empty-state']}>
      <svg className={styles['empty-icon']} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <h3>No memories found</h3>
      <p>No data available in the database collection.</p>
    </div>
  );
};

export default EmptyState;