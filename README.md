# MP4 to GIF Converter

A modern, browser-based MP4 to GIF converter that works entirely in your browser. No files are uploaded to any server - all processing happens locally for your privacy and security.

## Features

- 🎥 **Video Support**: Upload MP4 and other video formats
- 🖼️ **GIF Conversion**: Convert videos to animated GIFs
- ⚙️ **Customizable Settings**: Adjust FPS, size, and quality
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔒 **Privacy First**: No server uploads, all processing is local
- 🎨 **Modern UI**: Beautiful, intuitive interface with smooth animations

## How to Use

1. **Upload Video**: Drag and drop an MP4 file or click to browse
2. **Preview**: Watch your video to ensure it's the right one
3. **Adjust Settings**: 
   - **FPS**: Control how smooth the animation is (1-30 fps)
   - **Width**: Set the GIF size (100-800 pixels)
   - **Quality**: Balance between file size and image quality (1-10)
4. **Convert**: Click "Convert to GIF" and wait for processing
5. **Download**: Save your new GIF file

## Technical Details

- **Frontend**: Pure HTML5, CSS3, and JavaScript
- **Video Processing**: Uses HTML5 Canvas API for frame extraction
- **GIF Generation**: Powered by [gif.js](https://github.com/buzzfeed/libgif-js) library
- **Browser Support**: Modern browsers with HTML5 video support

## File Size Limits

- **Recommended**: Keep videos under 50MB for optimal performance
- **Maximum**: 100MB (may cause performance issues on slower devices)
- **Duration**: Shorter videos (under 30 seconds) work best

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## Performance Tips

1. **Lower FPS**: Use 5-15 fps for better performance
2. **Smaller Size**: 300-500 pixel width is usually sufficient
3. **Shorter Videos**: Convert clips rather than full videos
4. **Close Tabs**: Free up memory by closing other browser tabs

## Local Development

To run this project locally:

1. Clone or download the files
2. Open `index.html` in a modern web browser
3. No build process or dependencies required!

## File Structure

```
mp4-to-gif-converter/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Limitations

- **Color Depth**: GIFs are limited to 256 colors
- **File Size**: Large videos may create very large GIF files
- **Processing Time**: Depends on video length and settings
- **Browser Memory**: Very long videos may cause memory issues

## Troubleshooting

### Video Won't Load
- Ensure the file is a valid video format
- Check that the file isn't corrupted
- Try a different video file

### Conversion Fails
- Reduce video length or quality settings
- Close other browser tabs to free memory
- Try a different browser

### Slow Performance
- Lower the FPS setting
- Reduce the width/height
- Use shorter video clips

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this converter!

## License

This project is open source and available under the MIT License.

---

**Note**: This converter works entirely in your browser. No video files are uploaded to any server, ensuring your privacy and security.
