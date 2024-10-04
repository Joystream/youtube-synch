import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ytdl from 'youtube-dl-exec'

async function downloadVideo(videoUrl: string, outPath: string): ReturnType<typeof ytdl> {
  const response = await ytdl(videoUrl, {
    noWarnings: true,
    printJson: true,
    format: 'bv[height<=1080][ext=mp4]+ba[ext=m4a]/bv[height<=1080][ext=webm]+ba[ext=webm]/best[height<=1080]',
    output: `${outPath}/%(id)s.%(ext)s`,
    ffmpegLocation: ffmpegInstaller.path,
  })
  console.log('video downloaded', outPath, videoUrl)
  return response
}

downloadVideo('https://youtube.com/watch?v=cU7AAUNACVY', '/home/ubuntu/youtube-synch/').then(console.log)
