# Video Processing Web Application

This web application allows users to process and manipulate video files directly in the browser using FFmpeg.js. It provides various video processing options such as format conversion, trimming, speed adjustment, watermarking, and video enhancement.

## Features

- Convert video formats (MP4, WebM, AVI, MOV)
- Trim videos by specifying start and end times
- Adjust video playback speed
- Add watermark text to videos
- Apply various enhancements (HDR, noise reduction, 4K upscaling)
- Combine multiple processing options

## Technologies Used

- React
- TypeScript
- FFmpeg.js
- Tailwind CSS

## Setup and Configuration

1. Clone the repository:
   ```
   git clone https://github.com/your-username/video-processing-app.git
   cd video-processing-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure FFmpeg:
   - Ensure that the FFmpeg WASM files are properly located in the `public` directory of your project.
   - The required files are typically:
     - `ffmpeg-core.js`
     - `ffmpeg-core.wasm`
     - `ffmpeg-core.worker.js`

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000` (or the port specified by your React setup).

## Usage

1. Upload a video file using the file input.
2. Choose a processing option:
   - Format Conversion
   - Trim Video
   - Adjust Speed
   - Add Watermark
   - Apply Enhancements
   - All Options
3. Configure the selected option using the provided inputs.
4. Click the "Process Video" button to start processing.
5. Wait for the processing to complete. The processed video will be displayed below the options.

## Notes

- Processing large videos may take some time and consume significant browser resources.
- The application uses client-side processing, so no files are uploaded to a server.
- Ensure your browser is up-to-date for the best compatibility with Web Assembly (used by FFmpeg.js).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).