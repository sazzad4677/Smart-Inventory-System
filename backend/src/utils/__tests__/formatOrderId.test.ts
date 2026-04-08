import { formatOrderId } from '../formatOrderId';
import mongoose from 'mongoose';

describe('formatOrderId', () => {
  it('should format a string ID', () => {
    const id = '507f1f77bcf86cd799439011';
    const result = formatOrderId(id);
    expect(result).toBe('#439011');
  });

  it('should format a mongoose ObjectId', () => {
    const id = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
    const result = formatOrderId(id);
    expect(result).toBe('#439011');
  });
});
