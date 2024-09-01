import React, { useState, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import ProcessingOptions from './ProcessingOptions';

interface VideoProcessorProps {
  video: File;
  setProcessedVideos: React.Dispatch<React.SetStateAction<string[]>>;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

const VideoProcessor: React.FC<VideoProcessorProps> = ({ video, setProcessedVideos, setIsProcessing }) => {
  const [isReady, setIsReady] = useState(false);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [quality, setQuality] = useState('medium');
  const [resolution, setResolution] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(100);
  const [convertedVideoUrl, setConvertedVideoUrl] = useState<string | null>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [selectedEnhancement, setSelectedEnhancement] = useState<string>('default');
  const [isProcessing, setIsProcessingLocal] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg Log:', message);
      if (messageRef.current) {
        messageRef.current.innerHTML += message + '\n';
      }
    });
    try {
      await ffmpeg.load();
      setIsReady(true);
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Error loading FFmpeg:', error);
      if (messageRef.current) {
        messageRef.current.innerHTML = `Error loading FFmpeg: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setConvertedVideoUrl(null);
  };

  const handleEnhancementSelect = (enhancement: string) => {
    setSelectedEnhancement(enhancement);
  };

  const convertVideo = async () => {
    if (!video || !selectedOption) return;
    setIsProcessingLocal(true);
    setIsProcessing(true);
    setConvertedVideoUrl(null);
    if (messageRef.current) messageRef.current.innerHTML = '';

    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = video.name;
      const outputName = `output.${outputFormat}`;

      console.log('Writing input file...');
      await ffmpeg.writeFile(inputName, await fetchFile(video));
      console.log('Input file written successfully');

      let ffmpegArgs = ['-i', inputName];

      switch (selectedOption) {
        case 'format':
          // No additional args needed, output format is already set
          break;
        case 'trim':
          if (startTime) ffmpegArgs.push('-ss', startTime);
          if (endTime) ffmpegArgs.push('-to', endTime);
          break;
        case 'speed':
          if (speed !== 1) ffmpegArgs.push('-filter:v', `setpts=${1/speed}*PTS`, '-filter:a', `atempo=${speed}`);
          break;
        case 'watermark':
          if (watermarkText) {
            // Use a simple color overlay instead of text
            ffmpegArgs.push('-vf', `drawbox=x=0:y=ih-24:w=iw:h=24:color=black@0.5:t=fill,drawbox=x=0:y=0:w=iw:h=24:color=black@0.5:t=fill`);
          }
          break;
        case 'all':
          // Apply all options
          if (quality === 'low') ffmpegArgs.push('-crf', '28');
          else if (quality === 'high') ffmpegArgs.push('-crf', '18');
          else ffmpegArgs.push('-crf', '23');
          if (resolution) ffmpegArgs.push('-vf', `scale=${resolution}`);
          if (startTime) ffmpegArgs.push('-ss', startTime);
          if (endTime) ffmpegArgs.push('-to', endTime);
          if (speed !== 1) ffmpegArgs.push('-filter:v', `setpts=${1/speed}*PTS`, '-filter:a', `atempo=${speed}`);
          if (volume !== 100) ffmpegArgs.push('-filter:a', `volume=${volume/100}`);
          break;
        case 'enhance':
          switch (selectedEnhancement) {
            case 'hdr':
              ffmpegArgs.push('-vf', 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p');
              break;
            case 'noise-reduction':
              ffmpegArgs.push('-vf', 'nlmeans=s=1:p=7:r=15');
              break;
            case 'upscaling':
              ffmpegArgs.push('-vf', 'scale=3840:2160:flags=lanczos');
              break;
            // 'default' case doesn't need any special treatment
          }
          break;
      }

      ffmpegArgs.push(outputName);

      console.log('FFmpeg command:', ffmpegArgs.join(' '));
      await ffmpeg.exec(ffmpegArgs);
      console.log('FFmpeg execution completed');

      console.log('Reading output file...');
      const data = await ffmpeg.readFile(outputName);
      console.log('Output file read successfully');

      const uint8Array = new Uint8Array(data as ArrayBuffer);
      const blob = new Blob([uint8Array], { type: `video/${outputFormat}` });
      console.log('Blob created:', blob.size, 'bytes');

      const url = URL.createObjectURL(blob);
      console.log('URL created:', url);

      setConvertedVideoUrl(url);
      setProcessedVideos(prevVideos => [...prevVideos, url]);
    } catch (error) {
      console.error('Error converting video:', error);
      if (messageRef.current) {
        messageRef.current.innerHTML += `Error: ${error}\n`;
      }
    }

    setIsProcessingLocal(false);
    setIsProcessing(false);
  };

  if (!isReady) {
    return <div>Loading FFmpeg...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Video Processor</h2>

      {!selectedOption ? (
        <ProcessingOptions onOptionSelect={handleOptionSelect} />
      ) : (
        <>
          {/* Render specific options based on selectedOption */}
          {selectedOption === 'format' && (
            <div className="mb-6">
              <label htmlFor="format-select" className="block text-gray-700 font-semibold mb-2">
                Output Format:
              </label>
              <select
                id="format-select"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
                <option value="avi">AVI</option>
                <option value="mov">MOV</option>
              </select>
            </div>
          )}

          {selectedOption === 'trim' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="start-time-input" className="block text-gray-700 font-semibold mb-2">
                  Start Time (e.g., 00:00:10):
                </label>
                <input
                  id="start-time-input"
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="Optional"
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="end-time-input" className="block text-gray-700 font-semibold mb-2">
                  End Time (e.g., 00:01:00):
                </label>
                <input
                  id="end-time-input"
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="Optional"
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {selectedOption === 'speed' && (
            <div className="mb-6">
              <label htmlFor="speed-input" className="block text-gray-700 font-semibold mb-2">
                Playback Speed (0.5 to 2):
              </label>
              <input
                id="speed-input"
                type="number"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {selectedOption === 'watermark' && (
            <div className="mb-6">
              <label htmlFor="watermark-input" className="block text-gray-700 font-semibold mb-2">
                Watermark Text:
              </label>
              <input
                id="watermark-input"
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter watermark text"
                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {selectedOption === 'all' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="format-select" className="block text-gray-700 font-semibold mb-2">
                  Output Format:
                </label>
                <select
                  id="format-select"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="mp4">MP4</option>
                  <option value="webm">WebM</option>
                  <option value="avi">AVI</option>
                  <option value="mov">MOV</option>
                </select>
              </div>

              <div>
                <label htmlFor="quality-select" className="block text-gray-700 font-semibold mb-2">
                  Video Quality:
                </label>
                <select
                  id="quality-select"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label htmlFor="resolution-input" className="block text-gray-700 font-semibold mb-2">
                  Resolution (e.g., 1280:720):
                </label>
                <input
                  id="resolution-input"
                  type="text"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Leave blank for original"
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="speed-input" className="block text-gray-700 font-semibold mb-2">
                  Playback Speed (0.5 to 2):
                </label>
                <input
                  id="speed-input"
                  type="number"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="volume-input" className="block text-gray-700 font-semibold mb-2">
                  Volume (%):
                </label>
                <input
                  id="volume-input"
                  type="number"
                  min="0"
                  max="200"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="start-time-input" className="block text-gray-700 font-semibold mb-2">
                  Start Time (e.g., 00:00:10):
                </label>
                <input
                  id="start-time-input"
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="Optional"
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="end-time-input" className="block text-gray-700 font-semibold mb-2">
                  End Time (e.g., 00:01:00):
                </label>
                <input
                  id="end-time-input"
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="Optional"
                  className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {selectedOption === 'enhance' && (
            <div className="mb-6">
              <label htmlFor="enhancement-select" className="block text-gray-700 font-semibold mb-2">
                Select Enhancement:
              </label>
              <select
                id="enhancement-select"
                value={selectedEnhancement}
                onChange={(e) => setSelectedEnhancement(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="default">Default Enhancement</option>
                <option value="hdr">HDR Enhancement</option>
                <option value="noise-reduction">Noise Reduction</option>
                <option value="upscaling">4K Upscaling</option>
              </select>
            </div>
          )}

          <button
            onClick={convertVideo}
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Process Video'}
          </button>

          {isProcessing && <p className="mt-4">Processing video...</p>}

          {/* Only show the processed video */}
          {convertedVideoUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Processed Video:</h3>
              <video controls src={convertedVideoUrl} className="w-full" />
            </div>
          )}

          <p ref={messageRef} className="mt-4 text-sm text-gray-600"></p>
        </>
      )}
    </div>
  );
};

export default VideoProcessor;