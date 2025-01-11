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

interface LayoutData {
    title: string
    photo: string
    photo_cover: string
    photo_full: string
}

export default function Layout() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [layouts, setLayouts] = useState<LayoutData[]>([])
    const [selectedLayout, setSelectedLayout] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        playAudio('/src/assets/audio/choose_frame_style.wav')
        fetchLayouts()
    }, [])

    const fetchLayouts = async (): Promise<void> => {
        try {
            setIsLoading(true)
            setError(null)
            const frame = JSON.parse(sessionStorage.getItem('selectedFrame') || '{}').frame
            const bgStyle = sessionStorage.getItem('styleBg')
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/layouts/api/by-background/${bgStyle}/frame/${frame}`)
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const data = await response.json()
            const processedLayouts: LayoutData[] = data.map((layout: LayoutData) => ({
                ...layout,
                photo: `${import.meta.env.VITE_REACT_APP_BACKEND}${layout.photo}`,
                photo_cover: `${import.meta.env.VITE_REACT_APP_BACKEND}${layout.photo_cover}`,
                photo_full: `${import.meta.env.VITE_REACT_APP_BACKEND}${layout.photo_full}`
            }))
            setLayouts(processedLayouts)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
            setError(errorMessage)
            console.error('Error fetching layouts:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLayoutSelect = async (layout: LayoutData): Promise<void> => {
        try {
            await playAudio('/src/assets/audio/click.wav')
            setSelectedLayout(layout.title)
            sessionStorage.setItem('selectedLayout', JSON.stringify(layout))
            navigate('/payment-number')
        } catch (error) {
            console.error('Error handling layout selection:', error)
        }
    }

    const handleBack = async (): Promise<void> => {
        try {
            await playAudio('/src/assets/audio/click.wav')
            navigate('/background')
        } catch (error) {
            console.error('Error handling back:', error)
        }
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-500 text-center">
                    <p>{t('Technical issue in loading layouts')}: {error}</p>
                    <Button onClick={fetchLayouts} className="mt-4">{t('Retry')}</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-cover bg-center flex flex-col px-1 py-6 mb-48">
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
                            className="w-10/12 mx-auto"
                        >
                            <CarouselContent>
                                {layouts.map((layout, index) => (
                                    <CarouselItem key={index} className="basis-1/3 md:basis-1/3 p-3">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "relative aspect-square rounded-lg overflow-hidden cursor-pointer",
                                                selectedLayout === layout.title && "ring-4 ring-pink-500"
                                            )}
                                            onClick={() => handleLayoutSelect(layout)}
                                        >
                                            <img
                                                src={layout.photo_full}
                                                alt={layout.title}
                                                className="w-full h-full object-contain transition-opacity duration-300"
                                            />
                                            <motion.img
                                                initial={{ opacity: 0 }}
                                                whileHover={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                src={layout.photo_cover}
                                                alt={`${layout.title} hover`}
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