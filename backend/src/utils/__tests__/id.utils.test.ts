import Sequence from '../../models/sequence.model';
import { generateNextId } from '../id.utils';

// Mock model
jest.mock('../../models/sequence.model');

describe('id.utils - generateNextId', () => {
  it('should call findOneAndUpdate and return formatted ID', async () => {
    const mockSequence = { id: 'test_id', seq: 42 };
    (Sequence.findOneAndUpdate as jest.Mock).mockResolvedValue(mockSequence);

    const result = await generateNextId('test_id', 'TST');

    expect(Sequence.findOneAndUpdate).toHaveBeenCalledWith(
      { id: 'test_id' },
      { $inc: { seq: 1 } },
      expect.any(Object),
    );
    expect(result).toBe('TST-0042');
  });
});
