'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Upload, Video, Play, Download, RotateCcw, CheckCircle, Info } from 'lucide-react'

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Video className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Video to GIF Converter</h1>
                <p className="text-sm text-muted-foreground">Powered by ShadCN Design System</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              v2.0 - ShadCN UI
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Your Video</span>
              </CardTitle>
              <CardDescription>
                Drag and drop your video file or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  videoFile 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {videoFile ? (
                  <div className="space-y-3">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                      File Selected!
                    </h3>
                    <p className="text-sm text-muted-foreground">{videoFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Click "Start Conversion" to begin
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold">Drop your video file here</h3>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
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
              
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center space-x-1">
                  <Info className="h-3 w-3" />
                  <span>Supports MP4, MOV, AVI, WebM, and other video formats</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Video Preview */}
          {videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Video Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Controls */}
          {videoFile && (
            <Card>
              <CardHeader>
                <CardTitle>Conversion Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Frames per Second (FPS)</label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[fps]}
                        onValueChange={(value) => setFps(value[0])}
                        max={30}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-lg font-bold text-primary w-8 text-center">
                        {fps}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1</span>
                      <span>30</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Quality</label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[quality]}
                        onValueChange={(value) => setQuality(value[0])}
                        max={10}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-lg font-bold text-primary w-8 text-center">
                        {quality}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={startConversion} 
                    disabled={isConverting}
                    className="flex-1"
                  >
                    {isConverting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Conversion
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetConverter}
                    disabled={isConverting}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          {isConverting && (
            <Card>
              <CardHeader>
                <CardTitle>Converting Video</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  Processing frames... {Math.round(progress)}%
                </p>
              </CardContent>
            </Card>
          )}

          {/* Output */}
          {showPreview && videoFrames.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Conversion Complete!</CardTitle>
                <CardDescription>
                  Your video has been converted to {videoFrames.length} frames
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <img
                    src={videoFrames[currentFrame]?.dataUrl}
                    alt={`Frame ${currentFrame + 1}`}
                    className="max-w-full h-auto rounded-lg border"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Frame {currentFrame + 1} of {videoFrames.length}
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button onClick={downloadGif} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Frame
                  </Button>
                  <Button variant="outline" onClick={resetConverter}>
                    <RotateCcw className="h-4 w-4 mr-2" />
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
