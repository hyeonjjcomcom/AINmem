import React from 'react';
import styles from './MemoryTag.module.css';

interface MemoryTagProps {
  tag: string;
  variant?: 'default' | 'filter';
  onClick?: () => void;
}

const MemoryTag: React.FC<MemoryTagProps> = ({ tag, variant = 'default', onClick }) => {
  const className = variant === 'filter'
    ? styles['memory-tag-filter']
    : styles['memory-tag'];

  return (
    <span className={className} onClick={onClick}>
      {tag}
    </span>
  );
};

export default MemoryTag;
