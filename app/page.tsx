'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Monitor
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
    setVideoFrames([])
    setProgress(0)
    setShowPreview(false)
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

    // For now, we'll download the first frame as a PNG
    // In a full implementation, you'd use a GIF library like gif.js
    const link = document.createElement('a')
    link.download = 'converted-frame.png'
    link.href = videoFrames[0].dataUrl
    link.click()
  }, [videoFrames])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  Video to GIF Converter
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center space-x-2">
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
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Transform Your Videos into Beautiful Animated GIFs
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Upload any video format and convert it to high-quality animated GIFs with our advanced browser-based converter. 
              No server uploads, complete privacy, and professional results.
            </p>
          </div>
          
          {/* Upload Section */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-slate-800 dark:text-slate-200">
                Upload Your Video
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
                Drag and drop your video file or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
                  videoFile 
                    ? 'border-green-500 bg-green-50/50 dark:bg-green-950/30 shadow-lg' 
                    : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {videoFile ? (
                  <div className="space-y-4">
                    <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">
                      File Selected!
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{videoFile.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Click "Start Conversion" to begin processing
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <FileVideo className="h-10 w-10 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                      Drop your video file here
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      or click to browse
                    </p>
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
              
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                  <Info className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Supports MP4, MOV, AVI, WebM, and other video formats
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Preview */}
          {videoUrl && (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
                  <Monitor className="h-5 w-5" />
                  <span>Video Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full rounded-xl shadow-lg"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-black/20 text-white backdrop-blur-sm">
                      {videoFile?.name}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Controls */}
          {videoFile && (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
                  <Settings className="h-5 w-5" />
                  <span>Conversion Settings</span>
                </CardTitle>
                <CardDescription>
                  Customize your GIF output with these advanced settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* FPS Control */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>1 FPS</span>
                        <span>30 FPS</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Higher FPS creates smoother animations but larger file sizes
                    </p>
                  </div>

                  {/* Quality Control */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Higher quality means better image clarity but larger files
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button 
                    onClick={startConversion} 
                    disabled={isConverting}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isConverting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
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
                    className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="h-5 w-5 mr-3" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          {isConverting && (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Converting Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="w-full h-3" />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Processing frames... {Math.round(progress)}%
                  </p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {Math.round(progress)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Output */}
          {showPreview && videoFrames.length > 0 && (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-200">
                  Conversion Complete!
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
                  Your video has been converted to {videoFrames.length} frames
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={videoFrames[currentFrame]?.dataUrl}
                      alt={`Frame ${currentFrame + 1}`}
                      className="max-w-full h-auto rounded-xl border-4 border-white dark:border-slate-800 shadow-2xl"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-black/20 text-white backdrop-blur-sm">
                        Frame {currentFrame + 1} of {videoFrames.length}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button 
                    onClick={downloadGif} 
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Download className="h-5 w-5 mr-3" />
                    Download Frame
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetConverter}
                    size="lg"
                    className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
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

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
