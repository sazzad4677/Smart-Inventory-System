import { Types } from 'mongoose';

/**
 * It takes the last 6 characters of the Mongoose _id, converts them to uppercase,
 * and prefixes with #.
 */
export const formatOrderId = (id: string | Types.ObjectId): string => {
  const idStr = id.toString();
  return `#${idStr.slice(-6).toUpperCase()}`;
};
