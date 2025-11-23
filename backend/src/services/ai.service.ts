/**
 * AI Service - OpenAI Integration
 * 
 * This service handles all AI operations including:
 * - Product categorization
 * - Content improvement
 * - Ad copy generation
 * - Social media content creation
 * - GMC error fixing
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { prisma } from '../db/prisma';
import { z } from 'zod';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
const MAX_TOKENS_PER_DAY = parseInt(process.env.OPENAI_MAX_TOKENS_PER_DAY || '100000');

// ==================== TYPES & SCHEMAS ====================

export interface ProductData {
  id: string;
  title: string;
  description?: string;
  vendor?: string;
  productType?: string;
  tags: string[];
  price?: number;
  images?: any[];
}

// Categorization result schema
const CategorizationSchema = z.object({
  mainCategory: z.string(),
  subCategory: z.string(),
  aiTags: z.array(z.string()),
  googleCategory: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

// Content improvement schema
const ContentImprovementSchema = z.object({
  title: z.string(),
  description: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  imageAltText: z.string(),
  reasoning: z.string(),
});

// Ad copy schema
const AdCopySchema = z.object({
  headlines: z.array(z.string()),
  primaryTexts: z.array(z.string()),
  descriptions: z.array(z.string()),
  callToActions: z.array(z.string()),
});

// Social caption schema
const SocialCaptionSchema = z.object({
  caption: z.string(),
  hashtags: z.array(z.string()),
  imagePrompt: z.string(),
});

// ==================== USAGE TRACKING ====================

async function trackUsage(
  taskType: string,
  promptTokens: number,
  completionTokens: number,
  success: boolean,
  errorMessage?: string
) {
  const totalTokens = promptTokens + completionTokens;
  // Rough cost estimation (adjust based on actual pricing)
  const estimatedCost = (promptTokens * 0.00001) + (completionTokens * 0.00003);

  await prisma.aiUsage.create({
    data: {
      taskType,
      model: AI_MODEL,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCost,
      success,
      errorMessage,
    },
  });

  // Update daily summary
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.aiUsageSummary.upsert({
    where: { date: today },
    create: {
      date: today,
      totalTokens,
      totalCost: estimatedCost,
      totalRequests: 1,
      byTaskType: { [taskType]: 1 },
    },
    update: {
      totalTokens: { increment: totalTokens },
      totalCost: { increment: estimatedCost },
      totalRequests: { increment: 1 },
    },
  });
}

async function checkDailyLimit(): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const summary = await prisma.aiUsageSummary.findUnique({
    where: { date: today },
  });

  if (!summary) return true;

  return summary.totalTokens < MAX_TOKENS_PER_DAY;
}

// ==================== AI CALL WRAPPER ====================

async function callAI(
  taskType: string,
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<any>
): Promise<any> {
  // Check daily limit
  const canProceed = await checkDailyLimit();
  if (!canProceed) {
    throw new Error('Daily AI token limit reached');
  }

  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    const usage = response.usage!;

    // Track usage
    await trackUsage(taskType, usage.prompt_tokens, usage.completion_tokens, true);

    // Parse and validate response
    const parsed = JSON.parse(content || '{}');
    const validated = schema.parse(parsed);

    return validated;

  } catch (error: any) {
    logger.error(`AI call failed for ${taskType}:`, error);
    await trackUsage(taskType, 0, 0, false, error.message);
    throw error;
  }
}

// ==================== CATEGORIZATION ====================

export async function categorizeProducts(products: ProductData[]): Promise<Map<string, any>> {
  const results = new Map();

  const systemPrompt = `You are an expert e-commerce product categorization AI. 
Your task is to categorize products into a logical, SEO-friendly category structure.

Always return valid JSON with this exact structure:
{
  "mainCategory": "string",
  "subCategory": "string",
  "aiTags": ["tag1", "tag2"],
  "googleCategory": "Google Product Category string",
  "confidence": 0.95,
  "reasoning": "Brief explanation"
}

Main categories should be broad (e.g., "Clothing", "Electronics", "Home & Garden").
Sub-categories should be more specific (e.g., "Men's T-Shirts", "Smartphones", "Kitchen Appliances").
AI tags should include: style, material, color, gender, age_group, occasion, season, etc.
Google Category should match Google's product taxonomy (https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt)`;

  for (const product of products) {
    const userPrompt = `Categorize this product:

Title: ${product.title}
Description: ${product.description || 'N/A'}
Vendor: ${product.vendor || 'N/A'}
Type: ${product.productType || 'N/A'}
Tags: ${product.tags.join(', ') || 'N/A'}
Price: ${product.price ? '$' + product.price : 'N/A'}

Return ONLY valid JSON, no other text.`;

    try {
      const result = await callAI('categorize_products', systemPrompt, userPrompt, CategorizationSchema);
      results.set(product.id, result);
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      logger.error(`Failed to categorize product ${product.id}:`, error);
      results.set(product.id, null);
    }
  }

  return results;
}

// ==================== CONTENT IMPROVEMENT ====================

export async function improveProductContent(product: ProductData): Promise<any> {
  const systemPrompt = `You are an expert e-commerce copywriter and SEO specialist.
Your task is to improve product content for maximum conversions and SEO performance.

Guidelines:
- Titles should be clear, keyword-rich, but natural (not spammy)
- Descriptions should highlight benefits, features, and use cases
- Use persuasive language but remain professional
- Meta titles: 50-60 characters
- Meta descriptions: 150-160 characters
- Image alt text should be descriptive and include main keywords

Always return valid JSON with this exact structure:
{
  "title": "improved title",
  "description": "improved long description",
  "metaTitle": "SEO meta title",
  "metaDescription": "SEO meta description",
  "imageAltText": "descriptive alt text",
  "reasoning": "brief explanation of changes"
}`;

  const userPrompt = `Improve this product content:

Current Title: ${product.title}
Current Description: ${product.description || 'N/A'}
Vendor: ${product.vendor || 'N/A'}
Category: ${product.productType || 'N/A'}
Price: ${product.price ? '$' + product.price : 'N/A'}
Tags: ${product.tags.join(', ')}

Return ONLY valid JSON, no other text.`;

  return await callAI('improve_content', systemPrompt, userPrompt, ContentImprovementSchema);
}

// ==================== AD COPY GENERATION ====================

export async function generateAdCopy(
  products: ProductData[],
  platform: string,
  objective: string
): Promise<any> {
  const systemPrompt = `You are an expert digital advertising copywriter.
Create compelling ad copy optimized for ${platform} with objective: ${objective}.

Guidelines for ${platform}:
- Headlines: Clear, attention-grabbing, benefit-focused
- Primary text: Tell a story, highlight unique value
- Descriptions: Include call-to-action, urgency, social proof
- Follow platform best practices and character limits
- Avoid spam language

Return valid JSON with this structure:
{
  "headlines": ["headline 1", "headline 2", "headline 3"],
  "primaryTexts": ["text 1", "text 2"],
  "descriptions": ["desc 1", "desc 2"],
  "callToActions": ["Shop Now", "Learn More"]
}`;

  const productList = products.map(p => 
    `- ${p.title} ($${p.price || 'N/A'})`
  ).join('\n');

  const userPrompt = `Create ad copy for these products:

${productList}

Platform: ${platform}
Objective: ${objective}

Return ONLY valid JSON, no other text.`;

  return await callAI('generate_ad_copy', systemPrompt, userPrompt, AdCopySchema);
}

// ==================== GMC ERROR FIXING ====================

export async function suggestGMCFix(product: ProductData, errors: any[]): Promise<string> {
  const systemPrompt = `You are a Google Merchant Center compliance expert.
Analyze product data and GMC errors, then suggest specific fixes.

Be concise and actionable. Return a plain text explanation and fix suggestion.`;

  const errorsText = errors.map(e => `- ${e.description || e.message}`).join('\n');

  const userPrompt = `Product:
Title: ${product.title}
Description: ${product.description || 'N/A'}
Type: ${product.productType || 'N/A'}

Errors:
${errorsText}

What's wrong and how to fix it? Be specific.`;

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const content = response.choices[0].message.content || '';
  const usage = response.usage!;

  await trackUsage('fix_gmc_error', usage.prompt_tokens, usage.completion_tokens, true);

  return content;
}

// ==================== SOCIAL MEDIA CONTENT ====================

export async function generateSocialCaption(
  products: ProductData[],
  platform: string,
  theme: string
): Promise<any> {
  const systemPrompt = `You are a social media content creator specializing in ${platform}.
Create engaging, authentic content that drives engagement.

Guidelines:
- Caption: Natural, conversational, value-driven
- Hashtags: Mix of popular and niche, 5-15 tags
- Image prompt: Describe ideal visual (for AI image generation or manual creation)
- Avoid overly salesy language

Return valid JSON:
{
  "caption": "engaging caption text",
  "hashtags": ["tag1", "tag2"],
  "imagePrompt": "describe the ideal image"
}`;

  const productList = products.map(p => 
    `${p.title} ($${p.price || 'N/A'})`
  ).join(', ');

  const userPrompt = `Create a ${platform} post:

Products: ${productList}
Theme: ${theme}
Platform: ${platform}

Return ONLY valid JSON.`;

  return await callAI('generate_social_caption', systemPrompt, userPrompt, SocialCaptionSchema);
}

// ==================== BLOG POST GENERATION ====================

export async function generateBlogPost(
  topic: string,
  keywords: string[],
  products: ProductData[]
): Promise<{ title: string; content: string; excerpt: string }> {
  const systemPrompt = `You are an expert content marketing writer for e-commerce.
Create SEO-optimized, valuable blog posts that naturally mention products.

Guidelines:
- Title: Engaging, keyword-rich (50-70 characters)
- Content: 800-1200 words, informative, well-structured with H2/H3 headers
- Excerpt: Compelling summary (150-200 characters)
- Naturally integrate product mentions
- Include actionable tips and insights
- Write in a friendly, professional tone`;

  const productMentions = products.map(p => 
    `${p.title} (${p.description?.slice(0, 100) || 'product'})`
  ).join('\n');

  const userPrompt = `Write a blog post:

Topic: ${topic}
Keywords: ${keywords.join(', ')}

Products to naturally mention:
${productMentions}

Return JSON:
{
  "title": "blog title",
  "content": "full markdown content with headers",
  "excerpt": "compelling excerpt"
}`;

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
    max_tokens: 3000,
  });

  const content = response.choices[0].message.content || '{}';
  const usage = response.usage!;

  await trackUsage('generate_blog_post', usage.prompt_tokens, usage.completion_tokens, true);

  return JSON.parse(content);
}

// ==================== BATCH PROCESSING ====================

export async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<Map<string, R>>
): Promise<Map<string, R>> {
  const results = new Map<string, R>();
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    logger.info(`Processing batch ${i / batchSize + 1} of ${Math.ceil(items.length / batchSize)}`);
    
    const batchResults = await processor(batch);
    batchResults.forEach((value, key) => results.set(key, value));
    
    // Delay between batches
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}
