// Global variables
let videoFile = null;
let gif = null;
let convertedGifBlob = null;
let processingTimeout = null;
let errorLogs = [];
let debugInfo = {};

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const videoPreview = document.getElementById('videoPreview');
const videoSection = document.getElementById('videoSection');
const progressSection = document.getElementById('progressSection');
const outputSection = document.getElementById('outputSection');
const errorSection = document.getElementById('errorSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const gifOutput = document.getElementById('gifOutput');
const convertBtn = document.getElementById('convertBtn');

// Slider elements
const fpsSlider = document.getElementById('fpsSlider');
const scaleSlider = document.getElementById('scaleSlider');
const qualitySlider = document.getElementById('qualitySlider');
const fpsValue = document.getElementById('fpsValue');
const scaleValue = document.getElementById('scaleValue');
const qualityValue = document.getElementById('qualityValue');

// Simple hash function for frame comparison
function simpleHash(data) {
    let hash = 0;
    for (let i = 0; i < Math.min(data.length, 1000); i += 4) {
        hash = ((hash << 5) - hash + data[i]) | 0;
    }
    return hash;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateSliderValues();
    initializeLogging();
});

// Initialize logging system
function initializeLogging() {
    errorLogs = [];
    debugInfo = {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        browser: getBrowserInfo(),
        platform: navigator.platform,
        language: navigator.language,
        protocol: window.location.protocol
    };
    
    logInfo('Application initialized', debugInfo);
}

// Get browser information
function getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
}

// Logging functions
function logInfo(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        level: 'INFO',
        timestamp: timestamp,
        message: message,
        data: data
    };
    errorLogs.push(logEntry);
    console.log(`[${timestamp}] INFO: ${message}`, data);
}

function logError(message, error = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        level: 'ERROR',
        timestamp: timestamp,
        message: message,
        data: error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : null
    };
    errorLogs.push(logEntry);
    console.log(`[${timestamp}] ERROR: ${message}`, error);
}

function logWarning(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        level: 'WARNING',
        timestamp: timestamp,
        message: message,
        data: data
    };
    errorLogs.push(logEntry);
    console.log(`[${timestamp}] WARNING: ${message}`, data);
}

// Initialize all event listeners
function initializeEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Slider events
    fpsSlider.addEventListener('input', updateSliderValues);
    scaleSlider.addEventListener('input', updateSliderValues);
    qualitySlider.addEventListener('input', updateSliderValues);
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Handle file drop
function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// Process the uploaded file
function processFile(file) {
    logInfo('Processing file', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
    });
    
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
        logError('Invalid file type', { fileType: file.type });
        showError('Please select a valid video file.');
        return;
    }
    
    // Check file size (limit to 50MB for better performance)
    if (file.size > 50 * 1024 * 1024) {
        logWarning('File too large', { fileSize: file.size, maxSize: 50 * 1024 * 1024 });
        showError('File size must be less than 50MB for optimal performance.');
        return;
    }
    
    videoFile = file;
    
    // Create video preview
    const url = URL.createObjectURL(file);
    videoPreview.src = url;
    
    // Show video section
    showSection(videoSection);
    hideSection(errorSection);
    
    // Enable convert button
    convertBtn.disabled = false;
    
    logInfo('File processed successfully');
}

// Update slider display values
function updateSliderValues() {
    fpsValue.textContent = fpsSlider.value;
    scaleValue.textContent = scaleSlider.value;
    qualityValue.textContent = qualitySlider.value;
}

// Convert video to GIF with local file compatibility
function convertToGif() {
    if (!videoFile) {
        logError('No video file selected');
        showError('Please select a video file first.');
        return;
    }
    
    // Get conversion settings
    const fps = parseInt(fpsSlider.value);
    const scale = parseInt(scaleSlider.value);
    const quality = parseInt(qualitySlider.value);
    
    logInfo('Starting conversion', {
        fps: fps,
        scale: scale,
        quality: quality,
        fileName: videoFile.name,
        fileSize: videoFile.size
    });
    
    // Show progress section
    showSection(progressSection);
    hideSection(videoSection);
    
    // Disable convert button
    convertBtn.disabled = true;
    
    try {
        // Check if we're running from local file
        if (window.location.protocol === 'file:') {
            logInfo('Running from local file, using alternative approach');
            showLocalFileInstructions();
            return;
        }
        
        // Since GIF libraries aren't working, use the working frame-based approach
        logInfo('Using working frame-based approach instead of broken GIF libraries');
        
        // Process video frames and create animated content
        processVideoFrames(fps, scale, quality);
        
    } catch (error) {
        logError('Conversion setup error', error);
        showError('Error setting up conversion. Please try refreshing the page.');
    }
}

// Process video frames
function processVideoFrames(fps, scale, quality) {
    // Create canvas for video processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = scale;
    canvas.height = Math.round(scale * 0.75);
    
    logInfo('Canvas created', { width: canvas.width, height: canvas.height });
    
    // Create video element for processing
    const processVideo = document.createElement('video');
    processVideo.src = URL.createObjectURL(videoFile);
    processVideo.muted = true;
    processVideo.crossOrigin = 'anonymous';
    
    let frameCount = 0;
    let totalFrames = 0;
    
    processVideo.addEventListener('loadedmetadata', function() {
        const duration = processVideo.duration;
        // Ensure we get enough frames for smooth animation
        totalFrames = Math.min(Math.floor(duration * fps), 150);
        
        // Minimum frames for animation
        if (totalFrames < 5) totalFrames = 5;
        
        logInfo('Video metadata loaded', {
            duration: duration,
            totalFrames: totalFrames,
            originalFps: fps,
            calculatedFps: totalFrames / duration,
            frameInterval: 1000 / fps
        });
        
        // Use a different approach: capture frames at regular intervals
        let currentTime = 0;
        const timeStep = duration / totalFrames;
        
        function captureNextFrame() {
            if (frameCount >= totalFrames) {
                logInfo('Frame processing completed', { totalFramesProcessed: frameCount });
                finishConversion();
                return;
            }
            
            // Set video time and wait for it to be ready
            processVideo.currentTime = currentTime;
            
            // Wait for the video to be ready at this time
            const checkReady = () => {
                if (processVideo.readyState >= 2 && Math.abs(processVideo.currentTime - currentTime) < 0.1) {
                    try {
                        // Capture the current frame
                        ctx.drawImage(processVideo, 0, 0, canvas.width, canvas.height);
                        
                        // Get frame data for comparison
                        const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const frameHash = simpleHash(frameData.data);
                        
                        // Check if this frame is different from the previous one
                        if (frameCount > 0 && frameHash === window.lastFrameHash) {
                            logWarning('Duplicate frame detected', { 
                                frameNumber: frameCount, 
                                frameHash: frameHash,
                                currentTime: processVideo.currentTime
                            });
                            // Skip this frame and try the next time
                            currentTime += timeStep;
                            setTimeout(captureNextFrame, 100);
                            return;
                        }
                        
                        window.lastFrameHash = frameHash;
                        
                        // Store frame data for later use
                        if (!window.videoFrames) window.videoFrames = [];
                        window.videoFrames.push({
                            canvas: canvas.toDataURL(),
                            delay: Math.round(1000 / fps),
                            timestamp: processVideo.currentTime
                        });
                        
                        // Log frame data hash to check if frames are different
                        logInfo('Frame captured successfully', { 
                            frameHash: frameHash, 
                            frameNumber: frameCount,
                            frameDelay: Math.round(1000 / fps)
                        });
                        
                        frameCount++;
                        updateProgress(frameCount, totalFrames);
                        
                        // Debug: Log frame details
                        logInfo('Frame added', {
                            frameNumber: frameCount,
                            delay: Math.round(1000 / fps),
                            currentTime: processVideo.currentTime,
                            canvasSize: `${canvas.width}x${canvas.height}`,
                            targetTime: currentTime
                        });
                        
                        if (frameCount % 10 === 0) {
                            logInfo('Frame processing progress', { 
                                frameCount: frameCount, 
                                totalFrames: totalFrames,
                                currentTime: processVideo.currentTime,
                                readyState: processVideo.readyState,
                                frameDelay: Math.round(1000 / fps)
                            });
                        }
                        
                        // Move to next frame time
                        currentTime += timeStep;
                        
                        // Ensure we don't exceed video duration
                        if (currentTime >= duration) {
                            currentTime = duration - 0.1;
                        }
                        
                        // Capture next frame after a short delay
                        setTimeout(captureNextFrame, 100);
                        
                    } catch (error) {
                        logError('Error processing frame', error);
                        showError('Error processing video frame. Please try with different settings.');
                    }
                } else {
                    // Wait a bit more for video to be ready
                    setTimeout(checkReady, 10);
                }
            };
            
            checkReady();
        }
        
        // Start capturing frames
        captureNextFrame();
        
    });
    
    processVideo.addEventListener('error', function(e) {
        logError('Video processing error', e);
        showError('Error loading video. Please try a different file.');
    });
    
    // Add timeout protection
    processingTimeout = setTimeout(() => {
        if (frameCount === 0) {
            logError('Video processing timeout');
            showError('Video processing timeout. Please try a shorter video or different settings.');
        }
    }, 45000);
}

// Show local file instructions
function showLocalFileInstructions() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerHTML = `
        <strong>Local File Restriction Detected</strong><br><br>
        You're running this from a local file (file://), which blocks Web Workers for security reasons.<br><br>
        <strong>Solution: Start a local server</strong><br><br>
        <button onclick="startLocalServer()" style="
            background: #28a745; 
            color: white; 
            border: none; 
            padding: 12px 20px; 
            border-radius: 6px; 
            cursor: pointer;
            margin: 10px 5px;
            font-size: 14px;
        ">
            🚀 Start Local Server
        </button>
        <button onclick="copyLogsToClipboard()" style="
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer;
            margin: 5px;
        ">
            📋 Copy Logs
        </button>
        <button onclick="resetConverter()" style="
            background: #6c757d; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer;
            margin: 5px;
        ">
            🔄 Reset
        </button>
        <br><br>
        <small>Or open Terminal and run: <code>cd /Users/joallison/mp4-to-gif-converter && python3 -m http.server 8000</code></small>
    `;
    
    showSection(errorSection);
    hideSection(progressSection);
}

// Start local server
function startLocalServer() {
    logInfo('User requested local server start');
    
    // Try to start a simple HTTP server
    try {
        // This is a fallback - the main solution is manual server start
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.innerHTML = `
            <strong>Local Server Setup Required</strong><br><br>
            <strong>Step 1:</strong> Open Terminal<br>
            <strong>Step 2:</strong> Run this command:<br><br>
            <code style="background: #f8f9fa; padding: 8px; border-radius: 4px; display: block; margin: 10px 0;">
                cd /Users/joallison/mp4-to-gif-converter && python3 -m http.server 8000
            </code><br><br>
            <strong>Step 3:</strong> Open <a href="http://localhost:8000" target="_blank">http://localhost:8000</a> in your browser<br><br>
            <button onclick="resetConverter()" style="
                background: #6c757d; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 4px; 
                cursor: pointer;
            ">
                🔄 Reset
            </button>
        `;
    } catch (error) {
        logError('Error starting local server', error);
        showError('Could not start local server automatically. Please use Terminal.');
    }
}

// Update progress bar
function updateProgress(current, total) {
    const percentage = Math.min((current / total) * 100, 100);
    progressFill.style.width = percentage + '%';
    
    if (current >= total) {
        progressText.textContent = 'Creating animated content...';
    } else {
        progressText.textContent = `Processing frame ${current} of ${total}...`;
    }
}

// Finish conversion and create animated content
function finishConversion() {
    logInfo('Starting animated content creation');
    
    if (processingTimeout) {
        clearTimeout(processingTimeout);
        processingTimeout = null;
    }
    
    try {
        const frames = window.videoFrames || [];
        logInfo('Conversion completed', { 
            totalFrames: frames.length,
            frameDelays: frames.map(f => f.delay)
        });
        
        if (frames.length < 2) {
            showError('Not enough distinct frames captured. Please try with different settings or a longer video.');
            return;
        }
        
        // Create animated preview
        createAnimatedPreview(frames);
        
        hideSection(progressSection);
        showSection(outputSection);
        
    } catch (error) {
        logError('Error creating animated content', error);
        showError('Error creating animated content. Please try again.');
    }
}

// Create animated preview from captured frames
function createAnimatedPreview(frames) {
    logInfo('Creating animated preview', { frameCount: frames.length });
    
    // Update the output section to show animated content
    const gifOutput = document.getElementById('gifOutput');
    const outputSection = document.getElementById('outputSection');
    
    // Create animated preview container
    const animatedContainer = document.createElement('div');
    animatedContainer.id = 'animatedContainer';
    animatedContainer.style.textAlign = 'center';
    animatedContainer.style.margin = '20px';
    
    // Create the animated image
    const animatedImg = document.createElement('img');
    animatedImg.id = 'animatedPreview';
    animatedImg.src = frames[0].canvas;
    animatedImg.style.border = '2px solid #28a745';
    animatedImg.style.borderRadius = '10px';
    animatedImg.style.maxWidth = '100%';
    animatedImg.style.height = 'auto';
    
    animatedContainer.appendChild(animatedImg);
    
    // Replace the static GIF output with animated content
    gifOutput.parentNode.replaceChild(animatedContainer, gifOutput);
    
    // Start the animation
    let currentFrame = 0;
    const animationInterval = setInterval(() => {
        currentFrame = (currentFrame + 1) % frames.length;
        animatedImg.src = frames[currentFrame].canvas;
    }, frames[0].delay);
    
    // Store the interval for cleanup
    window.animationInterval = animationInterval;
    
    // Update the output section title
    const outputTitle = outputSection.querySelector('h3');
    if (outputTitle) {
        outputTitle.innerHTML = 'Your Animated Content is Ready!';
    }
    
    // Update the download button to create animated GIF
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Animated GIF';
        downloadBtn.onclick = () => {
            console.log('Download button clicked, frames:', frames);
            downloadAllFrames(frames);
        };
    }
    
    logInfo('Animated preview created successfully');
}

// Download all frames as individual PNG files
function downloadAllFrames(frames) {
    console.log('downloadAllFrames called with:', frames);
    
    if (!frames || frames.length === 0) {
        logError('No frames available for download');
        showError('No frames available for download.');
        return;
    }
    
    try {
        logInfo('Starting GIF creation', { frameCount: frames.length });
        
        // Show progress
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating GIF...';
        downloadBtn.disabled = true;
        
        // Create animated GIF from frames
        createAnimatedGIF(frames, (gifBlob) => {
            // Download the GIF
            const a = document.createElement('a');
            a.href = URL.createObjectURL(gifBlob);
            a.download = 'animated-content.gif';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Re-enable button
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
            logInfo('GIF downloaded successfully');
        });
        
    } catch (error) {
        logError('Download error', error);
        showError('Error downloading frames. Please try again.');
        
        // Re-enable button on error
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Animated GIF';
        downloadBtn.disabled = false;
    }
}

// Download frames as individual PNG files
function downloadFramesIndividually(frames, onComplete) {
    let downloadedCount = 0;
    const totalFrames = frames.length;
    
    frames.forEach((frame, index) => {
        setTimeout(() => {
            try {
                const a = document.createElement('a');
                a.href = frame.canvas;
                a.download = `frame-${String(index + 1).padStart(3, '0')}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                downloadedCount++;
                logInfo(`Frame ${index + 1} downloaded`, { 
                    downloaded: downloadedCount, 
                    total: totalFrames 
                });
                
                // Check if all frames are downloaded
                if (downloadedCount === totalFrames && onComplete) {
                    onComplete();
                }
            } catch (error) {
                logError(`Error downloading frame ${index + 1}`, error);
            }
        }, index * 200); // Stagger downloads with more delay
    });
    
    logInfo('Individual frame downloads initiated', { frameCount: frames.length });
}

// Create animated GIF from frames using a more reliable method
function createAnimatedGIF(frames, onComplete) {
    try {
        logInfo('Creating animated GIF', { frameCount: frames.length });
        
        // Use a different approach - create a simple animated GIF manually
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size from first frame
        const firstFrame = frames[0];
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Create a simple animated GIF using multiple frames
            createSimpleAnimatedGIF(frames, canvas, onComplete);
        };
        img.src = firstFrame.canvas;
        
    } catch (error) {
        logError('Error creating animated GIF', error);
        onComplete(null);
    }
}

// Create a simple animated GIF using a different approach
function createSimpleAnimatedGIF(frames, canvas, onComplete) {
    try {
        // Try using the gif.js library with better configuration
        if (typeof GIF !== 'undefined') {
            logInfo('Using GIF.js library for GIF creation');
            
            const gif = new GIF({
                workers: 1,
                quality: 10,
                width: canvas.width,
                height: canvas.height,
                dither: false,
                transparent: null,
                background: '#ffffff',
                workerScript: 'gif.worker.js',
                repeat: 0,
                globalPalette: false
            });
            
            let framesAdded = 0;
            
            // Add frames with proper delays
            frames.forEach((frame, index) => {
                const img = new Image();
                img.onload = function() {
                    try {
                        gif.addFrame(img, { delay: frame.delay });
                        framesAdded++;
                        
                        if (framesAdded === frames.length) {
                            // All frames added, render the GIF
                            gif.on('finished', function(blob) {
                                logInfo('GIF created successfully', { size: blob.size });
                                onComplete(blob);
                            });
                            
                            gif.on('error', function(error) {
                                logError('GIF.js error during rendering', error);
                                // Fallback to frame sequence
                                createFrameSequence(frames, onComplete);
                            });
                            
                            gif.render();
                        }
                    } catch (error) {
                        logError(`Error adding frame ${index + 1}`, error);
                        framesAdded++;
                        
                        if (framesAdded === frames.length) {
                            // Try to render anyway
                            gif.render();
                        }
                    }
                };
                
                img.onerror = function() {
                    logError(`Error loading frame ${index + 1} image`);
                    framesAdded++;
                    
                    if (framesAdded === frames.length) {
                        // Fallback to frame sequence
                        createFrameSequence(frames, onComplete);
                    }
                };
                
                img.src = frame.canvas;
            });
            
        } else {
            // Fallback: create a simple frame sequence
            logInfo('GIF.js not available, creating frame sequence');
            createFrameSequence(frames, onComplete);
        }
        
    } catch (error) {
        logError('Error in GIF creation', error);
        // Fallback to frame sequence
        createFrameSequence(frames, onComplete);
    }
}

// Fallback: create a downloadable frame sequence
function createFrameSequence(frames, onComplete) {
    try {
        // Create a ZIP file with all frames
        logInfo('Creating frame sequence as alternative');
        
        // For now, just download the first frame and show a message
        const firstFrame = frames[0];
        const a = document.createElement('a');
        a.href = firstFrame.canvas;
        a.download = 'frame-001.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showError('GIF creation failed. Downloaded first frame instead. Try refreshing and using different settings.');
        onComplete(null);
        
    } catch (error) {
        logError('Error in frame sequence creation', error);
        onComplete(null);
    }
}

// Copy error logs to clipboard
function copyLogsToClipboard() {
    try {
        const logText = generateLogText();
        navigator.clipboard.writeText(logText).then(() => {
            alert('Logs copied to clipboard! Paste them in your message to me.');
        }).catch(() => {
            const textArea = document.createElement('textarea');
            textArea.value = logText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Logs copied to clipboard! Paste them in your message to me.');
        });
    } catch (error) {
        logError('Error copying logs to clipboard', error);
        alert('Error copying logs. Please check the browser console instead.');
    }
}

// Generate formatted log text
function generateLogText() {
    const logText = [
        '=== MP4 to GIF Converter Error Logs ===',
        `Timestamp: ${new Date().toISOString()}`,
        `Browser: ${debugInfo.browser}`,
        `Platform: ${debugInfo.platform}`,
        `User Agent: ${debugInfo.userAgent}`,
        `Protocol: ${debugInfo.protocol}`,
        '',
        '=== Error Logs ===',
        ...errorLogs.map(log => 
            `[${log.timestamp}] ${log.level}: ${log.message}${log.data ? '\n  Data: ' + JSON.stringify(log.data, null, 2) : ''}`
        ),
        '',
        '=== End of Logs ==='
    ].join('\n');
    
    return logText;
}

// Reset the converter
function resetConverter() {
    logInfo('Resetting converter');
    
    fileInput.value = '';
    videoFile = null;
    convertedGifBlob = null;
    
    videoPreview.src = '';
    
    fpsSlider.value = 10;
    scaleSlider.value = 400;
    qualitySlider.value = 7;
    updateSliderValues();
    
    progressFill.style.width = '0%';
    progressText.textContent = 'Processing frames...';
    
    showSection(uploadArea.parentElement);
    hideSection(videoSection);
    hideSection(progressSection);
    hideSection(outputSection);
    hideSection(errorSection);
    
    convertBtn.disabled = true;
    
    // Clean up animation interval
    if (window.animationInterval) {
        clearInterval(window.animationInterval);
        window.animationInterval = null;
    }
    
    // Clean up video frames
    if (window.videoFrames) {
        window.videoFrames = [];
    }
    
    if (processingTimeout) {
        clearTimeout(processingTimeout);
        processingTimeout = null;
    }
}

// Show a specific section
function showSection(section) {
    if (section) {
        section.classList.remove('hidden');
        section.classList.add('fade-in');
    }
}

// Hide a specific section
function hideSection(section) {
    if (section) {
        section.classList.add('hidden');
        section.classList.remove('fade-in');
    }
}

// Show error message with copy logs button
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerHTML = `
        ${message}
        <br><br>
        <button onclick="copyLogsToClipboard()" style="
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer;
            margin-right: 10px;
        ">
            📋 Copy Error Logs
        </button>
        <button onclick="resetConverter()" style="
            background: #6c757d; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer;
        ">
            🔄 Try Again
        </button>
    `;
    
    showSection(errorSection);
    hideSection(videoSection);
    hideSection(progressSection);
    hideSection(outputSection);
    
    logError('Error displayed to user', { message: message });
}

// Handle video load errors
videoPreview.addEventListener('error', function() {
    logError('Video preview load error');
    showError('Error loading video. Please try a different file.');
});

// Handle video load success
videoPreview.addEventListener('loadeddata', function() {
    logInfo('Video preview loaded successfully');
});
