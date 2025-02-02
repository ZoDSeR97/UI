import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, frame } from "framer-motion";
import { Heart, ImageIcon, Moon, Sparkles, Sun, Star } from 'lucide-react'
import { cn, playAudio } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Photo {
    id: number
    url: string
}

interface Gif {
    id: number
    name: string
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
            { property: 'blur', value: "0.1", unit: "px" },
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
    },
    {
        id: "skin",
        name: "Skin Smooth & Glow",
        icon: <Star className="h-6 w-6" />,
        effect: [
            { property: "blur", value: "0.1", unit: "px" },
            { property: "brightness", value: "1.2", unit: "" },
            { property: "saturate", value: "1.1", unit: "" },
            { property: "contrast", value: "1.1", unit: "" },
            { property: "hue-rotate", value: "10", unit: "deg" },
        ]
    }
]

export default function Choose() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [selectedFrame, setSelectedFrame] = useState<string | null>(JSON.parse(sessionStorage.getItem('selectedFrame')).frame);
    const [myBackground, setMyBackground] = useState<string | null>(null);
    const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
    const [maxSelections, setMaxSelections] = useState(0);
    const [intensity, setIntensity] = useState([50])
    const [filterStyle, setFilterStyle] = useState<string>("")
    const [selectedFilter, setSelectedFilter] = useState<string>("");
    const photos: Photo[] = JSON.parse(sessionStorage.getItem('photos'));
    const gifs: Gif[] = JSON.parse(sessionStorage.getItem('gifs'));
    const [transition, setTransition] = useState(false);

    useEffect(() => {
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

    const getGridConfig = useCallback(() => {
        // Define grid configurations for each frame type
        if (selectedFrame === "Stripx2") {
            return [
                { x: 1330, y: 240, width: 1030, height: 730 },
                { x: 130, y: 240, width: 1030, height: 730 },
                { x: 1330, y: 1020, width: 1030, height: 730 },
                { x: 130, y: 1020, width: 1030, height: 730 },
                { x: 1330, y: 1810, width: 1030, height: 730 },
                { x: 130, y: 1810, width: 1030, height: 730 },
                { x: 1330, y: 2590, width: 1030, height: 730 },
                { x: 130, y: 2590, width: 1030, height: 730 },
            ];
        }
        else if (selectedFrame === "6-cutx2") {
            return [
                { x: 1290, y: 150, width: 1020, height: 1000 },
                { x: 190, y: 150, width: 1020, height: 1000 },
                { x: 1290, y: 1230, width: 1020, height: 1000 },
                { x: 190, y: 1230, width: 1020, height: 1000 },
                { x: 1290, y: 2300, width: 1020, height: 1000 },
                { x: 190, y: 2300, width: 1020, height: 1000 },
            ];
        }
        else if (selectedFrame === "4-cutx2") {
            return [
                { x: 1910, y: 210, width: 1290, height: 980 },
                { x: 490, y: 210, width: 1290, height: 980 },
                { x: 1910, y: 1290, width: 1290, height: 980 },
                { x: 490, y: 1290, width: 1290, height: 980 },
            ];
        }
        else if (selectedFrame === "4.1-cutx2") {
            return [
                { x: 1310, y: 470, width: 1040, height: 1350 },
                { x: 160, y: 470, width: 1040, height: 1350 },
                { x: 1310, y: 1920, width: 1040, height: 1350 },
                { x: 160, y: 1920, width: 1040, height: 1350 },
            ];
        }
        else {
            return [
                { x: 1800, y: 230, width: 1770, height: 1870 },
                { x: 60, y: 230, width: 1770, height: 1870 },
            ];
        }
    }, [selectedFrame]);

    const drawPhotos = useCallback((ctx: CanvasRenderingContext2D) => {
        const gridConfig = getGridConfig();
        selectedPhotos.forEach((photoId, index) => {
            const photo = photos.find(p => p.id === photoId);
            if (photo) {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = () => {
                    const { x, y, width, height } = gridConfig[index];
                    ctx.save();
                    ctx.filter = filterStyle;
                    ctx.transform(-1, 0, 0, 1, canvasRef.current.width, 0)
                    ctx.drawImage(img, x, y, width, height);
                    ctx.restore();
                };
                img.src = photo.url;
            }
        });
        const layoutImg = new Image();
        layoutImg.crossOrigin = "Anonymous";
        layoutImg.onload = () => {
            ctx.drawImage(layoutImg, 0, 0, ctx.canvas.width, ctx.canvas.height);
        };
        layoutImg.src = selectedLayout;
    }, [filterStyle, getGridConfig, photos, selectedLayout, selectedPhotos]);

    const renderCanvas = useCallback((ctx: CanvasRenderingContext2D) => {
        const isHorizontal = selectedFrame === "2cut-x2" || selectedFrame === "4-cutx2";
        const canvasWidth = isHorizontal ? 3690 : 2478;
        const canvasHeight = isHorizontal ? 2478 : 3690;

        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = canvasHeight;

        // Clear the canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw background
        if (myBackground) {
            const bgImg = new Image();
            bgImg.crossOrigin = "Anonymous";
            bgImg.onload = () => {
                ctx.save();
                ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
                drawPhotos(ctx);
                ctx.restore();
            };
            bgImg.src = myBackground;
        } else {
            drawPhotos(ctx);
        }
    }, [drawPhotos, myBackground, selectedFrame]);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                renderCanvas(ctx);
            }
        }
    }, [selectedPhotos, selectedFrame, filterStyle, renderCanvas, selectedLayout]);

    const adjustValue = (value: string, intensity: number): string => {
        const numValue = parseFloat(value)
        const adjustedValue = 1 + (numValue - 1) * (intensity / 100)
        return adjustedValue.toFixed(2)
    }

    const handlePhotoClick = (id: number) => {
        playAudio("/src/assets/audio/click.wav")
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
        if (!canvasRef.current || transition) return;
        setTransition(true);
        renderCanvas(canvasRef.current.getContext('2d'));
        try {
            await Promise.all([
                // Get image data
                Promise.resolve(canvasRef.current.toDataURL("image/jpeg")).then(img =>
                    sessionStorage.setItem('photo', img)
                ),

                // API call
                fetch(`${import.meta.env.VITE_REACT_APP_API}/api/create-gif`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "frame": selectedFrame,
                        "gifs": selectedPhotos.map(photoId => gifs.filter(gif => gif.id === photoId)[0].name)
                    })
                })
            ]);
            navigate("/sticker");
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
                                                        loading='lazy'
                                                        src={photo.url}
                                                        alt={`Photo ${photo.id}`}
                                                        className="h-full w-full object-cover transform-gpu -scale-x-100 transition-transform"
                                                    />
                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="absolute right-2 top-2 rounded-full bg-pink-500 p-1 transform-gpu -scale-x-100"
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
                        <Card className={`relative overflow-hidden w-[642px] ${selectedFrame === "2cut-x2" || selectedFrame === "4-cutx2" ? "h-[430px]" : "h-[938px]"}`}>
                            <CardContent className="p-6">
                                <div className="overflow-hidden rounded-lg bg-pink-50">
                                    <canvas
                                        ref={canvasRef}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                        }}
                                        width={2478}
                                        height={3690}
                                    />
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