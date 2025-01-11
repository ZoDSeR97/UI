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

interface BackgroundData {
    title: string
    photo: string
    photo_hover: string
}

export default function Background() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [backgrounds, setBackgrounds] = useState<BackgroundData[]>([])
    const [selectedBackground, setSelectedBackground] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        playAudio('/src/assets/audio/choose_frame_style.wav')
        fetchBackgrounds()
    }, [])

    const fetchBackgrounds = async (): Promise<void> => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/backgrounds/api`)
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const data = await response.json()
            const processedBackgrounds: BackgroundData[] = data.map((bg: BackgroundData) => ({
                ...bg,
                photo: `${import.meta.env.VITE_REACT_APP_BACKEND}${bg.photo}`,
                photo_hover: `${import.meta.env.VITE_REACT_APP_BACKEND}${bg.photo_hover}`
            }))
            setBackgrounds(processedBackgrounds)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
            setError(errorMessage)
            console.error('Error fetching backgrounds:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackgroundSelect = async (background: BackgroundData): Promise<void> => {
        try {
            await playAudio('/src/assets/audio/click.wav')
            setSelectedBackground(background.title)
            sessionStorage.setItem('styleBg', background.title)
            navigate('/layout')
        } catch (error) {
            console.error('Error handling background selection:', error)
        }
    }

    const handleBack = async (): Promise<void> => {
        try {
            await playAudio('/src/assets/audio/click.wav')
            navigate('/frame')
        } catch (error) {
            console.error('Error handling back:', error)
        }
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-500 text-center">
                    <p>{t('text.background')}: {error}</p>
                    <Button onClick={fetchBackgrounds} className="mt-4">{t('menu.retry')}</Button>
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
                                {backgrounds.map((bg, index) => (
                                    <CarouselItem key={index} className="basis-1/3 md:basis-1/3 p-3">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "relative aspect-square rounded-lg overflow-hidden cursor-pointer",
                                                selectedBackground === bg.title && "ring-4 ring-pink-500"
                                            )}
                                            onClick={() => handleBackgroundSelect(bg)}
                                        >
                                            <img
                                                src={bg.photo}
                                                alt={bg.title}
                                                className="w-full h-full object-contain transition-opacity duration-300"
                                            />
                                            <motion.img
                                                initial={{ opacity: 0 }}
                                                whileHover={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                src={bg.photo_hover}
                                                alt={`${bg.title} hover`}
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