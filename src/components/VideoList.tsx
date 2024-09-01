import React from 'react'

interface VideoListProps {
  videos: string[]
}

const VideoList: React.FC<VideoListProps> = ({ videos }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Processed Videos</h2>
      {videos.length === 0 ? (
        <p>No processed videos yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video, index) => (
            <div key={index} className="border rounded p-4">
              <video controls className="w-full">
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VideoList