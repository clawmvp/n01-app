import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const BASE_PATH = '/Volumes/500GB-BK/cursor-ai/ai-money-projects';

// Project commands mapping
const PROJECT_COMMANDS: Record<string, { dir: string; cmd: string }> = {
  p1: { dir: 'p1-reddit-stories-v2', cmd: 'npx tsx src/cli/full-pipeline.ts' },
  p2: { dir: 'p2-trivia-facts-v2', cmd: 'npx tsx src/cli/generate-full.ts' },
  p3: { dir: 'p3-long-to-short-v3', cmd: 'npx tsx src/cli/full-pipeline.ts' },
  p4: { dir: 'p4-podcast-clips-v2', cmd: 'npx tsx src/cli/full-pipeline.ts' },
  p5: { dir: 'p5-trend-threads', cmd: 'npx tsx src/cli/generate.ts' },
  p6: { dir: 'p6-satisfying-content-v3', cmd: 'npx tsx src/scripts/pipeline.ts' },
  p7: { dir: 'p7-movie-clips', cmd: 'npx tsx generate.ts' },
  p8: { dir: 'p8-evergreen-recycler', cmd: 'npx tsx viral-researcher-v2.ts' },
  p9: { dir: 'p9-language-arbitrage', cmd: 'npx tsx translate-video-v1.ts' },
};

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();
    
    if (!projectId || !PROJECT_COMMANDS[projectId]) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }
    
    const { dir, cmd } = PROJECT_COMMANDS[projectId];
    const projectPath = `${BASE_PATH}/${dir}`;
    
    // Run the command in background (don't wait for completion)
    const fullCmd = `cd "${projectPath}" && ${cmd}`;
    
    // For now, just validate the path exists
    const { stdout } = await execAsync(`ls "${projectPath}" | head -5`);
    
    // Start the process in background
    exec(`${fullCmd} >> /tmp/${projectId}-output.log 2>&1 &`);
    
    return NextResponse.json({
      success: true,
      message: `Started ${projectId.toUpperCase()} in background`,
      projectPath,
      logFile: `/tmp/${projectId}-output.log`,
    });
  } catch (error) {
    console.error('Run error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to run project' 
    }, { status: 500 });
  }
}
