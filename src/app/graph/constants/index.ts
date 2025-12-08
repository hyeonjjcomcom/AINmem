import type { FilterTag } from '../types';

// Filter Tags
export const FILTER_TAGS: FilterTag[] = [
  { id: 'All', label: 'All' },
  { id: 'Exploration', label: 'Exploration' },
  { id: 'Inspiration', label: 'Inspiration' },
  { id: 'Refinement', label: 'Refinement' },
  { id: 'Solution', label: 'Solution' },
  { id: 'Empathy', label: 'Empathy' },
  { id: 'Play', label: 'Play' },
  { id: 'Others', label: 'Others' }
];

// D3 Visualization Configuration
export const D3_CONFIG = {
  // SVG dimensions
  MIN_WIDTH: 800,
  HEIGHT: 600,

  // Node radius scale
  NODE_RADIUS: {
    MIN: 12,
    MAX: 35,
  },

  // Node colors (count-based gradient)
  NODE_COLORS: {
    MIN: '#8b5cf6', // 중간 보라
    MAX: '#5B21B6', // 진한 보라
  },

  // Force simulation
  FORCES: {
    LINK_DISTANCE: 150,
    CHARGE_STRENGTH: -200,
    COLLISION_RADIUS_PADDING: 10,
  },

  // Link stroke width scale
  LINK_STROKE: {
    MIN: 1.5,
    MAX: 8,
  },

  // Zoom
  ZOOM: {
    MIN_SCALE: 0.1,
    MAX_SCALE: 10,
  },

  // Drag
  DRAG: {
    ALPHA_TARGET: 0.3,
  },

  // Center animation
  CENTER_ANIMATION: {
    SCALE: 1.03,
    DURATION: 200,
  },
} as const;