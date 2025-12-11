import React from 'react';
import styles from './GraphStats.module.css';

interface GraphStatsProps {
  nodeCount: number;
  linkCount: number;
}

const GraphStats: React.FC<GraphStatsProps> = ({ nodeCount, linkCount }) => {
  return (
    <div className={styles.graphStats}>
      <div className={styles.statItem}>
        <span>Nodes:</span> <span className={styles.statValue}>{nodeCount}</span>
      </div>
      <div className={styles.statItem}>
        <span>Links:</span> <span className={styles.statValue}>{linkCount}</span>
      </div>
    </div>
  );
};

export default GraphStats;
