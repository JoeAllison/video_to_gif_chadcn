// MP4 to GIF Converter with ADS Drone Design System
// Enhanced with modern UI components and improved user experience

// Global variables
let videoFile = null;
let videoElement = null;
let isConverting = false;

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const videoSection = document.getElementById('videoSection');
const controlsSection = document.getElementById('controlsSection');
const progressSection = document.getElementById('progressSection');
const outputSection = document.getElementById('outputSection');
const errorSection = document.getElementById('errorSection');
const videoPlayer = document.getElementById('videoPlayer');
const fpsSlider = document.getElementById('fpsSlider');
const fpsValue = document.getElementById('fpsValue');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const gifOutput = document.getElementById('gifOutput');
const downloadBtn = document.getElementById('downloadBtn');
const errorMessage = document.getElementById('errorMessage');
const errorCloseBtn = document.getElementById('errorCloseBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚁 MP4 to GIF Converter initialized with ADS Drone Design System');
    
    setupEventListeners();
    setupSliderControls();
    
    // Check if Drone UI is available
    if (window.droneUI) {
        console.log('✅ Drone Design System loaded successfully');
    } else {
        console.log('⚠️ Drone Design System not available, using fallback styling');
    }
});

// Setup event listeners
function setupEventListeners() {
    // File upload events
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // Button events
    startBtn.addEventListener('click', startConversion);
    resetBtn.addEventListener('click', resetConverter);
    downloadBtn.addEventListener('click', () => downloadAllFrames(window.videoFrames));
    errorCloseBtn.addEventListener('click', hideError);
    
    // Video events
    videoPlayer.addEventListener('loadedmetadata', onVideoLoaded);
}

// Setup slider controls
function setupSliderControls() {
    // FPS slider
    fpsSlider.addEventListener('input', function() {
        const value = this.value;
        fpsValue.textContent = value;
    });
    
    // Quality slider
    qualitySlider.addEventListener('input', function() {
        const value = this.value;
        qualityValue.textContent = value;
    });
}

// Handle drag and drop
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--drone-primary-500)';
    uploadArea.style.backgroundColor = 'var(--drone-primary-50)';
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--drone-neutral-300)';
    uploadArea.style.backgroundColor = 'var(--drone-neutral-100)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// Process selected file
function handleFile(file) {
    if (!file.type.startsWith('video/')) {
        showError('Please select a valid video file.');
        return;
    }
    
    videoFile = file;
    const videoUrl = URL.createObjectURL(file);
    
    // Update video player
    videoPlayer.src = videoUrl;
    videoPlayer.load();
    
    // Show video section
    showSection(videoSection);
    showSection(controlsSection);
    
    // Update upload area
    uploadArea.innerHTML = `
        <div class="drone-text--center drone-m-4">
            <i class="fas fa-check-circle drone-text--success" style="font-size: 3rem; margin-bottom: var(--drone-space-4);"></i>
            <h3 class="drone-text--lg drone-text--semibold drone-text--success drone-m-4">File Selected!</h3>
            <p class="drone-text--base drone-text--neutral drone-m-0">${file.name}</p>
            <p class="drone-text--sm drone-text--neutral drone-m-2">Click "Start Conversion" to begin</p>
        </div>
    `;
    
    logInfo('Video file loaded', { name: file.name, size: file.size, type: file.type });
}

// Video loaded event
function onVideoLoaded() {
    logInfo('Video metadata loaded', { 
        duration: videoPlayer.duration, 
        width: videoPlayer.videoWidth, 
        height: videoPlayer.videoHeight 
    });
}

// Start conversion process
function startConversion() {
    if (!videoFile || isConverting) {
        return;
    }
    
    isConverting = true;
    startBtn.disabled = true;
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin drone-m-2"></i> Converting...';
    
    // Show progress section
    showSection(progressSection);
    hideSection(controlsSection);
    
    // Get conversion settings
    const fps = parseInt(fpsSlider.value);
    const quality = parseInt(qualitySlider.value);
    
    logInfo('Starting conversion', { fps, quality });
    
    // Initialize conversion
    initializeConversion(fps, quality);
}

// Initialize conversion process
function initializeConversion(fps, quality) {
    try {
        // Calculate frame interval
        const frameInterval = 1000 / fps;
        
        // Store frames
        window.videoFrames = [];
        let currentTime = 0;
        let frameCount = 0;
        
        // Progress tracking
        const totalFrames = Math.ceil(videoPlayer.duration * fps);
        let processedFrames = 0;
        
        logInfo('Conversion initialized', { 
            totalFrames, 
            frameInterval, 
            duration: videoPlayer.duration 
        });
        
        // Frame capture function
        function captureFrame() {
            if (currentTime >= videoPlayer.duration || frameCount >= totalFrames) {
                finishConversion();
                return;
            }
            
            try {
                // Seek to specific time
                videoPlayer.currentTime = currentTime;
                
                // Wait for seek to complete
                videoPlayer.addEventListener('seeked', function onSeeked() {
                    videoPlayer.removeEventListener('seeked', onSeeked);
                    
                    // Capture frame
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set canvas size
                    canvas.width = videoPlayer.videoWidth;
                    canvas.height = videoPlayer.videoHeight;
                    
                    // Draw video frame to canvas
                    ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                    
                    // Create frame object
                    const frame = {
                        canvas: canvas.toDataURL('image/png', quality / 10),
                        time: currentTime,
                        delay: frameInterval,
                        index: frameCount
                    };
                    
                    // Add to frames array
                    window.videoFrames.push(frame);
                    frameCount++;
                    processedFrames++;
                    
                    // Update progress
                    const progress = (processedFrames / totalFrames) * 100;
                    updateProgress(progress, `Processing frame ${processedFrames} of ${totalFrames}`);
                    
                    // Continue to next frame
                    currentTime += frameInterval / 1000;
                    setTimeout(captureFrame, 50); // Small delay to prevent blocking
                });
                
            } catch (error) {
                logError('Error capturing frame', error);
                showError('Error capturing video frame. Please try again.');
                resetConverter();
            }
        }
        
        // Start frame capture
        captureFrame();
        
    } catch (error) {
        logError('Error initializing conversion', error);
        showError('Error starting conversion. Please try again.');
        resetConverter();
    }
}

// Update progress bar
function updateProgress(percent, text) {
    progressBar.style.width = `${percent}%`;
    progressText.textContent = text;
    progressPercent.textContent = `${Math.round(percent)}%`;
    
    // Update progress bar color based on completion
    if (percent >= 100) {
        progressBar.style.background = 'linear-gradient(90deg, var(--drone-success-500), var(--drone-success-600))';
    } else if (percent >= 50) {
        progressBar.style.background = 'linear-gradient(90deg, var(--drone-warning-500), var(--drone-warning-600))';
    }
}

// Finish conversion
function finishConversion() {
    isConverting = false;
    
    logInfo('Conversion completed', { 
        totalFrames: window.videoFrames.length 
    });
    
    // Hide progress section
    hideSection(progressSection);
    
    // Show output section
    showSection(outputSection);
    
    // Create animated preview
    createAnimatedPreview();
    
    // Reset start button
    startBtn.disabled = false;
    startBtn.innerHTML = '<i class="fas fa-play drone-m-2"></i> Start Conversion';
}

// Create animated preview
function createAnimatedPreview() {
    if (!window.videoFrames || window.videoFrames.length === 0) {
        showError('No frames available for preview.');
        return;
    }
    
    try {
        // Create animated preview using the first few frames
        const previewFrames = window.videoFrames.slice(0, Math.min(10, window.videoFrames.length));
        let currentFrameIndex = 0;
        
        // Clear previous content
        gifOutput.innerHTML = '';
        
        // Create preview image
        const previewImg = document.createElement('img');
        previewImg.style.maxWidth = '100%';
        previewImg.style.borderRadius = 'var(--drone-radius-lg)';
        gifOutput.appendChild(previewImg);
        
        // Animate preview
        function animatePreview() {
            if (previewFrames[currentFrameIndex]) {
                previewImg.src = previewFrames[currentFrameIndex].canvas;
                currentFrameIndex = (currentFrameIndex + 1) % previewFrames.length;
                setTimeout(animatePreview, 200); // 5 FPS preview
            }
        }
        
        // Start animation
        animatePreview();
        
        // Store animation interval for cleanup
        window.animationInterval = setInterval(animatePreview, 200);
        
        logInfo('Animated preview created', { frameCount: previewFrames.length });
        
    } catch (error) {
        logError('Error creating animated preview', error);
        showError('Error creating preview. Please try again.');
    }
}

// Download all frames as GIF
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
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin drone-m-2"></i> Creating GIF...';
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
        downloadBtn.innerHTML = '<i class="fas fa-download drone-m-2"></i> Download Animated GIF';
        downloadBtn.disabled = false;
    }
}

// Create animated GIF from frames
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

// Fallback: create frame sequence
function createFrameSequence(frames, onComplete) {
    try {
        logInfo('Creating frame sequence fallback');
        
        // Download first frame as PNG
        const firstFrame = frames[0];
        const a = document.createElement('a');
        a.href = firstFrame.canvas;
        a.download = 'frame-001.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showError('GIF creation failed. Downloaded first frame as PNG. Please try again with a different video.');
        onComplete(null);
        
    } catch (error) {
        logError('Error in frame sequence fallback', error);
        showError('Error creating output. Please try again.');
        onComplete(null);
    }
}

// Reset converter
function resetConverter() {
    // Clear variables
    videoFile = null;
    isConverting = false;
    
    // Clear video player
    videoPlayer.src = '';
    
    // Clear frames
    if (window.videoFrames) {
        window.videoFrames = [];
    }
    
    // Clear animation interval
    if (window.animationInterval) {
        clearInterval(window.animationInterval);
        window.animationInterval = null;
    }
    
    // Reset progress
    progressBar.style.width = '0%';
    progressText.textContent = 'Processing frames...';
    progressPercent.textContent = '0%';
    
    // Reset upload area
    uploadArea.innerHTML = `
        <div class="upload-icon drone-m-4">
            <i class="fas fa-video drone-text--primary" style="font-size: 4rem;"></i>
        </div>
        <div class="upload-text">
            <h3 class="drone-text--lg drone-text--semibold drone-text--neutral drone-m-4">Drop your MP4 file here</h3>
            <p class="drone-text--base drone-text--neutral drone-m-0">or click to browse</p>
        </div>
    `;
    
    // Reset buttons
    startBtn.disabled = false;
    startBtn.innerHTML = '<i class="fas fa-play drone-m-2"></i> Start Conversion';
    
    // Hide sections
    hideSection(videoSection);
    hideSection(controlsSection);
    hideSection(progressSection);
    hideSection(outputSection);
    hideSection(errorSection);
    
    // Reset sliders
    fpsSlider.value = 10;
    fpsValue.textContent = '10';
    qualitySlider.value = 7;
    qualityValue.textContent = '7';
    
    logInfo('Converter reset');
}

// Show section
function showSection(section) {
    section.classList.remove('hidden');
    section.classList.add('fade-in');
}

// Hide section
function hideSection(section) {
    section.classList.add('hidden');
    section.classList.remove('fade-in');
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    showSection(errorSection);
    logError('User error', message);
}

// Hide error
function hideError() {
    hideSection(errorSection);
}

// Utility functions
function logInfo(message, data = {}) {
    console.log(`ℹ️ ${message}`, data);
}

function logError(message, error = {}) {
    console.error(`❌ ${message}`, error);
}

// Add fade-in animation class
document.addEventListener('DOMContentLoaded', function() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.drone-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});
