/**
 * It takes the last 6 characters of the ID, converts them to uppercase,
 * and prefixes with #.
 */
export const formatOrderId = (id: string): string => {
  return `#${id.slice(-6).toUpperCase()}`;
};
