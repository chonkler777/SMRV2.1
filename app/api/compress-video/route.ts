import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';

// Function to find FFmpeg on system
function getSystemFFmpegPath(): string {
  try {
    const platform = process.platform;
    
    if (platform === 'win32') {
      const result = execSync('where ffmpeg', { encoding: 'utf8' });
      return result.split('\n')[0].trim();
    } else {
      const result = execSync('which ffmpeg', { encoding: 'utf8' });
      return result.trim();
    }
  } catch (error) {
    // Fallback to common paths
    const commonPaths = [
      '/opt/homebrew/bin/ffmpeg',  // M1/M2 Macs
      '/usr/local/bin/ffmpeg',      // Intel Macs
      '/usr/bin/ffmpeg',            // Linux
    ];
    
    for (const testPath of commonPaths) {
      if (existsSync(testPath)) {
        return testPath;
      }
    }
    
    throw new Error('FFmpeg not found. Please install FFmpeg.');
  }
}

export async function POST(request: NextRequest) {
  let inputPath = '';
  let outputPath = '';

  console.log('🎬 === COMPRESSION API STARTED ===');

  try {
    // 1. Load FFmpeg
    console.log('📦 Loading FFmpeg...');
    const ffmpeg = (await import('fluent-ffmpeg')).default;
    
    const ffmpegPath = getSystemFFmpegPath();
    console.log('✅ FFmpeg found at:', ffmpegPath);
    ffmpeg.setFfmpegPath(ffmpegPath);

    // 2. Get form data
    console.log('📥 Parsing form data...');
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    console.log(`📥 Received: ${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(2)}MB)`);

    // 3. Convert to buffer
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Create temp paths (remove special characters from filename)
    const tempDir = tmpdir();
    const timestamp = Date.now();
    const sanitizedName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    inputPath = path.join(tempDir, `input_${timestamp}_${sanitizedName}`);
    outputPath = path.join(tempDir, `compressed_${timestamp}.mp4`);
    
    console.log('📝 Input path:', inputPath);
    console.log('📝 Output path:', outputPath);

    // 5. Write file
    console.log('💾 Writing input file...');
    await writeFile(inputPath, buffer);

    // 6. Get metadata
    console.log('🔍 Reading video metadata...');
    const metadata = await new Promise<any>((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err: any, data: any) => {
        if (err) {
          console.error('❌ FFprobe error:', err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    const duration = metadata.format.duration;
    console.log(`⏱️  Duration: ${duration}s`);

    // 7. Compress
    console.log('🎬 Starting compression...');
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .size('1280x?')
        .videoBitrate('1000k')
        .audioBitrate('128k')
        .fps(30)
        .outputOptions([
          '-preset veryfast',
          '-crf 24',
          '-movflags +faststart',
          '-pix_fmt yuv420p',
          '-max_muxing_queue_size 9999'
        ])
        .on('start', (cmd: string) => {
          console.log('🎬 FFmpeg command:', cmd);
        })
        .on('progress', (progress: any) => {
          if (progress.percent) {
            console.log(`⚙️  Progress: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          console.log('✅ Compression complete');
          resolve();
        })
        .on('error', (err: Error) => {
          console.error('❌ FFmpeg error:', err);
          reject(err);
        })
        .save(outputPath);
    });

    // 8. Read compressed file
    console.log('📖 Reading compressed file...');
    const compressedBuffer = await readFile(outputPath);
    const originalSize = videoFile.size;
    const compressedSize = compressedBuffer.length;
    const savedPercent = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

    console.log(`💾 Original: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`💾 Compressed: ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`💰 Saved: ${savedPercent}%`);

    // 9. Cleanup
    if (existsSync(inputPath)) await unlink(inputPath);
    if (existsSync(outputPath)) await unlink(outputPath);
    console.log('🧹 Cleanup complete');

    console.log('🎉 === COMPRESSION SUCCESSFUL ===');

    // 10. Return
    return new NextResponse(new Uint8Array(compressedBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': compressedSize.toString(),
        'Content-Disposition': `attachment; filename="compressed_${videoFile.name}"`,
      },
    });

  } catch (error) {
    console.error('💥 === COMPRESSION FAILED ===');
    console.error('❌ Error:', error);

    // Cleanup on error
    try {
      if (inputPath && existsSync(inputPath)) await unlink(inputPath);
      if (outputPath && existsSync(outputPath)) await unlink(outputPath);
    } catch (cleanupErr) {
      console.error('⚠️  Cleanup error:', cleanupErr);
    }

    return NextResponse.json(
      {
        error: 'Compression failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const ffmpegPath = getSystemFFmpegPath();
    return NextResponse.json({
      status: 'ok',
      service: 'Video Compression API',
      ffmpegPath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'FFmpeg not found'
    }, { status: 500 });
  }
}