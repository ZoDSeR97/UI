import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, ImageIcon, Moon, Sparkles, Sun } from 'lucide-react';
import { cn, playAudio } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toBlob } from 'html-to-image';

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
            { property: 'blur', value: "1", unit: "px" },
            { property: "saturate", value: "1.2", unit: "" },
            { property: "contrast", value: "1.1", unit: "" },
            { property: "brightness", value: "1.1", unit: "" },
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const nodeRef = useRef(null);
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<string>("");
    const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
    const [myBackground, setMyBackground] = useState<string | null>(null);
    const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
    const [intensity, setIntensity] = useState([50])
    const [filterStyle, setFilterStyle] = useState<string>("")
    const photos: Photo[] = JSON.parse(sessionStorage.getItem('photos'));

    useEffect(() => {
        // Simulating loading selected photos from session storage
        setSelectedPhotos(JSON.parse(sessionStorage.getItem('choosePhotos')));
        setSelectedFrame(JSON.parse(sessionStorage.getItem('selectedFrame')).frame);
        const parsedSelectedLayout = JSON.parse(sessionStorage.getItem('selectedLayout'));
        console.log("photo choose urls>>>", parsedSelectedLayout);
        setMyBackground(parsedSelectedLayout.photo);
        setSelectedLayout(parsedSelectedLayout.photo_cover);
    }, [])

    useEffect(() => {
        if (selectedFilter) {
            const filter = filters.find(f => f.id === selectedFilter)
            if (filter) {
                const style = filter.effect.map(e => `${e.property}(${adjustValue(e.value, intensity[0])}${e.unit})`).join(" ")
                setFilterStyle(style)
            }
        } else {
            setFilterStyle("")
        }
    }, [selectedFilter, intensity])

    const adjustValue = (value: string, intensity: number): string => {
        const numValue = parseFloat(value)
        const adjustedValue = 1 + (numValue - 1) * (intensity / 100)
        return adjustedValue.toFixed(2)
    }

    const goToSticker = async() => {
        if (!nodeRef.current) return;
        playAudio("/src/assets/audio/click.wav")
        try {
            // Convert the DOM node to a Blob
            const blob = await toBlob(nodeRef.current);
      
            // Create a FormData object to upload
            const formData = new FormData();
            formData.append('photo', blob);

            sessionStorage.setItem('photo', blob);
      
            // Send the Blob to the Flask server
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/uploads`, {
              method: 'POST',
              body: formData,
            });
      
            if (!response.ok) {
              throw new Error(`Upload failed: ${response.statusText}`);
            }
      
            const data = await response.json();
          } catch (error) {
            console.error('Error capturing or uploading image:', error);
          }
    }

    return (
        <div className="fixed inset-0 bg-pink-50 flex flex-col min-h-screen items-center px-1 py-1">
            <div className='flex w-full'>
                <div className="flex flex-col items-center w-full gap-8 px-4 py-8">
                    <div className="grid w-[1316px] h-[940px] grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Preview Section */}
                        <Card className="relative overflow-hidden">
                            <CardContent className="p-6">
                                <div className="overflow-hidden rounded-lg bg-pink-50">
                                    <div className="flex h-full items-center justify-center">
                                        <p className="text-muted-foreground text-pink-500">
                                            Selected photos will appear here
                                        </p>
                                    </div>
                                    <div
                                        ref={nodeRef}
                                        className='absolute inset-0'
                                        style={{
                                            backgroundImage: `url(${myBackground})`,
                                            backgroundSize: `644px`,
                                            backgroundRepeat: `false`
                                        }}
                                    >
                                        {selectedPhotos.length > 0 &&
                                            <div
                                                className={`grid ${selectedFrame === "Stripx2"
                                                    ? "grid-cols-2 grid-rows-4 mt-[65px] gap-[1.23rem]"
                                                    : selectedFrame === "6-cutx2"
                                                        ? "grid-cols-3 grid-rows-2 gap-5"
                                                        : selectedFrame === "4-cutx2" || selectedFrame === "4.1-cutx2"
                                                            ? "grid-cols-2 grid-rows-2 gap-5"
                                                            : selectedFrame === "2cut-x2"
                                                                ? "grid-cols-2 grid-rows-1 gap-5"
                                                                : "grid-cols-1"
                                                    }`}
                                            >
                                                {selectedPhotos.map((i, index) => (
                                                    <div
                                                        key={index}
                                                        className={`relative aspect-auto ${selectedFrame === "Stripx2"
                                                            ? `max-h-[182px] max-w-[312px] ${index % 2 === 0 ? "left-2" : "right-4"}`
                                                            : selectedFrame === "6-cutx2"
                                                                ? `max-h-[182px] max-w-[312px] ${index % 2 === 0 ? "left-3" : "right-3"}`
                                                                : selectedFrame === "4-cutx2" || selectedFrame === "4.1-cutx2"
                                                                    ? `max-h-[182px] max-w-[312px] ${index % 2 === 0 ? "left-3" : "right-3"}`
                                                                    : selectedFrame === "2cut-x2"
                                                                        ? `max-h-[182px] max-w-[312px] ${index % 2 === 0 ? "left-3" : "right-3"}`
                                                                        : `max-h-[182px] max-w-[312px] ${index % 2 === 0 ? "left-2" : "right-4"}`
                                                            } overflow-hidden rounded-lg`}
                                                    >
                                                        <img
                                                            src={photos[i].url}
                                                            alt="Selected photo"
                                                            className="h-full w-full object-cover"
                                                            style={{filter:filterStyle, transform: "scaleX(-1)"}}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        }
                                        && <div
                                            className='absolute inset-0'
                                            style={{
                                                backgroundImage: `url(${selectedLayout})`,
                                                backgroundSize: `${selectedFrame === "Stripx2"
                                                    ? "638px"
                                                    : selectedFrame === "6-cutx2"
                                                        ? "638px"
                                                        : selectedFrame === "4-cutx2" || selectedFrame === "4.1-cutx2"
                                                            ? "638px"
                                                            : selectedFrame === "2cut-x2"
                                                                ? "638px"
                                                                : "638px"
                                                    }`,
                                                backgroundRepeat: `false`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selection Grid */}
                        <div className="flex w-96 flex-col justify-between bg-white p-8 shadow-lg text-pink-500 rounded">
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Filters</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {filters.map(filter => (
                                        <motion.button
                                            key={filter.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                playAudio("/src/assets/audio/click.wav");
                                                selectedFilter === filter.id ? setSelectedFilter("") : setSelectedFilter(filter.id);
                                                setIntensity([50])
                                            }}
                                            className={cn(
                                                "flex flex-col items-center rounded-full border-2 p-4 transition-colors",
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
                            <Button 
                                className="mt-8" 
                                size="lg"
                                onClick={goToSticker}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

