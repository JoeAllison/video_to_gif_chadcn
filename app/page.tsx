'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg">
                <Video className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Video to GIF Converter
                </h1>
                <p className="text-sm text-muted-foreground flex items-center space-x-2">
                  <Sparkles className="h-3 w-3" />
                  <span>Powered by ShadCN Design System</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Zap className="h-3 w-3 mr-1" />
                v2.0 - ShadCN UI
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <section className="text-center mb-12">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl font-bold text-foreground leading-tight text-center">
                Transform Your Videos into Beautiful Animated GIFs
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed text-center">
                Upload any video format and convert it to high-quality animated GIFs with our advanced browser-based converter. 
                No server uploads, complete privacy, and professional results.
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Fast Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>High Quality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span>Multiple Formats</span>
                </div>
              </div>
            </div>
          </section>
          
          {/* Main Converter Section - Single Column Layout */}
          <div className="space-y-16">
            
            {/* Upload Section */}
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm dark:bg-card/80 w-full">
              <CardContent className="px-12 py-12">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer group",
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
                      <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-semibold text-green-700 dark:text-green-300">
                        File Selected!
                      </h3>
                      <p className="text-foreground font-medium text-lg">{videoFile.name}</p>
                      <p className="text-muted-foreground">
                        Scroll down to configure settings and start conversion
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center group-hover:bg-accent transition-colors">
                        <FileVideo className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground">
                        Upload Your Video
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        Drag and drop your video file or click to browse
                      </p>
                      <div className="inline-flex items-center space-x-3 bg-muted px-4 py-2 rounded-full">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Supports MP4, MOV, AVI, WebM, and other video formats
                        </span>
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



              {/* Progress Section */}
              {isConverting && (
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm dark:bg-card/80">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      Converting Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
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

              {/* Output Section */}
              {showPreview && videoFrames.length > 0 && (
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm dark:bg-card/80">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-foreground">
                      Conversion Complete!
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                      Your video has been converted to {videoFrames.length} frames
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                                     <div className="text-center">
                   <div className="relative inline-block">
                     <img
                       src={videoFrames[currentFrame]?.dataUrl}
                       alt={`Frame ${currentFrame + 1}`}
                       className="max-w-full h-auto rounded-xl border-4 border-card shadow-2xl"
                     />
                     <div className="absolute top-4 right-4">
                       <Badge className="bg-black/20 text-white backdrop-blur-sm text-lg px-4 py-2">
                         Frame {currentFrame + 1} of {videoFrames.length}
                       </Badge>
                     </div>
                   </div>
                   
                   {/* Frame Navigation */}
                   <div className="mt-6 flex items-center justify-center space-x-4">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                       disabled={currentFrame === 0}
                       className="px-4"
                     >
                       Previous Frame
                     </Button>
                     
                     <div className="flex items-center space-x-2">
                       <span className="text-sm text-muted-foreground">Frame</span>
                       <input
                         type="number"
                         min="1"
                         max={videoFrames.length}
                         value={currentFrame + 1}
                         onChange={(e) => {
                           const frameIndex = parseInt(e.target.value) - 1
                           if (frameIndex >= 0 && frameIndex < videoFrames.length) {
                             setCurrentFrame(frameIndex)
                           }
                         }}
                         className="w-16 text-center border rounded px-2 py-1 text-sm"
                       />
                       <span className="text-sm text-muted-foreground">of {videoFrames.length}</span>
                     </div>
                     
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setCurrentFrame(Math.min(videoFrames.length - 1, currentFrame + 1))}
                       disabled={currentFrame === videoFrames.length - 1}
                       className="px-4"
                     >
                       Next Frame
                     </Button>
                   </div>
                 </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                           <Button 
                       onClick={downloadGif} 
                       size="lg"
                       data-download-button
                       className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                     >
                       <Download className="h-5 w-5 mr-3" />
                       <span data-download-text>Download GIF</span>
                     </Button>
                      <Button 
                        variant="outline" 
                        onClick={resetConverter}
                        size="lg"
                        className="border-border hover:bg-accent"
                      >
                        <RotateCcw className="h-5 w-5 mr-3" />
                        Convert Another Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Conversion Settings and Actions - Side by Side */}
            {videoFile && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Conversion Settings */}
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm dark:bg-card/80" data-section="conversion-settings">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center space-x-2 text-foreground">
                      <Settings className="h-5 w-5" />
                      <span>Conversion Settings</span>
                    </CardTitle>
                    <CardDescription>
                      Customize your GIF output with these advanced settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    
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
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-foreground text-xl">
                      Ready to Convert?
                    </CardTitle>
                    <CardDescription className="text-base">
                      Configure your settings on the left, then start the conversion process
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-6 px-8 pb-8">
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

            {/* Progress Section */}
            {isConverting && (
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm dark:bg-card/80">
                <CardHeader className="text-center">
                  <CardTitle className="text-foreground">
                    Converting Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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

            {/* Output Section */}
            {showPreview && videoFrames.length > 0 && (
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm dark:bg-card/80">
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">
                    Conversion Complete!
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">
                    Your video has been converted to {videoFrames.length} frames
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
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
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Download className="h-5 w-5 mr-3" />
                      <span data-download-text>Download GIF</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetConverter}
                      size="lg"
                      className="border-border hover:bg-accent"
                    >
                      <RotateCcw className="h-5 w-5 mr-3" />
                      Convert Another Video
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </main>

      {/* Hidden video and canvas for frame capture */}
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
