import React from 'react';
import styles from './GraphHeader.module.css';

interface GraphHeaderProps {
  onRestart: () => void;
  onBuild: () => void;
  onFullBuild: () => void;
  onCenter: () => void;
  isBuilding?: boolean;
}

const GraphHeader: React.FC<GraphHeaderProps> = ({
  onRestart,
  onBuild,
  onFullBuild,
  onCenter,
  isBuilding = false,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles['header-left']}>
        <h1 className={styles['page-title']}>Knowledge Graph</h1>
        <p className={styles['page-subtitle']}>
          Navigate your knowledge graph and discover meaningful patterns
        </p>
      </div>
      <div className={styles['header-right']}>
        <button
          className={`${styles.btn} ${styles['btn-secondary']}`}
          onClick={onRestart}
          disabled={isBuilding}
        >
          <span>⟲</span> Restart
        </button>
        <button
          className={`${styles.btn} ${styles['btn-secondary']}`}
          onClick={onBuild}
          disabled={isBuilding}
        >
          <span>📊</span> Build
        </button>
        <button
          className={`${styles.btn} ${styles['btn-secondary']}`}
          onClick={onFullBuild}
          disabled={isBuilding}
        >
          <span>🔄</span> Full Build
        </button>
        <button
          className={`${styles.btn} ${styles['btn-primary']}`}
          onClick={onCenter}
        >
          <span>⊙</span> Center
        </button>
      </div>
    </header>
  );
};

export default GraphHeader;
