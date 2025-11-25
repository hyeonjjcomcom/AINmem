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
      className={styles['modal']}
      style={{ display: 'block' }}
      onClick={handleBackdropClick}
    >
      <div className={styles['modal-content']}>
        <span 
          className={styles['close']} 
          onClick={onClose}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClose();
            }
          }}
        >
          &times;
        </span>
        <h3 ref={valueRef} id="constant-value">
          {selectedConstantInfo?.name}
        </h3>
        <p ref={descriptionRef} id="constant-description">
          {selectedConstantInfo?.description}
        </p>
      </div>
    </div>
  );
};

export default ConstantModal;