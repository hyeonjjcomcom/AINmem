'use client';

import React, { useRef, useEffect, useState } from 'react';
import styles from './MemoryTag.module.css';

const TAG_GAP = 8;

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

      const tempContainer = document.createElement('div');
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.position = 'absolute';
      tempContainer.style.display = 'flex';
      tempContainer.style.gap = `${TAG_GAP}px`;
      document.body.appendChild(tempContainer);

      let totalWidth = 0;
      let count = 0;

      for (let i = 0; i < tags.length; i++) {
        const tempTag = document.createElement('span');
        tempTag.className = styles.memoryTag;
        tempTag.textContent = tagPrefix + tags[i];
        tempContainer.appendChild(tempTag);

        const tagWidth = tempTag.offsetWidth;
        const currentWidth = totalWidth + tagWidth + (i > 0 ? TAG_GAP : 0);

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

          const widthWithNextTag = currentWidth + TAG_GAP + nextTagWidth;

          if (widthWithNextTag <= containerWidth) {
            totalWidth = currentWidth;
            count = i + 1;
          } else {
            const remainingCount = tags.length - (i + 1);
            const tempMoreTag = document.createElement('span');
            tempMoreTag.className = styles.memoryTagMore;
            tempMoreTag.textContent = `+${remainingCount}`;
            tempContainer.appendChild(tempMoreTag);
            const moreTagWidth = tempMoreTag.offsetWidth;
            tempContainer.removeChild(tempMoreTag);

            const widthWithMore = currentWidth + TAG_GAP + moreTagWidth;

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
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        flexWrap: 'nowrap',  // 절대 두 줄로 안됨
        gap: `${TAG_GAP}px`,
        overflow: 'hidden'   // 넘치는 부분 숨김
      }}
    >
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
