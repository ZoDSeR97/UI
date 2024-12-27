import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, Heart, ImageIcon, Moon, Sparkles, Sun } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

interface Photo {
    id: number
    url: string
}

interface Filter {
    id: string
    name: string
    icon: React.ReactNode
    effect: FilterEffect[]
}

interface FilterEffect {
    property: string
    value: string
    unit: string
}

const filters: Filter[] = [
    {
        id: "personality",
        name: "Personality",
        icon: <Sparkles className="h-6 w-6" />,
        effect: [
            { property: "brightness", value: "1.2", unit: "" },
            { property: "saturate", value: "1.1", unit: "" },
            { property: "contrast", value: "1.1", unit: "" },
        ]
    },
    {
        id: "natural",
        name: "Natural Look",
        icon: <Sun className="h-6 w-6" />,
        effect: [
            { property: "contrast", value: "1.8", unit: "" },
            { property: "brightness", value: "1.1", unit: "" },
        ]
    },
    {
        id: "pink",
        name: "Perfect Pink",
        icon: <Heart className="h-6 w-6" />,
        effect: [
            { property: "saturate", value: "1.2", unit: "" },
            { property: "contrast", value: "1.1", unit: "" },
            { property: "brightness", value: "1.1", unit: "" },
        ]
    },
    {
        id: "classic",
        name: "Classic",
        icon: <ImageIcon className="h-6 w-6" />,
        effect: [
            { property: "sepia", value: "0.3", unit: "" },
            { property: "saturate", value: "1.2", unit: "" },
            { property: "contrast", value: "0.8", unit: "" },
            { property: "brightness", value: "1.1", unit: "" },
        ]
    },
    {
        id: "bw",
        name: "B&W",
        icon: <Moon className="h-6 w-6" />,
        effect: [
            { property: "grayscale", value: "1", unit: "" },
            { property: "brightness", value: "1.1", unit: "" },
        ]
    }
]

export default function FilterPage() {
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
    const [selectedFilter, setSelectedFilter] = useState<string>("")
    const [intensity, setIntensity] = useState([50])
    const [filterStyle, setFilterStyle] = useState<string>("")

    useEffect(() => {
        // Simulating loading selected photos from session storage
        setSelectedPhotos(sessionStorage.getItem('choosePhotos'))
    }, [])

    useEffect(() => {
        if (selectedFilter) {
            const filter = filters.find(f => f.id === selectedFilter)
            if (filter) {
                const style = filter.effect.map(e => `${e.property}(${adjustValue(e.value, intensity[0])}${e.unit})`).join(" ")
                setFilterStyle(style)
            }
        }
    }, [selectedFilter, intensity])

    const adjustValue = (value: string, intensity: number): string => {
        const numValue = parseFloat(value)
        const adjustedValue = 1 + (numValue - 1) * (intensity / 100)
        return adjustedValue.toFixed(2)
    }

    return (
        <div className="flex h-screen bg-gradient-to-r from-pink-50 to-white">
            <div className="flex-1 p-8">
                <Button variant="ghost" size="icon" className="mb-4">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="mb-8 text-3xl font-bold text-gray-900">Choose Your Filter</h1>
                <Card className="aspect-[4/3] overflow-hidden p-4">
                    <div className="grid h-full grid-cols-2 gap-2">
                        {selectedPhotos.map(photoId => (
                            <motion.div
                                key={photoId}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative overflow-hidden rounded-lg bg-gray-100"
                            >
                                <img
                                    src={`/placeholder.svg?height=300&width=300&text=Photo${photoId + 1}`}
                                    alt={`Selected photo ${photoId + 1}`}
                                    className="h-full w-full object-cover"
                                    style={{ filter: filterStyle }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </div>
            <div className="flex w-96 flex-col justify-between bg-white p-8 shadow-lg">
                <div>
                    <h2 className="mb-4 text-xl font-semibold">Filters</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {filters.map(filter => (
                            <motion.button
                                key={filter.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => selectedFilter === filter.id? setSelectedFilter("") : setSelectedFilter(filter.id)}
                                className={cn(
                                    "flex flex-col items-center rounded-lg border-2 p-4 transition-colors",
                                    selectedFilter === filter.id
                                        ? "border-pink-500 bg-pink-50"
                                        : "border-transparent hover:border-pink-200"
                                )}
                            >
                                {filter.icon}
                                <span className="mt-2 text-sm font-medium">{filter.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="mb-2 text-sm font-medium">Filter Intensity</h3>
                    <Slider
                        value={intensity}
                        onValueChange={setIntensity}
                        max={100}
                        step={1}
                    />
                </div>
                <Button className="mt-8" size="lg">
                    Continue
                </Button>
            </div>
        </div>
    )
}

