import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config';
import { logger } from '../utils/logger';

let model: any;

const getModel = () => {
  if (!model || process.env.NODE_ENV === 'test') {
    const genAI = new GoogleGenerativeAI(config.ai.googleKey);
    // Use gemini-1.5-flash as it is currently the most stable free tier model
    // Fallback logic can be added here if needed
    const modelName = config.ai.model || 'gemini-1.5-flash';
    model = genAI.getGenerativeModel({ model: modelName });
  }
  return model;
};

export interface DashboardInsightsParams {
  totalOrdersToday: number;
  lowStockCount: number;
  revenueToday: number;
  totalProducts: number;
  orderTrends: Array<{ date: string | undefined; count: any; revenue: any }>;
  categoryDistribution: Array<{ name: string; value: any }>;
  [key: string]: any;
}

export const generateDashboardInsights = async (stats: DashboardInsightsParams) => {
  try {
    const prompt = `
      You are an expert Inventory Analyst. Analyze the following dashboard data for a Smart Inventory System and provide 3 concise, highly actionable business insights or "Magic Tips" for the manager.
      
      Inventory Snapshot:
      - Total Products: ${stats.totalProducts}
      - Low Stock Items: ${stats.lowStockCount}
      - Orders Today: ${stats.totalOrdersToday}
      - Revenue Today: $${(stats.revenueToday / 100).toFixed(2)}
      
      Recent Trends (Last 7 Days):
      ${stats.orderTrends.map((t) => `- ${t.date}: ${t.count} orders, $${(t.revenue / 100).toFixed(2)}`).join('\n')}
      
      Category Breakdown:
      ${stats.categoryDistribution.map((c) => `- ${c.name}: ${c.value} products`).join('\n')}

      Requirements:
      1. Provide exactly 3 bullet points.
      2. Use simple, direct language.
      3. Focus on urgency, growth, or optimization.
      4. Avoid bold text. Start each point with an emoji.
      5. Keep it under 50 words.
    `;

    const aiModel = getModel();
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error: any) {
    logger.error('❌ AI Insight Generation Failed:', error);

    // Detailed error handling for quota issues
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error(
        'AI Quota Exceeded. Please ensure you have a billing account linked to your project in Google Cloud Console, even for the Free Tier.',
      );
    }

    if (error.message?.includes('404')) {
      throw new Error(
        'AI Model not found. This may be a regional restriction or temporary Google API issue.',
      );
    }

    throw new Error('Failed to generate AI insights. Please try again later.');
  }
};
