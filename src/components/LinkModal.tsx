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

  return (
    <div className={styles.modal} style={{ display: isOpen ? 'block' : 'none' }}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={onClose}>
          &times;
        </span>

        <div id="modal-relations">
          <h3>
            Relations between {sourceName} and {targetName}
          </h3>

          <p>
            <strong>Total Relations:</strong> {linkData.count}
          </p>

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
  );
};

export default LinkModal;
