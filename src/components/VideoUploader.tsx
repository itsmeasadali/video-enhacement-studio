import React from 'react'

interface VideoUploaderProps {
  setUploadedVideo: (file: File | null) => void
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ setUploadedVideo }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null
    setUploadedVideo(file)
  }

  return (
    <div className="mb-4">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
    </div>
  )
}

export default VideoUploader