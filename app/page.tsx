'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { SupportBlock } from '@/components/ui/support-block'
import { SupportOverlay } from '@/components/ui/support-overlay'
import { nudgeSupportOncePerDay } from '@/lib/support-nudge'
import { trackConversionSuccess } from '@/lib/analytics'
import { showToast } from '@/lib/toast'
import { 
  Upload, 
  Video, 
  Play, 
  Download, 
  RotateCcw, 
  CheckCircle, 
  Info, 
  Settings,
  FileVideo,
  Sparkles,
  Zap,
  Monitor,
  ArrowRight,
  Clock,
  Image as ImageIcon
} from 'lucide-react'

interface VideoFrame {
  dataUrl: string
  time: number
}

export default function VideoToGifConverter() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fps, setFps] = useState(10)
  const [quality, setQuality] = useState(7)
  const [videoFrames, setVideoFrames] = useState<VideoFrame[]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [showSupportOverlay, setShowSupportOverlay] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file.')
      return
    }
    
    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    
    // Set the video source so it can load metadata
    if (videoRef.current) {
      videoRef.current.src = url
      videoRef.current.load()
    }
    
    setVideoFrames([])
    setProgress(0)
    setShowPreview(false)

    // Scroll to the conversion settings section after a short delay
    setTimeout(() => {
      const settingsSection = document.querySelector('[data-section="conversion-settings"]')
      if (settingsSection) {
        settingsSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }, 300)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const startConversion = useCallback(async () => {
    if (!videoFile || !videoRef.current || !canvasRef.current) return

    setIsConverting(true)
    setProgress(0)
    setVideoFrames([])

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Wait for video to be loaded and metadata available
    if (video.readyState < 2) { // HAVE_CURRENT_DATA
      video.addEventListener('loadedmetadata', () => {
        startConversion()
      })
      return
    }

    // Check if duration is available
    if (!video.duration || isNaN(video.duration)) {
      console.error('Video duration not available')
      setIsConverting(false)
      alert('Unable to read video duration. Please try a different video file.')
      return
    }

    const frameInterval = 1000 / fps
    const totalFrames = Math.ceil(video.duration * fps)
    const frames: VideoFrame[] = []
    
    let currentTime = 0
    let frameCount = 0

    const captureFrame = () => {
      if (currentTime >= video.duration || frameCount >= totalFrames) {
        setVideoFrames(frames)
        setIsConverting(false)
        setProgress(100)
        setShowPreview(true)
        
        // Track conversion success
        trackConversionSuccess()
        
        // Scroll to the output section after conversion completes
        setTimeout(() => {
          const outputSection = document.querySelector('[data-output-section]')
          if (outputSection) {
            outputSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            })
          }
          
          // Show support nudge after scrolling
          setTimeout(() => {
            nudgeSupportOncePerDay()
          }, 500)
          
          // Show support overlay shortly after GIF preview appears (1.5 seconds)
          setTimeout(() => {
            setShowSupportOverlay(true)
          }, 1500)
        }, 100)
        
        return
      }

      video.currentTime = currentTime
      
      video.addEventListener('seeked', function onSeeked() {
        video.removeEventListener('seeked', onSeeked)
        
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        
        const dataUrl = canvas.toDataURL('image/jpeg', quality / 10)
        frames.push({ dataUrl, time: currentTime })
        
        frameCount++
        setProgress((frameCount / totalFrames) * 100)
        
        currentTime += frameInterval / 1000
        setTimeout(captureFrame, 0)
      })
    }

    captureFrame()
  }, [videoFile, fps, quality])

  const resetConverter = useCallback(() => {
    setVideoFile(null)
    setVideoUrl('')
    setVideoFrames([])
    setProgress(0)
    setShowPreview(false)
    setCurrentFrame(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Check for thanks URL parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('thanks') === '1') {
        showToast({
          message: 'Thanks for the coffee! You rock 🤘',
          duration: 6000
        })
      }
    }
  }, [])

  const downloadGif = useCallback(async () => {
    if (videoFrames.length === 0) return

    try {
      // Show generating message
      const originalText = document.querySelector('[data-download-text]')?.textContent
      const downloadButton = document.querySelector('[data-download-button]') as HTMLButtonElement
      if (downloadButton) {
        downloadButton.disabled = true
        downloadButton.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>Generating GIF...'
      }

      // Create a new GIF instance
      const gif = new (window as any).GIF({
        workers: 2,
        quality: quality,
        width: canvasRef.current?.width || 640,
        height: canvasRef.current?.height || 480,
        workerScript: '/gif.worker.js'
      })

      // Add each frame to the GIF
      for (let i = 0; i < videoFrames.length; i++) {
        const img = new Image()
        img.src = videoFrames[i].dataUrl
        
        await new Promise((resolve) => {
          img.onload = () => {
            gif.addFrame(img, { delay: 1000 / fps })
            resolve(null)
          }
        })
      }

      // Generate the GIF
      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `converted-video-${fps}fps.gif`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
        
        // Reset button
        if (downloadButton) {
          downloadButton.disabled = false
          downloadButton.innerHTML = '<Download className="h-5 w-5 mr-3" />Download GIF'
        }
        

      })

      gif.render()
    } catch (error) {
      console.error('Error generating GIF:', error)
      alert('Error generating GIF. Please try again.')
      
      // Reset button on error
      const downloadButton = document.querySelector('[data-download-button]') as HTMLButtonElement
      if (downloadButton) {
        downloadButton.disabled = false
        downloadButton.innerHTML = '<Download className="h-5 w-5 mr-3" />Download GIF'
      }
    }
  }, [videoFrames, fps, quality])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-indigo-100 dark:from-background dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm dark:bg-card/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-16 h-16 overflow-hidden">
                <img 
                  src="/logo2.png" 
                  alt="GifVibes Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-blue-600 to-blue-700 bg-clip-text text-transparent drop-shadow-sm">
                    Gif
                  </span>
                  <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-600 bg-clip-text text-transparent drop-shadow-sm ml-1">
                    Vibes
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Professional Video to GIF Converter
                </p>
              </div>
            </div>

            {/* Donate Section with Text and Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Donate Text */}
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Support this tool
                </p>
                <p className="text-xs text-muted-foreground">
                  Help us keep building
                </p>
              </div>
              
              {/* Donate Buttons */}
              <div className="flex items-center space-x-2">
                {/* Buy Me a Coffee */}
                <a
                  href="https://www.buymeacoffee.com/joeallison"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center space-x-1.5 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                  title="Support with Buy Me a Coffee"
                >
                  <span className="text-sm">☕</span>
                  <span className="text-xs">Coffee</span>
                </a>
                
                {/* PayPal */}
                <a
                  href="https://www.paypal.com/donate/?business=5NVA6Q7JXTHC4&amount=5&no_recurring=0&item_name=Supporting+an+independent+creator.+Your+donation+helps+keep+projects+alive+and+growing.+%E2%9D%A4%EF%B8%8F&currency_code=GBP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                  title="Support via PayPal"
                >
                  <span className="text-sm">💸</span>
                  <span className="text-xs">PayPal</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <section className="text-center mb-8">
            <div className="max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                Transform Your Videos into Beautiful Animated GIFs
              </h2>
              <p className="text-muted-foreground">
                Convert videos in your browser with GifVibes. Nothing is uploaded or stored on servers.
              </p>
            </div>
          </section>
          
          {/* Main Converter Section - Single Column Layout */}
          <div className="space-y-8">
            


            {/* Upload Section - Only show before conversion starts */}
            {!isConverting && !showPreview && (
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm dark:bg-card/80 w-full">
                <CardContent className="px-4 sm:px-8 py-6 sm:py-8">
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center transition-all duration-300 cursor-pointer group",
                      videoFile 
                        ? 'border-green-500 bg-green-50/50 dark:bg-green-950/30 shadow-lg' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                                        {videoFile ? (
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-green-700 dark:text-green-300">
                          File Selected!
                        </h3>
                        <p className="text-foreground font-medium text-base sm:text-lg">{videoFile.name}</p>
                        <p className="text-muted-foreground">
                          Scroll down to configure settings and start conversion
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center group-hover:bg-accent transition-colors">
                          <FileVideo className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                          Upload Your Video
                        </h3>
                        <p className="text-muted-foreground text-base sm:text-lg">
                          Drag and drop your video file or click to browse
                        </p>
                        
                        {/* Trust Indicators */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-center space-x-3">
                            <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full">
                              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium text-green-700 dark:text-green-300">100% Private</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-full">
                              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Secure</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground text-center">
                            Your video never leaves your device • All processing happens locally
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Supports MP4, MOV, AVI, WebM and other formats
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(file)
                    }}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            )}

            {/* Conversion Settings and Actions - Side by Side - Only show before conversion */}
            {videoFile && !isConverting && !showPreview && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-8">
                {/* Conversion Settings */}
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm dark:bg-card/80" data-section="conversion-settings">
                  <CardHeader className="text-center px-4 sm:px-6">
                    <CardTitle className="flex items-center justify-center space-x-2 text-foreground">
                      <Settings className="h-5 w-5" />
                      <span>Conversion Settings</span>
                    </CardTitle>
                    <CardDescription>
                      Customize your GIF output with these advanced settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 px-4 sm:px-6 pb-6">
                    
                    {/* FPS Control */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                          Frames per Second (FPS)
                        </label>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                          {fps} FPS
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <Slider
                          value={[fps]}
                          onValueChange={(value) => setFps(value[0])}
                          max={30}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1 FPS</span>
                          <span>30 FPS</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Higher FPS creates smoother animations but larger file sizes
                      </p>
                    </div>

                    <Separator />

                    {/* Quality Control */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                          Image Quality
                        </label>
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300">
                          {quality}/10
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <Slider
                          value={[quality]}
                          onValueChange={(value) => setQuality(value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Higher quality means better image clarity but larger files
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm dark:bg-card/80">
                  <CardHeader className="text-center pb-6 px-4 sm:px-6">
                    <CardTitle className="text-foreground text-xl">
                      Ready to Convert?
                    </CardTitle>
                    <CardDescription className="text-base">
                      Configure your settings on the left, then start the conversion process
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-6 px-4 sm:px-8 pb-6 sm:pb-8">
                    <Button 
                      onClick={startConversion} 
                      disabled={isConverting}
                      size="lg"
                      className="w-full max-w-xs bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-700 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isConverting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-3" />
                          Start Conversion
                      </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetConverter}
                      disabled={isConverting}
                      size="lg"
                      className="w-full max-w-xs border-border hover:bg-accent"
                    >
                      <RotateCcw className="h-5 w-5 mr-3" />
                      Choose Different Video
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Progress Section - Only show when converting and not showing preview */}
            {isConverting && !showPreview && (
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm dark:bg-card/80">
                <CardHeader className="text-center px-4 sm:px-6">
                  <CardTitle className="text-foreground">
                    Converting Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 px-4 sm:px-6">
                  <Progress value={progress} className="w-full h-4" />
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                      Processing frames... {Math.round(progress)}%
                    </p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-lg px-4 py-2">
                      {Math.round(progress)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Output Section - Only show when conversion is complete */}
            {showPreview && videoFrames.length > 0 && !isConverting && (
              <>
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm dark:bg-card/80" data-output-section>
                  <CardHeader className="text-center px-4 sm:px-6">
                    <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                      <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl text-foreground">
                      Conversion Complete!
                    </CardTitle>
                    <CardDescription className="text-base sm:text-lg text-muted-foreground">
                      Your video has been converted to {videoFrames.length} frames
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 px-4 sm:px-6">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <img
                          src={videoFrames[currentFrame]?.dataUrl}
                          alt="Animated GIF Preview"
                          className="max-w-full h-auto rounded-xl border-4 border-card shadow-2xl"
                          style={{
                            animation: `frameAnimation ${videoFrames.length * (1000 / fps)}ms steps(${videoFrames.length}) infinite`
                          }}
                        />
                        <style dangerouslySetInnerHTML={{
                          __html: `
                            @keyframes frameAnimation {
                              ${videoFrames.map((_, index) => 
                                `${(index / videoFrames.length) * 100}% { content: url("${videoFrames[index]?.dataUrl}"); }`
                              ).join('\n')}
                          }
                        `
                      }} />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                      <Button 
                        onClick={downloadGif} 
                        size="lg"
                        data-download-button
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-h-[48px] sm:min-h-[56px]"
                      >
                        <Download className="h-5 w-5 mr-3" />
                        <span data-download-text>Download GIF</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={resetConverter}
                        size="lg"
                        className="border-border hover:bg-accent min-h-[48px] sm:min-h-[56px]"
                      >
                        <RotateCcw className="h-5 w-5 mr-3" />
                        Convert Another Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>


              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/80 backdrop-blur-sm dark:bg-card/80 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            {/* Support Block - Footer */}
            <SupportBlock placement="footer" />
            
            {/* Footer Links */}
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <span>Made with ❤️ by GifVibes for the community</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Hidden video and canvas for frame capture */}
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Support Overlay - Roadblock after download */}
      <SupportOverlay
        isVisible={showSupportOverlay}
        onClose={() => setShowSupportOverlay(false)}
        supportersCount={42} // You can make this dynamic later
      />
    </div>
  )
}
