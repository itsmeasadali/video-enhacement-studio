'use client'

import { useState, useEffect } from 'react'
import VideoUploader from '@/components/VideoUploader'
import VideoProcessor from '@/components/VideoProcessor'
import VideoList from '@/components/VideoList'

export default function Home() {
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null)
  const [processedVideos, setProcessedVideos] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [videoDetails, setVideoDetails] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  useEffect(() => {
    if (processedVideos.length > 0) {
      const video = document.createElement('video')
      video.src = processedVideos[processedVideos.length - 1]
      video.onloadedmetadata = () => {
        setError(null)
        setVideoDetails(`Format: ${video.videoWidth}x${video.videoHeight}, Duration: ${video.duration}s`)
      }
      video.onerror = (e: Event | string) => {
        const target = e instanceof Event ? e.target as HTMLVideoElement : null;
        setError(`Error: ${target?.error?.message || 'Unknown error'}`);
        console.error('Video error:', target?.error);
      }
    }
  }, [processedVideos])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">AI-Powered Video Enhancement Studio</h1>
      
      {!uploadedVideo ? (
        <VideoUploader setUploadedVideo={setUploadedVideo} />
      ) : (
        <VideoProcessor 
          video={uploadedVideo}
          setProcessedVideos={setProcessedVideos}
          setIsProcessing={setIsProcessing}
        />
      )}
      
      {isProcessing && <p className="text-blue-500 mt-4">Processing video...</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {videoDetails && <p className="text-green-500 mt-4">{videoDetails}</p>}
      
      {uploadedVideo && (
        <button 
          onClick={() => setUploadedVideo(null)} 
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Cancel and Upload New Video
        </button>
      )}
      
      <VideoList videos={processedVideos} title="Processed Videos" />
    </main>
  )
}
