import { formatOrderId } from '../formatOrderId';

describe('formatOrderId', () => {
  it('should format a string ID', () => {
    const id = '507f1f77bcf86cd799439011';
    const result = formatOrderId(id);
    expect(result).toBe('#439011');
  });

  it('should handle short IDs gracefully if implementation allows', () => {
    const id = 'abc';
    // Depending on slice(-6), it might return #ABC
    const result = formatOrderId(id);
    expect(result).toBe('#ABC');
  });
});
