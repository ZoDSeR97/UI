import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, Repeat } from 'lucide-react';
import { cn, playAudio } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { v4 as uuidv4 } from 'uuid';

export default function Photoshoot() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>((sessionStorage.getItem('language') as Language) || 'en');
  const [countdown, setCountdown] = useState(8);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedRetake, setSelectedRetake] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uuid, setUuid] = useState(sessionStorage.getItem("uuid") || null);

  const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  useEffect(() => {
    const newUuid = uuidv4();
    console.log(newUuid)
    setUuid(newUuid);
    const initializeLiveView = async () => {
      await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/start_live_view`);
    };
    initializeLiveView();
    playAudio("/src/assets/audio/look_up_smile.wav");
  }, []);

  // Countdown and photo capture logic
  useEffect(() => {
    if (uuid && countdown > 0) {
      if (countdown == 4 || countdown == 8)
        playAudio("/src/assets/audio/count.wav");
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      capturePhoto()
    }
  }, [countdown, uuid])

  const capturePhoto = async () => {
    await sleep(100);
    setIsCapturing(true);
    await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/capture`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ uuid: uuid })
      }
    )
    const data = await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/get_photo?uuid=${uuid}`).then(res=>res.json())
    if (data && data.images && data.images.length > 0) {
      const latestImage = data.images[data.images.length - 1];
      if (data.videos != undefined) {
        if (data.videos.length != 0) {
          const videoUrl = data.videos[0].url
          sessionStorage.setItem("videoUrl", videoUrl)
        }
      }
      if (selectedRetake !== null) {
        // Replace photo at selected index
        setPhotos(prev => {
          const newPhotos = [...prev]
          newPhotos[selectedRetake] = latestImage
          return newPhotos
        })
        setSelectedRetake(null)
      } else {
        // Add new photo
        setPhotos(prev => [...prev, latestImage])
      }
    }
    setIsCapturing(false)
  };

  const handleRetake = (index: number) => {
    setSelectedRetake(index)
    setCountdown(8)
  }

  useEffect(() => {
    if (photos.length === 0 || photos.length < 8) {
      startCapture()
    }
  }, [photos])

  const startCapture = () => {
    if (photos.length < 8 && !isCapturing) {
      setCountdown(8)
    }
  }

  const goToSelection = async () => {
    if (photos.length > 0 && photos.length === 8) {
      sessionStorage.setItem("uuid", uuid);

      sessionStorage.setItem('photos', JSON.stringify(photos));

      sessionStorage.setItem('choosePhotos', JSON.stringify(photos.map(photo => photo.id)));
      
      await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/stop_live_view`)
      navigate("/photo-choose");
    }
  };

  return (
    <div className="relative flex flex-col bg-background py-6">
      {/* Message */}
      <div className="relative top-4 left-1/2 -translate-x-1/2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-pink-500">
          JUST LOOK UP AND SMILE
        </h2>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="flex w-full max-w-7xl gap-6 md:grid-cols-[1fr_400px]">
          {/* Camera Preview */}
          <div className="flex-shrink-0 relative overflow-hidden rounded-xl border bg-muted">
            {
              <img
                src={`${import.meta.env.VITE_REACT_APP_API}/api/video_feed`}
                alt="Live View"
                className='w-full'
              />
            }
            <canvas ref={canvasRef} className="hidden" />

            {/* Countdown Overlay */}
            <AnimatePresence>
              {!isCapturing && (
                <motion.div
                  initial={{ opacity: 0, scale: 2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/50 text-9xl font-bold text-pink-500"
                >
                  {countdown}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Photos Grid */}
          <Card className="flex flex-col p-4 text-pink-500">
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
                        src={photos[index].url}
                        alt={`Photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 hidden items-center justify-center bg-background/50 group-hover:flex">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => handleRetake(index)}
                          disabled={photos.length < 8 || isCapturing}
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
                onClick={() => setPhotos([])}
                disabled={photos.length < 8 || isCapturing}
              >
                Reset All
              </Button>
              <Button
                onClick={goToSelection}
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
      <div className="absolute top-8 left-8">
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
            src="/src/assets/icon/GS25.png"
            alt="Mascot"
            className="max-w-60"
          />
        </motion.div>
      </div>
    </div>
  )
}