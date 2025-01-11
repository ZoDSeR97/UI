import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ImageIcon, Moon, Sparkles, Sun } from 'lucide-react'
import { cn, playAudio } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
            { property: 'blur', value: "0.8", unit: "px" },
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

export default function Choose() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const nodeRef = useRef(null);
    const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
    const [myBackground, setMyBackground] = useState<string | null>(null);
    const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
    const [maxSelections, setMaxSelections] = useState(0);
    const [intensity, setIntensity] = useState([50])
    const [filterStyle, setFilterStyle] = useState<string>("")
    const [selectedFilter, setSelectedFilter] = useState<string>("");
    const uuid = sessionStorage.getItem("uuid");
    const [photo, setPhoto] = useState<Blob | null>(null);
    const photos: Photo[] = JSON.parse(sessionStorage.getItem('photos'));
    const [transition, setTransition] = useState(false);

    useEffect(() => {
        // Retrieve selected frame from session storage
        const storedSelectedFrame = JSON.parse(sessionStorage.getItem('selectedFrame'));
        if (storedSelectedFrame) {
            setSelectedFrame(storedSelectedFrame.frame);
        }

        if (selectedFrame === 'Stripx2') {
            setMaxSelections(8);
        } else if (selectedFrame === '2cut-x2') {
            setMaxSelections(2);
        } else if (selectedFrame === '3-cutx2') {
            setMaxSelections(3);
        } else if (selectedFrame === '4-cutx2' || selectedFrame === '4.1-cutx2') {
            setMaxSelections(4);
        } else if (selectedFrame === '5-cutx2') {
            setMaxSelections(5);
        } else if (selectedFrame === '6-cutx2') {
            setMaxSelections(6);
        }

        const sessionSelectedLayout = sessionStorage.getItem('selectedLayout');

        if (sessionSelectedLayout) {
            const parsedSelectedLayout = JSON.parse(sessionSelectedLayout);
            console.log("photo choose urls>>>", parsedSelectedLayout)
            setMyBackground(parsedSelectedLayout.photo);
            setSelectedLayout(parsedSelectedLayout.photo_cover);
        }
        playAudio("/src/assets/audio/choose_photos.wav")
    }, [selectedFrame]);

    useEffect(() => {
        if (selectedPhotos.length === maxSelections && nodeRef.current) {
            // Convert the DOM node to a Blob
            const blob = toBlob(nodeRef.current);
            setPhoto(blob);
        }
    }, [maxSelections, selectedPhotos.length])

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

    const handlePhotoClick = (id: number) => {
        playAudio("/src/assets/audio/click.wav")
        console.log("pressed")
        console.log(selectedPhotos)
        if (selectedPhotos.indexOf(id) === -1 && selectedPhotos.length < maxSelections) {
            if (selectedFrame === 'Stripx2') {
                setSelectedPhotos([...selectedPhotos, id, id]);
            } else {
                setSelectedPhotos([...selectedPhotos, id]);
            }
        } else {
            setSelectedPhotos(selectedPhotos.filter(index => index !== id));
        }
    }

    const goToSticker = async () => {
        playAudio("/src/assets/audio/click.wav")
        sessionStorage.setItem('choosePhotos', JSON.stringify(selectedPhotos));
        if (!nodeRef.current || transition) return;
        setTransition(true);
        try {
            // Convert the DOM node to a Blob
            await toBlob(nodeRef.current).then(blob => {
                // Convert the Blob to a Base64 string for session storage
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result;
                    sessionStorage.setItem('photo', base64data);
                    navigate("/sticker");
                };
            });
            
            // Create a FormData object to upload
            //const formData = new FormData();
            //formData.append('photo', blob);

            // Send the Blob to the Flask server (fire-and-forget)
            /* fetch(`${import.meta.env.VITE_REACT_APP_API}/api/uploads`, {
                method: 'POST',
                body: formData,
            }).catch(error => {
                console.error('Error uploading image:', error);
            });
        
            console.log('Request sent without waiting for response'); */
        } catch (error) {
            setTransition(false);
            console.error('Error capturing image:', error);
        }
    }

    return (
        <div className="inset-0 bg-pink-50 flex flex-col min-h-screen items-center px-1 py-1">
            <div className='flex'>
                <div className="flex flex-col items-center gap-8 px-4 py-8">
                    <div className="flex w-full justify-between items-start gap-10">
                        {/* Photos Selection Grid */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {photos.map((photo: Photo) => {
                                        const isSelected = selectedPhotos.some((index) => index === photo.id)
                                        return (
                                            <motion.div
                                                key={photo.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="relative overflow-hidden rounded-lg"
                                            >
                                                <button
                                                    onClick={() => handlePhotoClick(photo.id)}
                                                    className={cn(
                                                        "group relative aspect-auto w-full overflow-hidden rounded-lg focus:outline-none max-w-[290px]",
                                                        isSelected && "ring-4 ring-pink-500"
                                                    )}
                                                >
                                                    <img
                                                        src={photo.url}
                                                        alt={`Photo ${photo.id}`}
                                                        className="h-full w-full object-cover transform-gpu -scale-x-100 transition-transform group-hover:scale-105"
                                                    />
                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="absolute right-2 top-2 rounded-full bg-pink-500 p-1"
                                                        >
                                                            <Heart className="h-4 w-4 text-white" fill="white" />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preview Section */}
                        <Card className={`relative overflow-hidden w-[644px] ${selectedFrame === "2cut-x2" || selectedFrame === "4-cutx2"? "h-[432px]":"h-[940px]"}`}>
                            <CardContent className="p-6">
                                <div className="overflow-hidden rounded-lg bg-pink-50">
                                    <div
                                        className='absolute inset-0'
                                        ref={nodeRef}
                                        style={{
                                            backgroundImage: `url(${myBackground})`,
                                            backgroundRepeat: `no-repeat`
                                        }}
                                    >
                                        {selectedPhotos.length > 0 &&
                                            <div
                                                className={`grid ${selectedFrame === "Stripx2"
                                                    ? "grid-rows-4 grid-cols-2 mt-[65px] gap-[1.23rem]"
                                                    : selectedFrame === "6-cutx2"
                                                        ? "grid-rows-3 grid-cols-2 gap-6 mt-[42px]"
                                                        : selectedFrame === "4-cutx2"
                                                            ? "grid-rows-2 grid-cols-2 gap-3 mt-[36px]"
                                                            : selectedFrame === "4.1-cutx2"
                                                                ? "grid-rows-2 grid-cols-2 gap-7 mt-[121px]" 
                                                                : selectedFrame === "2cut-x2"
                                                                    ? "grid-rows-1 grid-cols-2  gap-5 mt-[42px]"
                                                                    : "grid-cols-1"
                                                    }`}
                                            >
                                                {selectedPhotos.map((i, index) => (
                                                    <div
                                                        key={index}
                                                        className={`relative aspect-auto ${selectedFrame === "Stripx2"
                                                            ? `max-w-[312px] max-h-[182px]  ${index % 2 === 0 ? "left-2" : "right-4"}`
                                                            : selectedFrame === "6-cutx2"
                                                                ? `w-[260px] h-[252px] ${index % 2 === 0 ? "left-11" : "right-1"}`
                                                                : selectedFrame === "4-cutx2"
                                                                    ? `w-[226px] h-[174px] ${index % 2 === 0 ? "left-20" : "left-1"}`
                                                                    : selectedFrame === "4.1-cutx2"
                                                                        ? `w-[262px] h-[347px] ${index % 2 === 0 ? "left-10" : "left-0"}`
                                                                        : selectedFrame === "2cut-x2"
                                                                            ? `w-[311px] h-[318px] ${index % 2 === 0 ? "left-3" : "right-5"}`
                                                                            : `max-w-[312px] max-h-[182px] ${index % 2 === 0 ? "left-2" : "right-4"}`
                                                            } overflow-hidden rounded-lg`}
                                                    >
                                                        <img
                                                            src={photos[i].url}
                                                            alt="Selected photo"
                                                            className="h-full w-full object-cover transform-gpu -scale-x-100"
                                                            style={{ filter: filterStyle }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        }
                                        <div
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
                                                backgroundRepeat: `no-repeat`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Filter Selection Grid */}
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
                                                    ? "border-pink-500 bg-pink-500"
                                                    : "border-transparent hover:border-pink-200"
                                            )}
                                        >
                                            {filter.icon}
                                            <span className="mt-2 text-sm font-medium">{t(`filter.${filter.id}`)}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            <div className='py-10'>
                                <h3 className="mb-2 text-sm font-medium">{t('filter.intensity')}</h3>
                                <Slider
                                    value={intensity}
                                    onValueChange={setIntensity}
                                    max={100}
                                    step={1}
                                />
                            </div>
                            <Button
                                size="lg"
                                onClick={goToSticker}
                                disabled={selectedPhotos.length !== maxSelections || transition}
                                className="mt-4 bg-pink-500 px-8 hover:bg-pink-600 rounded-full text-white"
                            >
                                {t('menu.continue')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}