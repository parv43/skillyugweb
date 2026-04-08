#!/usr/bin/env node

/**
 * Phase 3: Blog Thumbnail Generation Script
 * Downloads Unsplash images and converts to optimized WebP thumbnails
 * 
 * Usage: node scripts/generate-blog-thumbnails.mjs
 */

import sharp from 'sharp';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.dirname(__dirname);
const TARGET_DIR = path.join(PROJECT_ROOT, 'public', 'blog-thumbnails');

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Map of blog slugs to Unsplash photo IDs
const UNSPLASH_PHOTOS = {
  'best-ai-tools-for-students-2026': 'photo-1620712943543-bcc4688e7485',
  'what-is-ai-for-students': 'photo-1677442136019-21780ecad995',
  'how-ai-helps-students-study-faster': 'photo-1434030216411-0b793f4b4173',
  'ai-learning-for-kids-guide': 'photo-1503676260728-1c00da094a0b',
  'how-to-learn-ai-as-a-school-student': 'photo-1516321497487-e288fb19713f',
  'ai-learning-roadmap-for-beginners': 'photo-1581091226825-a6a2a5aee158',
  'ai-basics-for-class-6-12': 'photo-1620712943543-bcc4688e7485',
  'getting-started-with-ai-tools': 'photo-1434030216411-0b793f4b4173',
  'how-to-use-chatgpt-for-homework': 'photo-1677442136019-21780ecad995',
  'how-to-use-canva-ai-for-projects': 'photo-1561070791-2526d30994b5',
  'best-ai-tools-for-assignments': 'photo-1503676260728-1c00da094a0b',
  'ai-tools-for-presentations': 'photo-1552664730-d307ca884978',
  'future-skills-students-must-learn': 'photo-1581091226825-a6a2a5aee158',
  'why-ai-skills-matter-for-kids': 'photo-1677442136019-21780ecad995',
  'careers-in-ai-for-students': 'photo-1620712943543-bcc4688e7485',
  'importance-of-ai-in-education': 'photo-1581091226825-a6a2a5aee158',
  'what-happens-in-skillyug-bootcamp': 'photo-1434030216411-0b793f4b4173',
  'student-project-showcase': 'photo-1503676260728-1c00da094a0b',
  'student-transformation-stories': 'photo-1516321497487-e288fb19713f',
  'is-ai-bootcamp-worth-it': 'photo-1677442136019-21780ecad995',
};

// Helper function to download image
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Main function
async function generateThumbnails() {
  console.log('🎨 Phase 3: Blog Thumbnail Generation');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  let success = 0;
  let failed = 0;

  for (const [slug, photoId] of Object.entries(UNSPLASH_PHOTOS)) {
    try {
      const filename = `${slug}.webp`;
      const filepath = path.join(TARGET_DIR, filename);
      const url = `https://images.unsplash.com/${photoId}?q=80&w=800&auto=format&fit=crop&crop=faces&h=600`;

      process.stdout.write(`📥 Downloading: ${slug}... `);

      // Download image
      const imageBuffer = await downloadImage(url);

      // Convert to WebP
      await sharp(imageBuffer)
        .resize(800, 600, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 75 })
        .toFile(filepath);

      // Get file size
      const stats = fs.statSync(filepath);
      const sizeKB = (stats.size / 1024).toFixed(1);

      console.log(`✅ (${sizeKB} KB)`);
      success++;
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      failed++;
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 Generation Complete!');
  console.log(`   ✅ Success: ${success} files`);
  console.log(`   ❌ Failed: ${failed} files`);
  console.log('');
  console.log(`📁 Thumbnails saved to: ${TARGET_DIR}`);

  // List generated files
  const files = fs.readdirSync(TARGET_DIR);
  let totalSize = 0;
  for (const file of files) {
    const filepath = path.join(TARGET_DIR, file);
    const stats = fs.statSync(filepath);
    totalSize += stats.size;
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`   ${file} (${sizeKB} KB)`);
  }

  const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log('');
  console.log(`📊 Total: ${success} files, ${totalMB} MB`);
  console.log('');
  console.log('✨ Next: Update blogData.ts to use local thumbnails');
  console.log('');
}

// Run
generateThumbnails().catch(console.error);
