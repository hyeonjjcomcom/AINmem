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
    ? styles.memoryTagFilter
    : variant === 'more'
    ? styles.memoryTagMore
    : styles.memoryTag;

  return (
    <span className={className} onClick={onClick}>
      {tag}
    </span>
  );
};

interface MemoryTagListProps {
  tags: string[];
  className?: string;
  showTooltip?: boolean;
  tagPrefix?: string;
}

export const MemoryTagList: React.FC<MemoryTagListProps> = ({
  tags,
  className,
  showTooltip = true,
  tagPrefix = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);
  const [showMoreTags, setShowMoreTags] = useState(false);

  useEffect(() => {
    const calculateVisibleTags = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const gap = 8; // gap between tags (from CSS)

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
        tempTag.className = styles.memoryTag;
        tempTag.textContent = tagPrefix + tags[i];
        tempContainer.appendChild(tempTag);

        const tagWidth = tempTag.offsetWidth;
        const currentWidth = totalWidth + tagWidth + (i > 0 ? gap : 0);

        // Check if current tag fits
        if (currentWidth > containerWidth) {
          break;
        }

        // Look ahead: can we fit the next tag?
        if (i < tags.length - 1) {
          const nextTag = document.createElement('span');
          nextTag.className = styles.memoryTag;
          nextTag.textContent = tagPrefix + tags[i + 1];
          tempContainer.appendChild(nextTag);
          const nextTagWidth = nextTag.offsetWidth;
          tempContainer.removeChild(nextTag);

          const widthWithNextTag = currentWidth + gap + nextTagWidth;

          // If next tag fits, just add current tag and continue
          if (widthWithNextTag <= containerWidth) {
            totalWidth = currentWidth;
            count = i + 1;
          } else {
            // Next tag doesn't fit, check if we can fit current tag + +N badge
            const remainingCount = tags.length - (i + 1);
            const tempMoreTag = document.createElement('span');
            tempMoreTag.className = styles.memoryTagMore;
            tempMoreTag.textContent = `+${remainingCount}`;
            tempContainer.appendChild(tempMoreTag);
            const moreTagWidth = tempMoreTag.offsetWidth;
            tempContainer.removeChild(tempMoreTag);

            const widthWithMore = currentWidth + gap + moreTagWidth;

            if (widthWithMore <= containerWidth) {
              totalWidth = currentWidth;
              count = i + 1;
            }
            break;
          }
        } else {
          // Last tag
          totalWidth = currentWidth;
          count = i + 1;
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
  const hiddenTags = tags.slice(visibleCount);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {visibleTags.map((tag, index) => (
        <MemoryTag key={index} tag={tagPrefix + tag} />
      ))}
      {remainingCount > 0 && (
        <span
          className={styles.tooltipWrapper}
          onMouseEnter={() => showTooltip && setShowMoreTags(true)}
          onMouseLeave={() => showTooltip && setShowMoreTags(false)}
        >
          <MemoryTag tag={`+${remainingCount}`} variant="more" />
          {showTooltip && showMoreTags && (
            <div className={styles.tooltip}>
              {hiddenTags.map((tag, idx) => (
                <MemoryTag key={idx} tag={tagPrefix + tag} />
              ))}
            </div>
          )}
        </span>
      )}
    </div>
  );
};

export default MemoryTag;
