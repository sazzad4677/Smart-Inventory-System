import { generateNextId } from '../id.utils';
import prisma from '../../config/prisma';

describe('id.utils - generateNextId', () => {
  it('should call upsert and return formatted ID', async () => {
    (prisma.idSequence.upsert as jest.Mock).mockResolvedValue({ id: 'product_id', seq: 5 });

    const result = await generateNextId('product_id', 'PRD');

    expect(prisma.idSequence.upsert).toHaveBeenCalledWith({
      where: { id: 'product_id' },
      update: { seq: { increment: 1 } },
      create: { id: 'product_id', seq: 1 },
    });
    expect(result).toBe('PRD-0005');
  });
});
