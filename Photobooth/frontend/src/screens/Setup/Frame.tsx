import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { cn, playAudio } from '@/lib/utils'

interface FrameData {
    id: number
    title: string
    position: string
    photo: string
    photo_hover: string
    photo_full: string
    price: number
}

export default function Frame(): JSX.Element {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [frames, setFrames] = useState<FrameData[]>([])
    const [selectedFrames, setSelectedFrames] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        playAudio('/src/assets/audio/choose_frame_layout.wav')
        fetchFrames()
    }, [])

    const fetchFrames = async (): Promise<void> => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/frames/api`)
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const data = await response.json()
            const processedFrames: FrameData[] = data.map((frame: Omit<FrameData, 'photo_full'>) => ({
                ...frame,
                photo_full: `${import.meta.env.VITE_REACT_APP_BACKEND}${frame.photo}`,
                photo_hover: `${import.meta.env.VITE_REACT_APP_BACKEND}${frame.photo_hover}`
            }))
            setFrames(processedFrames)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
            setError(errorMessage)
            console.error('Error fetching frames:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFrameSelect = async (frame: FrameData): Promise<void> => {
        try {
            await playAudio('/src/assets/audio/click.wav')
            setSelectedFrames(prev => {
                const isSelected = prev.includes(frame.title)
                if (isSelected) return prev.filter(title => title !== frame.title)
                return [...prev, frame.title]
            })
            sessionStorage.setItem('selectedFrame', JSON.stringify({ frame: frame.title }))
            sessionStorage.setItem('framePrice', frame.price.toString())
            navigate('/background')
        } catch (error) {
            console.error('Error handling frame selection:', error)
        }
    }

    const handleBack = async (): Promise<void> => {
        try {
            await playAudio('/src/assets/audio/click.wav')
            navigate('/')
        } catch (error) {
            console.error('Error handling back:', error)
        }
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-500 text-center">
                    <p>{t('text.frame')}: {error}</p>
                    <Button onClick={fetchFrames} className="mt-4">{t('menu.retry')}</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-pink-50 flex flex-col px-1 py-6 mb-48">
            {/* Header Section */}
            <div className="h-[15vh] flex items-center px-16">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        variant="outline"
                        size="lg"
                        className="flex items-center space-x-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full border-none"
                        onClick={handleBack}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>{t('menu.back')}</span>
                    </Button>
                </motion.div>
            </div>

            {/* Carousel Section */}
            <div className="flex-1 flex items-center w-full relative">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full flex justify-center items-center h-64"
                        >
                            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                    ) : (
                        <Carousel
                            opts={{
                                align: "center",
                                loop: true,
                            }}
                            className="w-[80%] mx-auto"
                        >
                            <CarouselContent>
                                {frames.map((frame) => (
                                    <CarouselItem key={frame.id} className="basis-1/3 md:basis-1/3 p-3">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "relative aspect-square rounded-sm overflow-hidden cursor-pointer",
                                                selectedFrames.includes(frame.title) && "ring-4 ring-pink-500"
                                            )}
                                            onClick={() => handleFrameSelect(frame)}
                                        >
                                            <img
                                                src={frame.photo_full}
                                                alt={frame.title}
                                                className="w-full h-full object-contain transition-opacity duration-300"
                                            />
                                            <motion.img
                                                initial={{ opacity: 0 }}
                                                whileHover={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                src={frame.photo_hover}
                                                alt={`${frame.title} hover`}
                                                className="absolute inset-0 w-full h-full object-contain"
                                            />
                                        </motion.div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                                <CarouselPrevious className="border-pink-500 bg-pink-500 text-white hover:bg-pink-600" />
                                <CarouselNext className="border-pink-500 bg-pink-500 text-white hover:bg-pink-600" />
                        </Carousel>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}