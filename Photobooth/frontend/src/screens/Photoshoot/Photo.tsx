import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, Repeat, Trash2 } from 'lucide-react';
import { cn, playAudio } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { v4 as uuidv4 } from 'uuid';

interface Photo {
  id: number
  url: string
}

export default function Photoshoot() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [countdown, setCountdown] = useState(5);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedRetake, setSelectedRetake] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uuid, setUuid] = useState(sessionStorage.getItem("uuid") || "");

  const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  useEffect(() => {
    const newUuid = uuidv4();
    setUuid(newUuid);
    const initializeLiveView = async () => {
      await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/start_live_view`)
        .then(response => console.log(response));
    };
    initializeLiveView();
    playAudio("/src/assets/audio/look_up_smile.wav");
  }, []);

  const capturePhoto = async () => {
    await sleep(100);
    setIsCapturing(true);
    await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/capture`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: uuid })
      }
    )
    const data = await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/get_photo?uuid=${uuid}`).then(res => res.json())
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
        if (photos.length < 8)
          // Add new photo
          setPhotos(prev => [...prev, latestImage])
      }
      setIsCapturing(false)
    } else {
      navigate(-1)
    }
  };

  const startRecording = async() => {
    await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/start_recording`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: uuid })
      }
    )
  }

  // Countdown and photo capture logic
  useEffect(() => {
    if (uuid && countdown > 0) {
      if (countdown == 5){
        playAudio("/src/assets/audio/count.wav");
        /* startRecording(); */
      }
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      capturePhoto()
    }
  }, [countdown, uuid])

  const handleRetake = (index: number) => {
    setSelectedRetake(index)
    setCountdown(5)
  }

  const startCapture = useCallback(() => {
    if (photos.length < 8 && !isCapturing) {
      setCountdown(5)
    }
  }, [isCapturing, photos.length])

  useEffect(() => {
    if (photos.length === 0 || photos.length < 8) {
      startCapture()
    }
  }, [photos, startCapture])

  const goToSelection = async () => {
      sessionStorage.setItem("uuid", uuid);

      sessionStorage.setItem('photos', JSON.stringify(photos));

      await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/stop_live_view`)
      navigate("/photo-choose");
  };

  return (
    <div className="fixed inset-0 flex flex-col py-1 bg-pink-50 items-center justify-center">
      {/* Camera Preview */}
      <div className="relative h-full w-full max-w-[1200px] max-h-[1080px] overflow-hidden bg-muted">
        <img
          src={`${import.meta.env.VITE_REACT_APP_API}/api/video_feed`}
          alt="Live View"
          className='h-full w-full object-cover transform-gpu -scale-x-100'
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Countdown Overlay */}
        <AnimatePresence>
          {!isCapturing && (
            <motion.div 
              initial={{ opacity: 0, scale: 2 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/50 text-9xl font-bold text-pink-500">
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cute Character */}
        <div className="absolute bottom-8 left-8">
          <motion.div animate={{ y: [0, -10, 0], }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", }}>
            <img src="/src/assets/icon/mascot.svg" alt="Mascot" className="h-[150px] w-[150px]" />
          </motion.div>
        </div>

        {/* Message */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-pink-500">
            {t('text.photo')}
          </h2>
        </div>
      </div>

      {/* Photos Strip */}
      <div className="w-full bg-pink-50 backdrop-blur-sm container justify-center items-center">
        <div className="py-4 bg-pink-50">
          <Carousel 
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full bg-pink-50">
            <CarouselContent className="justify-center items-center">
              {Array.from({ length: 8 }).map((_, index) => (
                <CarouselItem key={index} className="basis-1/6 pl-4">
                  <div className={cn("group relative aspect-auto overflow-hidden rounded-lg border bg-muted w-[220px] mx-auto",
                    selectedRetake === index && "ring-2 ring-primary ring-offset-2")}>
                    {photos[index] ? (
                      <>
                        <img 
                          src={photos[index].url} 
                          alt={`Photo ${index + 1}`} 
                          className="h-full w-full object-cover transform-gpu -scale-x-100"
                        />
                        <div className="absolute inset-0 hidden items-center justify-center group-hover:flex">
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            onClick={() => handleRetake(index)}
                            disabled={photos.length < 8 || isCapturing || selectedRetake !== null}
                          >
                            <Repeat className="h-4 w-4 " />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-[163px] items-center justify-center">
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-pink-500 bg-pink-500 text-white hover:bg-pink-600" />
            <CarouselNext className="border-pink-500 bg-pink-500 text-white hover:bg-pink-600" />
          </Carousel>
        </div>
      </div>
      {/* Action Buttons */}
      <Button 
          onClick={() => setPhotos([])}
          disabled={photos.length < 8 || isCapturing || selectedRetake !== null}
          className='absolute top-1/2 left-40 bg-pink-500 hover:bg-pink-600 rounded-full text-white'
        >
          <Trash2 className="h-full w-full" />
          {t('menu.reset')}
        </Button>
        <Button 
          onClick={goToSelection}
          disabled={photos.length < 8 || isCapturing || selectedRetake !== null}
          className='absolute top-1/2 right-40 bg-pink-500 hover:bg-pink-600 rounded-full text-white'
        >
          <Check className="h-full w-full" />
          {t('menu.continue')}
        </Button>
    </div>
  )
}