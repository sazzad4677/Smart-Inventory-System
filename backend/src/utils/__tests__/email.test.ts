import nodemailer from 'nodemailer';

// Define the mock function outside so it's accessible
const mockSendMail = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: (...args: any[]) => mockSendMail(...args),
  }),
}));

import { sendEmail, sendInvitationEmail } from '../email';

describe('Email Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      mockSendMail.mockResolvedValue({ messageId: '123' });

      const options = {
        to: 'test@test.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      };

      const result = await sendEmail(options);
      expect(result.messageId).toBe('123');
      expect(mockSendMail).toHaveBeenCalled();
    });

    it('should throw error if sendMail fails', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(sendEmail({ to: 'a@a.com', subject: 's', html: 'h' })).rejects.toThrow(
        'SMTP Error',
      );
    });

    it('should handle non-Error objects in catch block', async () => {
      mockSendMail.mockRejectedValue('String Error');
      await expect(sendEmail({ to: 'a@a.com', subject: 's', html: 'h' })).rejects.toBe(
        'String Error',
      );
    });
  });

  describe('sendInvitationEmail', () => {
    it('should send an invitation email with correct link', async () => {
      mockSendMail.mockResolvedValue({ messageId: '123' });

      await sendInvitationEmail('test@test.com', 'token123');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@test.com',
          html: expect.stringContaining('signup?token=token123'),
        }),
      );
    });
  });
});
