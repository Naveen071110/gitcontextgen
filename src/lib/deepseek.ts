import OpenAI from 'openai';

/**
 * Exclusive DeepSeek AI Client Integration
 * Endpoint: https://api.deepseek.com
 * Model: deepseek-chat
 * Authentication: DEEPSEEK_API_KEY only
 */
export const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || 'dummy-key-for-sdk-init',
  dangerouslyAllowBrowser: true,
});
