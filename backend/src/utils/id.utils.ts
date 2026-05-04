import prisma from '../config/prisma';

/**
 * Increments the sequence in the database and returns a formatted ID string.
 * @param idName The name of the sequence (e.g., 'product_id')
 * @param prefix The prefix for the ID (e.g., 'PRD')
 * @returns A formatted ID string like 'PRD-0001'
 */
export const generateNextId = async (idName: string, prefix: string): Promise<string> => {
  const sequence = await prisma.idSequence.upsert({
    where: { id: idName },
    update: { seq: { increment: 1 } },
    create: { id: idName, seq: 1 },
  });

  const paddedSeq = sequence.seq.toString().padStart(4, '0');
  return `${prefix}-${paddedSeq}`;
};
