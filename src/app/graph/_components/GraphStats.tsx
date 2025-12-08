import React from 'react';
import styles from '../GraphPage.module.css';

interface GraphStatsProps {
  nodeCount: number;
  linkCount: number;
}

const GraphStats: React.FC<GraphStatsProps> = ({ nodeCount, linkCount }) => {
  return (
    <div className={styles['graph-stats']}>
      <div className={styles['stat-item']}>
        <span>Nodes:</span> <span className={styles['stat-value']}>{nodeCount}</span>
      </div>
      <div className={styles['stat-item']}>
        <span>Links:</span> <span className={styles['stat-value']}>{linkCount}</span>
      </div>
    </div>
  );
};

export default GraphStats;
