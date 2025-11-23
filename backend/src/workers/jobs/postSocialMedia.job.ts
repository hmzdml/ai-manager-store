/**
 * Post Social Media Job
 * Posts scheduled social media content to various platforms
 */

import { prisma } from '../../db/prisma';
import { logger } from '../../utils/logger';
import { generateSocialCaption, ProductData } from '../../services/ai.service';

export async function postSocialMediaJob(data: any) {
  const startTime = Date.now();
  
  try {
    logger.info('Starting social media posting...');
    
    const now = new Date();
    
    // Find posts scheduled for now or past
    const scheduledPosts = await prisma.socialPost.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: now,
        },
      },
      take: 10,
    });
    
    if (scheduledPosts.length === 0) {
      logger.info('No posts scheduled for now');
      
      // Check if we need to generate new posts
      await generateNewPosts();
      
      return { success: true, posted: 0 };
    }
    
    let postedCount = 0;
    let failedCount = 0;
    
    for (const post of scheduledPosts) {
      try {
        // TODO: Implement actual platform API posting
        // For now, mock the posting
        
        logger.info(`Posting to ${post.platform}: ${post.caption.slice(0, 50)}...`);
        
        // Mock: Simulate successful posting
        const mockPlatformPostId = `${post.platform}_${Date.now()}`;
        
        await prisma.socialPost.update({
          where: { id: post.id },
          data: {
            status: 'posted',
            postedAt: new Date(),
            platformPostId: mockPlatformPostId,
          },
        });
        
        postedCount++;
        
        // Log activity
        await prisma.activityLog.create({
          data: {
            module: 'social',
            action: 'post',
            status: 'success',
            message: `Posted to ${post.platform}`,
            metadata: { postId: post.id, platform: post.platform },
          },
        });
        
      } catch (error: any) {
        logger.error(`Failed to post ${post.id} to ${post.platform}:`, error);
        
        await prisma.socialPost.update({
          where: { id: post.id },
          data: {
            status: 'failed',
            error: error.message,
          },
        });
        
        failedCount++;
      }
    }
    
    const duration = Date.now() - startTime;
    
    await prisma.activityLog.create({
      data: {
        module: 'social',
        action: 'post_batch',
        status: postedCount > 0 ? 'success' : 'warning',
        message: `Posted ${postedCount} posts, ${failedCount} failed`,
        duration,
        metadata: { postedCount, failedCount },
      },
    });
    
    logger.info(`✓ Social posting completed: ${postedCount} posted in ${duration}ms`);
    
    return { success: true, posted: postedCount, failed: failedCount, duration };
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('Social posting job failed:', error);
    
    await prisma.activityLog.create({
      data: {
        module: 'social',
        action: 'post_batch',
        status: 'error',
        message: `Social posting failed: ${error.message}`,
        duration,
      },
    });
    
    throw error;
  }
}

async function generateNewPosts() {
  try {
    // Check content calendars
    const calendars = await prisma.contentCalendar.findMany({
      where: { active: true },
    });
    
    for (const calendar of calendars) {
      // Check if we need to schedule posts for this platform
      const upcomingPosts = await prisma.socialPost.count({
        where: {
          platform: calendar.platform,
          status: 'scheduled',
          scheduledFor: {
            gte: new Date(),
          },
        },
      });
      
      // If we have less than 3 upcoming posts, generate more
      if (upcomingPosts < 3) {
        logger.info(`Generating new posts for ${calendar.platform}`);
        
        // Get random products to feature
        const products = await prisma.product.findMany({
          where: { status: 'active' },
          take: 3,
          orderBy: { shopifyUpdatedAt: 'desc' },
        });
        
        const productData: ProductData[] = products.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description || undefined,
          price: p.price || undefined,
          images: p.images,
          tags: p.tags,
        }));
        
        // Generate caption with AI
        const themes = calendar.themes.length > 0 
          ? calendar.themes 
          : ['product_showcase', 'tips', 'promotion'];
        
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        
        const caption = await generateSocialCaption(
          productData,
          calendar.platform,
          randomTheme
        );
        
        // Schedule post for next preferred time
        const nextScheduleTime = getNextScheduleTime(calendar.preferredTimes);
        
        await prisma.socialPost.create({
          data: {
            platform: calendar.platform,
            caption: caption.caption,
            hashtags: caption.hashtags,
            productLinks: products.map(p => p.id),
            status: 'scheduled',
            scheduledFor: nextScheduleTime,
            aiGenerated: true,
            aiPrompt: `Theme: ${randomTheme}, Platform: ${calendar.platform}`,
          },
        });
        
        logger.info(`Generated post for ${calendar.platform} scheduled at ${nextScheduleTime}`);
      }
    }
  } catch (error: any) {
    logger.error('Failed to generate new posts:', error);
  }
}

function getNextScheduleTime(preferredTimes: string[]): Date {
  const now = new Date();
  const today = new Date(now);
  
  // Try to find next preferred time today
  for (const timeStr of preferredTimes) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const scheduleTime = new Date(today);
    scheduleTime.setHours(hours, minutes, 0, 0);
    
    if (scheduleTime > now) {
      return scheduleTime;
    }
  }
  
  // If no time today, schedule for first time tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const firstTime = preferredTimes[0] || '09:00';
  const [hours, minutes] = firstTime.split(':').map(Number);
  tomorrow.setHours(hours, minutes, 0, 0);
  
  return tomorrow;
}
