import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Check, Repeat } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function Photoshoot() {
  const [photos, setPhotos] = useState<string[]>([])
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [countdown, setCountdown] = useState(8)
  const [isCapturing, setIsCapturing] = useState(false)
  const [selectedRetake, setSelectedRetake] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch((err) => console.error("Error accessing camera:", err))

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  // Countdown and photo capture logic
  useEffect(() => {
    if (isCapturing && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isCapturing && countdown === 0) {
      capturePhoto()
    }
  }, [countdown, isCapturing])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the current video frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to base64 image
        const photoData = canvas.toDataURL("image/png")

        if (selectedRetake !== null) {
          // Replace photo at selected index
          setPhotos(prev => {
            const newPhotos = [...prev]
            newPhotos[selectedRetake] = photoData
            return newPhotos
          })
          setSelectedRetake(null)
        } else {
          // Add new photo
          setPhotos(prev => [...prev, photoData])
          setCurrentPhoto(prev => prev + 1)
        }
      }
    }

    setIsCapturing(false)
    setCountdown(8)
  }, [selectedRetake])

  const handleRetake = (index: number) => {
    setSelectedRetake(index)
    setIsCapturing(true)
    setCountdown(8)
  }

  const startCapture = () => {
    if (photos.length < 8 && !isCapturing) {
      setIsCapturing(true)
    }
  }

  useEffect(() => {
    if (photos.length === 0) {
      startCapture()
    }
  }, [photos])

  return (
    <div className="fixed flex min-h-screen flex-col bg-background inset-0 bg-pink-50 px-1 py-6 mb-36">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="grid w-full max-w-7xl gap-6 md:grid-cols-[1fr_400px]">
          {/* Camera Preview */}
          <div className="relative overflow-hidden rounded-xl border bg-muted">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Countdown Overlay */}
            <AnimatePresence>
              {isCapturing && (
                <motion.div
                  initial={{ opacity: 0, scale: 2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/50 text-9xl font-bold"
                >
                  {countdown}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Photos Grid */}
          <Card className="flex flex-col p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Photos ({photos.length}/8)</h2>
              <Progress value={(photos.length / 8) * 100} className="w-32" />
            </div>

            <div className="grid flex-1 grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "group relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted",
                    selectedRetake === index && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  {photos[index] ? (
                    <>
                      <img
                        src={photos[index]}
                        alt={`Photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 hidden items-center justify-center bg-background/50 group-hover:flex">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => handleRetake(index)}
                        >
                          <Repeat className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPhotos([])}
                disabled={photos.length === 0 || isCapturing}
              >
                Reset All
              </Button>
              <Button
                onClick={() => onComplete?.(photos)}
                disabled={photos.length < 8 || isCapturing}
              >
                <Check className="mr-2 h-4 w-4" />
                Done
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Cute Character */}
      <div className="absolute bottom-8 left-8">
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img
            src="/placeholder.svg?height=150&width=150"
            alt="Mascot"
            className="h-[150px] w-[150px]"
          />
        </motion.div>
      </div>

      {/* Message */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          JUST LOOK UP AND SMILE
        </h2>
      </div>
    </div>
  )
}