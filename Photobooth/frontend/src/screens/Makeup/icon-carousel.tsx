import { useEffect, useState } from 'react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'

interface IconCarouselProps {
    onSelectIcon: (iconSrc: string) => void
}

interface Theme {
    name: string;
    icons: string[];
}

export function IconCarousel({ onSelectIcon }: IconCarouselProps) {
    const [themes, setThemes] = useState<Theme[]>([])

    useEffect(() => {
        setThemes([
            {
                name: 'cartoon',
                icons: Array.from({ length: 20 }, (_, i) => `/src/assets/icon/Sticker/cartoon/cartoon-${String(i + 1).padStart(2, '0')}.png`),
            },
            {
                name: 'lovely',
                icons: Array.from({ length: 20 }, (_, i) => `/src/assets/icon/Sticker/lovely/lovely-${String(i + 1).padStart(2, '0')}.png`),
            },
            {
                name: 'mood',
                icons: Array.from({ length: 20 }, (_, i) => `/src/assets/icon/Sticker/mood/mood-${String(i + 1).padStart(2, '0')}.png`),
            },
            {
                name: 'y2k',
                icons: Array.from({ length: 20 }, (_, i) => `/src/assets/icon/Sticker/y2k/y2k-${String(i + 1).padStart(2, '0')}.png`),
            },
        ])
    }, [])

    return (
        <Carousel
            className="w-full max-w-lg"
            opts={{
                align: "start",
                loop: true,
            }}
        >
            <CarouselContent>
                {themes.flatMap(theme =>
                    theme.icons.map((icon, index) => (
                        <CarouselItem key={`${theme.name}-${index}`} className="basis-1/6">
                            <button
                                onClick={() => onSelectIcon(icon)}
                                className="w-full aspect-square border rounded-lg p-2 hover:bg-gray-100 transition-colors"
                            >
                                <img src={icon} alt={`${theme.name} icon ${index + 1}`} className="w-full h-full object-contain" />
                            </button>
                        </CarouselItem>
                    ))
                )}
            </CarouselContent>
            <CarouselPrevious className="border-pink-500 bg-pink-500 text-white hover:bg-pink-600" />
            <CarouselNext className="border-pink-500 bg-pink-500 text-white hover:bg-pink-600" />
        </Carousel>
    )
}