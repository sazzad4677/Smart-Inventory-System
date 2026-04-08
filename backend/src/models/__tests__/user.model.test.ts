import User from '../user.model';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Mock bcryptjs
jest.mock('bcryptjs');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mongoose.set('bufferCommands', false);
  });

  describe('pre-save hook', () => {
    it('should hash password if modified', async () => {
      const user = new User({
        email: 'test@example.com',
        password_hash: 'plainpassword',
        role: 'Manager',
      });

      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      // We need to bypass the actual DB save but trigger the hook
      // In Mongoose, save() triggers the hooks even if it fails later due to no connection
      // Our global setup mocks mongoose.connect but not the internal save.
      // We can use validate() or just mock the save behavior.

      // We want to test that the HOOK runs on save.

      // However, we want to test that the HOOK runs on save.
      // Let's rely on Mongoose's internal hook triggering.
      try {
        await user.save();
      } catch (e) {
        // Ignore "cannot connect" errors if any
      }

      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 'salt');
      expect(user.password_hash).toBe('hashedpassword');
    });

    it('should not hash password if not modified', async () => {
      const user = new User({
        email: 'test@example.com',
        password_hash: 'alreadyhashed',
      });

      // Mock isModified to return false
      jest.spyOn(user, 'isModified').mockReturnValue(false);

      try {
        await user.save();
      } catch (e) {}

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('comparePassword instance method', () => {
    it('should correctly wrap bcrypt.compare', async () => {
      const user = new User({
        password_hash: 'hashed_val',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const isMatch = await user.comparePassword('plain_val');

      expect(bcrypt.compare).toHaveBeenCalledWith('plain_val', 'hashed_val');
      expect(isMatch).toBe(true);
    });
  });
});
