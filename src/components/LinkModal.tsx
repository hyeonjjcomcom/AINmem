import React from 'react';
import styles from './LinkModal.module.css';

interface NodeData {
  id: string;
  name: string;
  type: string;
  count: number;
  group: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface LinkData {
  source: string | NodeData;
  target: string | NodeData;
  predicates: string[];
  descriptions: string[];
  values: string[];
  count: number;
}

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkData: LinkData | null;
}

const LinkModal = ({ isOpen, onClose, linkData }: LinkModalProps) => {
  if (!isOpen || !linkData) return null;

  const getNodeName = (node: string | NodeData): string => {
    if (typeof node === 'string') return node;
    return node.name || 'Unknown';
  };

  const sourceName = getNodeName(linkData.source);
  const targetName = getNodeName(linkData.target);

  const fullTitle = `Relations: ${sourceName} ↔ ${targetName}`;
  const relationText = linkData.count === 1 ? 'relation' : 'relations';

  return (
    <div className={`${styles.modal} ${styles.show}`} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} title={fullTitle}>
            {fullTitle}
          </h2>
          <div className={styles.headerBadge}>
            <span className={styles.countBadge}>{linkData.count} {relationText}</span>
          </div>
          <div className={styles.headerButtons}>
            <button className={styles.closeBtn} onClick={onClose}>
              &times;
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Relation Details</span>
            </div>

            <div className={styles.relationsList}>
              {linkData.predicates.map((predicate, index) => (
                <div key={index} className={styles.relationItem}>
                  <h4>{predicate}</h4>

                  <p>
                    <strong>Description:</strong> {linkData.descriptions[index] || 'No description available'}
                  </p>

                  <p>
                    <strong>Formula:</strong> {linkData.values[index] || 'No formula available'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;
