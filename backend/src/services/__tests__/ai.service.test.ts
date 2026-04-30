import {
  generateDashboardInsights,
  buildInsightPrompt,
  DashboardInsightsParams,
} from '../ai.service';

// ─── Mock Setup ───────────────────────────────────────────────────────────────

const mockCreateCompletion = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreateCompletion,
      },
    },
  }));
});

jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockStats: DashboardInsightsParams = {
  totalOrdersToday: 10,
  lowStockCount: 5,
  revenueToday: 150000,
  totalProducts: 100,
  orderTrends: [{ date: '2024-04-10', count: 10, revenue: 150000 }],
  categoryDistribution: [{ name: 'Electronics', value: 40 }],
  pendingVsCompleted: { Pending: 2, Completed: 8 },
  productSummary: [],
};

const makeApiError = (status: number, message = 'API Error') => {
  const error: any = new Error(message);
  error.status = status;
  return error;
};

const mockSuccessResponse = (content: string) => ({
  choices: [{ message: { content } }],
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AI Service - generateDashboardInsights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Happy Path ──────────────────────────────────────────────────────────────

  describe('Success cases', () => {
    it('returns trimmed insights from a valid AI response', async () => {
      const rawContent = '  🚀 Sales are up!\n⚠️ Restock batteries.\n💡 Add stock.  ';
      const expected = rawContent.trim();

      mockCreateCompletion.mockResolvedValue(mockSuccessResponse(rawContent));

      const result = await generateDashboardInsights(mockStats);

      expect(result).toBe(expected);
      expect(mockCreateCompletion).toHaveBeenCalledTimes(1);
    });

    it('calls the AI API with correct model and parameters', async () => {
      mockCreateCompletion.mockResolvedValue(mockSuccessResponse('insight'));

      await generateDashboardInsights(mockStats);

      expect(mockCreateCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'openai/gpt-oss-120b:free',
          temperature: 0.4,
          max_tokens: 512,
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user' }),
          ]),
        }),
      );
    });

    it('includes dashboard stats in the user prompt', async () => {
      mockCreateCompletion.mockResolvedValue(mockSuccessResponse('insight'));

      await generateDashboardInsights(mockStats);

      const calledWith = mockCreateCompletion.mock.calls[0][0];
      const userMessage = calledWith.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('100'); // totalProducts
      expect(userMessage.content).toContain('5'); // lowStockCount
      expect(userMessage.content).toContain('10'); // totalOrdersToday
      expect(userMessage.content).toContain('1500.00'); // revenueToday / 100
      expect(userMessage.content).toContain('Electronics');
      expect(userMessage.content).toContain('2024-04-10');
    });
  });

  // ── Error Handling ──────────────────────────────────────────────────────────

  describe('Error handling - HTTP status codes', () => {
    it.each([
      [429, 'AI Rate Limit Exceeded'],
      [401, 'Invalid AI API Key'],
      [404, 'AI Model not found'],
      [500, 'AI provider encountered an internal error'],
      [503, 'AI service is temporarily unavailable'],
    ])('throws descriptive error for status %i', async (status, expectedMessage) => {
      mockCreateCompletion.mockRejectedValue(makeApiError(status));

      await expect(generateDashboardInsights(mockStats)).rejects.toThrow(expectedMessage);
    });

    it('throws generic error for unknown status codes', async () => {
      mockCreateCompletion.mockRejectedValue(makeApiError(418, 'I am a teapot'));

      await expect(generateDashboardInsights(mockStats)).rejects.toThrow(
        'Failed to generate AI insights',
      );
    });

    it('throws generic error for non-HTTP errors (no status field)', async () => {
      mockCreateCompletion.mockRejectedValue(new Error('Network timeout'));

      await expect(generateDashboardInsights(mockStats)).rejects.toThrow(
        'Failed to generate AI insights',
      );
    });

    it('throws generic error for completely unknown error objects', async () => {
      mockCreateCompletion.mockRejectedValue({ message: 'Weird error', code: 'UNKNOWN' });

      await expect(generateDashboardInsights(mockStats)).rejects.toThrow(
        'Failed to generate AI insights',
      );
    });
  });

  // ── Empty / Null Response ───────────────────────────────────────────────────

  describe('Empty or malformed AI responses', () => {
    it('throws when AI returns empty string content', async () => {
      mockCreateCompletion.mockResolvedValue(mockSuccessResponse(''));

      await expect(generateDashboardInsights(mockStats)).rejects.toThrow(
        'AI returned an empty response',
      );
    });

    it('throws when AI returns whitespace-only content', async () => {
      mockCreateCompletion.mockResolvedValue(mockSuccessResponse('   \n\t  '));

      await expect(generateDashboardInsights(mockStats)).rejects.toThrow(
        'AI returned an empty response',
      );
    });

    it('handles missing message content gracefully (null)', async () => {
      mockCreateCompletion.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      await expect(generateDashboardInsights(mockStats)).rejects.toThrow(
        'AI returned an empty response',
      );
    });

    it('handles missing choices array gracefully', async () => {
      mockCreateCompletion.mockResolvedValue({ choices: [] });

      await expect(generateDashboardInsights(mockStats)).rejects.toThrow(
        'AI returned an empty response',
      );
    });
  });

  // ── Edge Cases: Input Stats ─────────────────────────────────────────────────

  describe('Edge cases - input stats', () => {
    it('handles zero values in stats without errors', async () => {
      const zeroStats: DashboardInsightsParams = {
        totalOrdersToday: 0,
        lowStockCount: 0,
        revenueToday: 0,
        totalProducts: 0,
        orderTrends: [],
        categoryDistribution: [],
      };

      mockCreateCompletion.mockResolvedValue(mockSuccessResponse('🚀 All zeros, take action!'));

      const result = await generateDashboardInsights(zeroStats);

      expect(result).toBe('🚀 All zeros, take action!');
    });

    it('handles empty orderTrends gracefully', async () => {
      mockCreateCompletion.mockResolvedValue(mockSuccessResponse('insight'));

      await generateDashboardInsights({ ...mockStats, orderTrends: [] });

      const calledWith = mockCreateCompletion.mock.calls[0][0];
      const userMessage = calledWith.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('No trend data available');
    });

    it('handles empty categoryDistribution gracefully', async () => {
      mockCreateCompletion.mockResolvedValue(mockSuccessResponse('insight'));

      await generateDashboardInsights({ ...mockStats, categoryDistribution: [] });

      const calledWith = mockCreateCompletion.mock.calls[0][0];
      const userMessage = calledWith.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('No category data available');
    });

    it('handles undefined date in orderTrends', async () => {
      const statsWithUndefinedDate: DashboardInsightsParams = {
        ...mockStats,
        orderTrends: [{ date: undefined, count: 5, revenue: 50000 }],
      };

      mockCreateCompletion.mockResolvedValue(mockSuccessResponse('insight'));

      await generateDashboardInsights(statsWithUndefinedDate);

      const calledWith = mockCreateCompletion.mock.calls[0][0];
      const userMessage = calledWith.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('Unknown date');
    });

    it('correctly converts revenueToday from cents to dollars in prompt', async () => {
      mockCreateCompletion.mockResolvedValue(mockSuccessResponse('insight'));

      await generateDashboardInsights({ ...mockStats, revenueToday: 99999 });

      const calledWith = mockCreateCompletion.mock.calls[0][0];
      const userMessage = calledWith.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('999.99');
    });

    it('handles very large revenue values without overflow errors', async () => {
      mockCreateCompletion.mockResolvedValue(mockSuccessResponse('insight'));

      await expect(
        generateDashboardInsights({ ...mockStats, revenueToday: Number.MAX_SAFE_INTEGER }),
      ).resolves.toBe('insight');
    });
  });
});

// ─── buildInsightPrompt Unit Tests ────────────────────────────────────────────

describe('buildInsightPrompt', () => {
  it('includes all required sections in the prompt', () => {
    const prompt = buildInsightPrompt(mockStats);

    expect(prompt).toContain('Total Products: 100');
    expect(prompt).toContain('Low Stock Items: 5');
    expect(prompt).toContain('Orders Today: 10');
    expect(prompt).toContain('Revenue Today: $1500.00');
    expect(prompt).toContain('Electronics');
    expect(prompt).toContain('2024-04-10');
    expect(prompt).toContain('3 bullet points');
  });

  it('falls back to "No trend data available" when orderTrends is empty', () => {
    const prompt = buildInsightPrompt({ ...mockStats, orderTrends: [] });

    expect(prompt).toContain('No trend data available');
    expect(prompt).not.toContain('2024-04-10');
  });

  it('falls back to "No category data available" when categoryDistribution is empty', () => {
    const prompt = buildInsightPrompt({ ...mockStats, categoryDistribution: [] });

    expect(prompt).toContain('No category data available');
    expect(prompt).not.toContain('Electronics');
  });

  it('uses "Unknown date" when trend date is undefined', () => {
    const prompt = buildInsightPrompt({
      ...mockStats,
      orderTrends: [{ date: undefined, count: 3, revenue: 30000 }],
    });

    expect(prompt).toContain('Unknown date');
  });

  it('handles multiple trends and categories correctly', () => {
    const stats: DashboardInsightsParams = {
      ...mockStats,
      orderTrends: [
        { date: '2024-04-08', count: 5, revenue: 50000 },
        { date: '2024-04-09', count: 8, revenue: 80000 },
        { date: '2024-04-10', count: 12, revenue: 120000 },
      ],
      categoryDistribution: [
        { name: 'Electronics', value: 40 },
        { name: 'Clothing', value: 25 },
        { name: 'Books', value: 15 },
      ],
    };

    const prompt = buildInsightPrompt(stats);

    expect(prompt).toContain('2024-04-08');
    expect(prompt).toContain('2024-04-09');
    expect(prompt).toContain('2024-04-10');
    expect(prompt).toContain('Clothing');
    expect(prompt).toContain('Books');
  });
});
