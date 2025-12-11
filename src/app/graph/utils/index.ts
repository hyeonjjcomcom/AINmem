// Excluded constants from graph visualization
const EXCLUDED_CONSTANTS = ['x', 'y', 'u', 'm', 's'];

/**
 * Check if a constant should be excluded from the graph
 */
export const isExcludedConstant = (constant: string): boolean => {
  return EXCLUDED_CONSTANTS.includes(constant);
};

/**
 * Filter valid constants (exclude common variables)
 */
export const filterValidConstants = (constants: string[]): string[] => {
  return constants.filter(c => !isExcludedConstant(c));
};
