import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for Expo web
}); 