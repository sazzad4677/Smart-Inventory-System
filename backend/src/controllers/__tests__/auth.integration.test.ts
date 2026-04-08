import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import User from '../../models/user.model';

describe('Auth API Integration', () => {
  const registerPayload = {
    email: 'newuser@example.com',
    password: 'Password123!', // Must meet regex: uppercase, lowercase, number
  };

  describe('POST /api/auth/signup', () => {
    it('should successfully register a new user and return 201', async () => {
      const res = await request(app).post('/api/auth/signup').send(registerPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should fail if the email is already in use', async () => {
      // Seed a user first
      await User.create({
        email: registerPayload.email,
        password_hash: 'HashedPassword123!',
      });

      const res = await request(app).post('/api/auth/signup').send(registerPayload);

      // Note: Backend returns 409 Conflict for duplicate emails
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should verify password encryption in the database', async () => {
      const plainPassword = 'EncryptionTest1!';
      await request(app).post('/api/auth/signup').send({
        email: 'encrypt@example.com',
        password: plainPassword,
      });

      // Fetch user directly from DB including the password field
      const user = await User.findOne({ email: 'encrypt@example.com' }).select('+password_hash');

      expect(user).toBeTruthy();
      expect(user?.password_hash).not.toBe(plainPassword);
      // Verify it's actually a bcrypt hash (starts with $2)
      expect(user?.password_hash).toMatch(/^\$2[ayb]\$.+/);
    });
  });

  describe('POST /api/auth/login', () => {
    const loginCredentials = {
      email: 'login-test@example.com',
      password: 'LoginPassword123!',
    };

    beforeEach(async () => {
      // Seed a test user. User.create triggers the pre-save hook for hashing.
      await User.create({
        email: loginCredentials.email,
        password_hash: loginCredentials.password,
      });
    });

    it('should successfully log in and return 200 with a token', async () => {
      const res = await request(app).post('/api/auth/login').send(loginCredentials);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(typeof res.body.data.accessToken).toBe('string');
    });

    it('should return 401 Unauthorized for incorrect password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: loginCredentials.email,
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });
  });
});
