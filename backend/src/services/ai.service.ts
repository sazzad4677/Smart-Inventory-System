import OpenAI from 'openai';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export interface OrderTrend {
  date: string | undefined;
  count: number;
  revenue: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
}

export interface PendingVsCompleted {
  Pending: number;
  Completed: number;
}

export interface ProductSummary {
  name: string;
  stock_quantity: number;
  status: string;
}

export interface DashboardInsightsParams {
  totalOrdersToday: number;
  lowStockCount: number;
  revenueToday: number;
  totalProducts: number;
  orderTrends: OrderTrend[];
  categoryDistribution: CategoryDistribution[];
  pendingVsCompleted?: PendingVsCompleted;
  productSummary?: ProductSummary[];
}

let client: OpenAI | null = null;

/**
 * Initializes and returns the OpenAI client as a singleton.
 */
export const getClient = (): OpenAI => {
  if (!client || process.env.NODE_ENV === 'test') {
    client = new OpenAI({
      apiKey: config.ai.openrouterKey,
      baseURL: config.ai.baseURL,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/sazzad4677/Smart-Inventory-System',
        'X-Title': 'Smart Inventory System',
      },
    });
  }
  return client;
};

/**
 * Constructs a prompt for the AI based on current dashboard statistics.
 */
export const buildInsightPrompt = (stats: DashboardInsightsParams): string => {
  const revenueFormatted = (stats.revenueToday / 100).toFixed(2);

  const trendsSection =
    stats.orderTrends.length > 0
      ? stats.orderTrends
          .map(
            (t) =>
              `- ${t.date ?? 'Unknown date'}: ${t.count} orders, $${(t.revenue / 100).toFixed(2)}`,
          )
          .join('\n')
      : '- No trend data available';

  const categorySection =
    stats.categoryDistribution.length > 0
      ? stats.categoryDistribution.map((c) => `- ${c.name}: ${c.value} products`).join('\n')
      : '- No category data available';

  return `
You are an expert Inventory Analyst. Analyze the following dashboard data for a Smart Inventory System and provide 3 concise, highly actionable business insights or "Magic Tips" for the manager.

Inventory Snapshot:
- Total Products: ${stats.totalProducts}
- Low Stock Items: ${stats.lowStockCount}
- Orders Today: ${stats.totalOrdersToday}
- Revenue Today: $${revenueFormatted}

Recent Trends (Last 7 Days):
${trendsSection}

Category Breakdown:
${categorySection}

Requirements:
1. Provide exactly 3 bullet points.
2. Use simple, direct language.
3. Focus on urgency, growth, or optimization.
4. Avoid bold text. Start each point with an emoji.
5. Keep it under 50 words.
  `.trim();
};

const AI_ERRORS: Record<number, string> = {
  429: 'AI Rate Limit Exceeded. Please wait before retrying.',
  401: 'Invalid AI API Key. Please verify your OpenRouter credentials in the configuration.',
  404: 'AI Model not found or your account does not have access to it. Check the model name in your config.',
  500: 'AI provider encountered an internal error. Please try again later.',
  503: 'AI service is temporarily unavailable. Please try again later.',
};

/**
 * Centralized error handler for AI-related operations.
 */
const handleAIError = (error: unknown): never => {
  logger.error('❌ AI Insight Generation Failed:', error);

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status;
    const message = AI_ERRORS[status];
    if (message) throw new Error(message);
  }

  throw new Error('Failed to generate AI insights. Please try again later.');
};

/**
 * Communicates with the AI provider to generate actionable insights based on dashboard data.
 */
export const generateDashboardInsights = async (
  stats: DashboardInsightsParams,
): Promise<string> => {
  if (!stats) {
    throw new Error('Dashboard stats are required to generate insights.');
  }

  try {
    const prompt = buildInsightPrompt(stats);
    const openai = getClient();

    const response = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [
        { role: 'system', content: 'You are an inventory analysis assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 512,
    });

    const text = response.choices[0]?.message?.content ?? '';

    if (!text.trim()) {
      throw new Error('AI returned an empty response. Please try again.');
    }

    return text.trim();
  } catch (error: unknown) {
    if (error instanceof Error) {
      const isCustomError =
        error.message === 'AI returned an empty response. Please try again.' ||
        error.message === 'Dashboard stats are required to generate insights.' ||
        Object.values(AI_ERRORS).includes(error.message) ||
        error.message === 'Failed to generate AI insights. Please try again later.';

      if (isCustomError) {
        throw error;
      }
    }

    return handleAIError(error);
  }
};
