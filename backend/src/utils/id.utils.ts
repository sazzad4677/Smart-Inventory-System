import Sequence from '../models/sequence.model';

/**
 * Increments the sequence in the database and returns a formatted ID string.
 * @param idName The name of the sequence (e.g., 'product_id')
 * @param prefix The prefix for the ID (e.g., 'PRD')
 * @returns A formatted ID string like 'PRD-0001'
 */
export const generateNextId = async (idName: string, prefix: string): Promise<string> => {
  const sequence = await Sequence.findOneAndUpdate(
    { id: idName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  const paddedSeq = sequence.seq.toString().padStart(4, '0');
  return `${prefix}-${paddedSeq}`;
};
