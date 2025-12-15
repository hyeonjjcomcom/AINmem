"use client";

import React, { useEffect, useRef } from 'react';
import styles from './ConstantModal.module.css';

interface ConstantModalProps {
  selectedConstantInfo: {
    name?: string;
    description?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const ConstantModal = ({
  selectedConstantInfo,
  isOpen,
  onClose
}: ConstantModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // 모달 외부 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      id="constant-modal"
      className={`${styles.modal} ${styles.show}`}
      onClick={handleBackdropClick}
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} ref={valueRef} id="constant-value">
            {selectedConstantInfo?.name || 'Constant'}
          </h2>
          <div className={styles.headerButtons}>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Description</span>
            </div>

            <div className={styles.contentCard} ref={descriptionRef} id="constant-description">
              {selectedConstantInfo?.description || 'No description available'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstantModal;