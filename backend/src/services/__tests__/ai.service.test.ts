import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateDashboardInsights } from '../ai.service';

// Stable mock functions that we can reference in tests
const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
  };
});

describe('AI Service', () => {
  const mockStats = {
    totalOrdersToday: 10,
    lowStockCount: 5,
    revenueToday: 150000,
    totalProducts: 100,
    orderTrends: [{ date: '2024-04-10', count: 10, revenue: 150000 }],
    categoryDistribution: [{ name: 'Electronics', value: 40 }],
    pendingVsCompleted: { Pending: 2, Completed: 8 },
    productSummary: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully generate insights from dashboard stats', async () => {
    const mockResponseText =
      '🚀 Sales are up! ⚠️ Restock batteries. 💡 Add more stock to Electronics.';

    // Configure the stable mock function
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => mockResponseText,
      },
    });

    const insights = await generateDashboardInsights(mockStats);

    expect(mockGenerateContent).toHaveBeenCalled();
    expect(insights).toBe(mockResponseText);
  });

  it('should throw an error if AI generation fails', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Down'));

    await expect(generateDashboardInsights(mockStats)).rejects.toThrow(
      'Failed to generate AI insights',
    );
  });
});
