/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '../demo-screenshots');
const OUTPUT_VIDEO = path.join(__dirname, '../public/tiktok-demo.mp4');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Clear old screenshots
fs.readdirSync(SCREENSHOTS_DIR).forEach(file => {
  fs.unlinkSync(path.join(SCREENSHOTS_DIR, file));
});

let frameIndex = 0;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name, frameCount = 30) {
  for (let i = 0; i < frameCount; i++) {
    frameIndex++;
    const frameNumber = String(frameIndex).padStart(4, '0');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `frame_${frameNumber}.png`),
      type: 'png'
    });
  }
  console.log(`📸 Captured: ${name} (${frameCount} frames)`);
}

async function clickButtonByText(page, text) {
  return await page.evaluate((searchText) => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent && btn.textContent.includes(searchText) && !btn.disabled) {
        btn.click();
        return true;
      }
    }
    return false;
  }, text);
}

async function recordDemo() {
  console.log('🎬 Starting TikTok Demo Recording...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--window-size=1920,1080', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Scene 1: Navigate to TikTok Integration page
    console.log('📍 Scene 1: Opening TikTok Integration page...');
    await page.goto('https://n01.app/integrations/tiktok', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1500);
    await takeScreenshot(page, 'Landing page', 90); // 3 seconds

    // Scene 2: Scroll to show the connection section
    console.log('📍 Scene 2: Showing TikTok connection section...');
    await page.evaluate(() => window.scrollBy(0, 100));
    await sleep(500);
    await takeScreenshot(page, 'Connection section visible', 60); // 2 seconds

    // Scene 3: Click Connect TikTok button
    console.log('📍 Scene 3: Clicking Connect TikTok...');
    await takeScreenshot(page, 'Before connect click', 30); // 1 second
    
    const connected = await clickButtonByText(page, 'Connect TikTok');
    if (connected) {
      console.log('   ✓ Clicked Connect TikTok button');
    }
    
    await sleep(2000);
    await takeScreenshot(page, 'Connected state', 90); // 3 seconds

    // Scene 4: Scroll to video queue
    console.log('📍 Scene 4: Showing video queue...');
    await page.evaluate(() => window.scrollBy(0, 350));
    await sleep(800);
    await takeScreenshot(page, 'Video queue visible', 90); // 3 seconds

    // Scene 5: Click Publish to TikTok button
    console.log('📍 Scene 5: Opening publish modal...');
    await takeScreenshot(page, 'Before publish click', 30); // 1 second
    
    const publishClicked = await clickButtonByText(page, 'Publish to TikTok');
    if (publishClicked) {
      console.log('   ✓ Clicked Publish to TikTok button');
    }
    
    await sleep(1200);
    await takeScreenshot(page, 'Publish modal opened', 90); // 3 seconds

    // Scene 6: Type caption
    console.log('📍 Scene 6: Filling caption...');
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.click();
      await sleep(300);
      await takeScreenshot(page, 'Caption field focused', 30);
      
      const caption = 'Check out our latest AI-generated content! #ai #tech #n01app';
      for (let i = 0; i < caption.length; i++) {
        await textarea.type(caption[i], { delay: 25 });
        if (i % 15 === 0) {
          await takeScreenshot(page, `Typing caption`, 2);
        }
      }
      await takeScreenshot(page, 'Caption complete', 60); // 2 seconds
      console.log('   ✓ Caption filled');
    }

    // Scene 7: Show privacy dropdown
    console.log('📍 Scene 7: Showing privacy settings...');
    await takeScreenshot(page, 'Privacy and options visible', 60); // 2 seconds

    // Scene 8: Click Publish Now
    console.log('📍 Scene 8: Publishing...');
    await takeScreenshot(page, 'Before clicking Publish Now', 30);
    
    const publishNowClicked = await clickButtonByText(page, 'Publish Now');
    if (publishNowClicked) {
      console.log('   ✓ Clicked Publish Now button');
    }
    
    await sleep(500);
    await takeScreenshot(page, 'Publishing in progress', 60); // 2 seconds
    
    await sleep(2500);
    await takeScreenshot(page, 'Published successfully', 120); // 4 seconds

    // Scene 9: Close modal and show footer
    console.log('📍 Scene 9: Showing Terms & Privacy in footer...');
    
    await sleep(500);
    await clickButtonByText(page, 'Done');
    await sleep(800);
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(600);
    await takeScreenshot(page, 'Footer with Terms and Privacy', 120); // 4 seconds

    // Scene 10: Back to top for end screen
    console.log('📍 Scene 10: End screen...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(600);
    await takeScreenshot(page, 'Final end screen', 90); // 3 seconds

    console.log('\n✅ All screenshots captured!');

  } catch (error) {
    console.error('Error during recording:', error.message);
  } finally {
    await browser.close();
  }

  // Create video from screenshots
  console.log('\n🎥 Creating video from screenshots...');
  
  const frameCount = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png')).length;
  console.log(`Found ${frameCount} frames`);

  if (frameCount > 0) {
    try {
      execSync(`ffmpeg -y -framerate 30 -i "${SCREENSHOTS_DIR}/frame_%04d.png" -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow "${OUTPUT_VIDEO}"`, {
        stdio: 'inherit'
      });
      console.log(`\n✅ Video created: ${OUTPUT_VIDEO}`);
      
      const stats = fs.statSync(OUTPUT_VIDEO);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      const duration = (frameCount / 30).toFixed(1);
      console.log(`📊 File size: ${sizeMB} MB`);
      console.log(`⏱️  Duration: ${duration} seconds`);
      
      if (stats.size > 50 * 1024 * 1024) {
        console.log('\n⚠️  File too large! Compressing...');
        execSync(`ffmpeg -y -i "${OUTPUT_VIDEO}" -c:v libx264 -crf 28 -preset fast "${OUTPUT_VIDEO}.compressed.mp4"`, {
          stdio: 'inherit'
        });
        fs.renameSync(`${OUTPUT_VIDEO}.compressed.mp4`, OUTPUT_VIDEO);
      }
    } catch (ffmpegError) {
      console.error('FFmpeg error:', ffmpegError.message);
    }
  }

  console.log(`\n📁 Video saved to: ${OUTPUT_VIDEO}`);
}

recordDemo().catch(console.error);
