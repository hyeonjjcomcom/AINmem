import React from 'react';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Building Graph...'
}) => {
  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.icon}>🔄</div>
        <div className={styles.message}>{message}</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
