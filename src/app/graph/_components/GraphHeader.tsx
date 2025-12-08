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
          <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
          Restart
        </button>
        <button
          className={`${styles.btn} ${styles['btn-secondary']}`}
          onClick={onBuild}
          disabled={isBuilding}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="M280-280h80v-280h-80v280Zm160 0h80v-400h-80v400Zm160 0h80v-160h-80v160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>
          Build
        </button>
        <button
          className={`${styles.btn} ${styles['btn-secondary']}`}
          onClick={onFullBuild}
          disabled={isBuilding}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="m653-208-88 88-85-85 88-88q-4-11-6-23t-2-24q0-58 41-99t99-41q18 0 35 4.5t32 12.5l-95 95 56 56 95-94q8 15 12.5 31.5T840-340q0 58-41 99t-99 41q-13 0-24.5-2t-22.5-6Zm178-352h-83q-26-88-99-144t-169-56q-117 0-198.5 81.5T200-480q0 72 32.5 132t87.5 98v-110h80v240H160v-80h94q-62-50-98-122.5T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q129 0 226.5 79.5T831-560Z"/></svg>
          Full Build
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
