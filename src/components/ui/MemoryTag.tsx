'use client';

import React, { useRef, useEffect, useState } from 'react';
import styles from './MemoryTag.module.css';

interface MemoryTagProps {
  tag: string;
  variant?: 'default' | 'filter' | 'more';
  onClick?: () => void;
}

export const MemoryTag: React.FC<MemoryTagProps> = ({ tag, variant = 'default', onClick }) => {
  const className = variant === 'filter'
    ? styles['memory-tag-filter']
    : variant === 'more'
    ? styles['memory-tag-more']
    : styles['memory-tag'];

  return (
    <span className={className} onClick={onClick}>
      {tag}
    </span>
  );
};

interface MemoryTagListProps {
  tags: string[];
  className?: string;
}

export const MemoryTagList: React.FC<MemoryTagListProps> = ({ tags, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  useEffect(() => {
    const calculateVisibleTags = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const gap = 8; // gap between tags (from CSS)
      const moreTagWidth = 50; // approximate width of "+N" tag

      // Create temporary elements to measure tag widths
      const tempContainer = document.createElement('div');
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.position = 'absolute';
      tempContainer.style.display = 'flex';
      tempContainer.style.gap = `${gap}px`;
      document.body.appendChild(tempContainer);

      let totalWidth = 0;
      let count = 0;

      for (let i = 0; i < tags.length; i++) {
        // Create temporary tag element with actual CSS class
        const tempTag = document.createElement('span');
        tempTag.className = styles['memory-tag'];
        tempTag.textContent = tags[i];
        tempContainer.appendChild(tempTag);

        const tagWidth = tempTag.offsetWidth;
        const widthWithGap = totalWidth + tagWidth + (i > 0 ? gap : 0);

        // Check if we need to reserve space for +N tag
        const needsMoreTag = i < tags.length - 1;
        const requiredWidth = needsMoreTag ? widthWithGap + gap + moreTagWidth : widthWithGap;

        if (requiredWidth <= containerWidth) {
          totalWidth = widthWithGap;
          count = i + 1;
        } else {
          break;
        }
      }

      document.body.removeChild(tempContainer);
      setVisibleCount(Math.max(0, count));
    };

    calculateVisibleTags();

    // Recalculate on window resize
    window.addEventListener('resize', calculateVisibleTags);
    return () => window.removeEventListener('resize', calculateVisibleTags);
  }, [tags]);

  const visibleTags = tags.slice(0, visibleCount);
  const remainingCount = tags.length - visibleCount;

  return (
    <div ref={containerRef} className={className}>
      {visibleTags.map((tag, index) => (
        <MemoryTag key={index} tag={tag} />
      ))}
      {remainingCount > 0 && (
        <MemoryTag tag={`+${remainingCount}`} variant="more" />
      )}
    </div>
  );
};

export default MemoryTag;
