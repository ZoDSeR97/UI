import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from 'lucide-react'
import { cn, playAudio } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

type Language = 'en' | 'ko' | 'vi' | 'mn'

interface Photo {
    id: number
    url: string
}

export default function Choose() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [language, setLanguage] = useState<Language>((sessionStorage.getItem('language') as Language) || 'en');
    const [selectedFrame, setSelectedFrame] = useState(null);
    const [myBackground, setMyBackground] = useState(null);
    const [selectedLayout, setSelectedLayout] = useState(null);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [maxSelections, setMaxSelections] = useState(0);
    const uuid = sessionStorage.getItem("uuid");
    const photos = JSON.parse(sessionStorage.getItem('photos'));

    useEffect(() => {
        // Retrieve selected frame from session storage
        const storedSelectedFrame = JSON.parse(sessionStorage.getItem('selectedFrame'));
        if (storedSelectedFrame) {
            setSelectedFrame(storedSelectedFrame.frame);
        }

        if (selectedFrame == 'Stripx2') {
            setMaxSelections(8);
        } else if (selectedFrame == '2cut-x2') {
            setMaxSelections(2);
        } else if (selectedFrame == '3-cutx2') {
            setMaxSelections(3);
        } else if (selectedFrame == '4-cutx2') {
            setMaxSelections(4);
        } else if (selectedFrame == '5-cutx2') {
            setMaxSelections(5);
        } else if (selectedFrame == '6-cutx2') {
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
    }, []);

    const handlePhotoClick = (id: number) => {
        playAudio("/src/assets/audio/click_sound.wav")
        if (selectedPhotos.length < maxSelections){
            if (selectedFrame == 'Stripx2') {
                setSelectedPhotos([...selectedPhotos, id, id]);
            } else {
                setSelectedPhotos([...selectedPhotos, id]);
            }
        }
    }

    const goToFilter = async () => {
        playAudio("/src/assets/audio/click_sound.wav")
        sessionStorage.setItem('choosePhotos', JSON.stringify(selectedPhotos));

        if (selectedPhotos.length === maxSelections) {
            const result = await copyImageApi();
            navigate("/filter");
        }
    }

    return (
        <div className="fixed inset-0 bg-pink-50 flex flex-col min-h-screen items-center  px-1 py-6 mb-36">
            <div className='flex'>
                <div className="container flex flex-col items-center gap-8 px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="mb-2 text-4xl font-bold tracking-tight">
                            Choose Your Best Photos
                        </h1>
                        <p className="text-muted-foreground">
                            Select up to {maxSelections} photos to continue
                        </p>
                    </motion.div>

                    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Preview Section */}
                        <Card className="relative overflow-hidden">
                            <CardContent className="p-6">
                                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-pink-100/50">
                                    {selectedPhotos.length > 0 ? (
                                        <Carousel className="w-full">
                                            <CarouselContent>
                                                {selectedPhotos.map((photo) => (
                                                    <CarouselItem key={photo.id}>
                                                        <div className="p-1">
                                                            <div className="overflow-hidden rounded-lg">
                                                                <img
                                                                    src={photo.url}
                                                                    alt="Selected photo"
                                                                    className="aspect-[4/3] h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious />
                                            <CarouselNext />
                                        </Carousel>
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <p className="text-muted-foreground">
                                                Selected photos will appear here
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selection Grid */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {photos.map((photo:Photo) => {
                                        const isSelected = selectedPhotos.some((p) => p.id === photo.id)
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
                                                        "group relative aspect-[4/3] w-full overflow-hidden rounded-lg focus:outline-none",
                                                        isSelected && "ring-4 ring-pink-500"
                                                    )}
                                                >
                                                    <img
                                                        src={photo.url}
                                                        alt={`Photo ${photo.id}`}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
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
                    </div>

                    <Button
                        size="lg"
                        onClick={goToFilter}
                        disabled={selectedPhotos.length === 0}
                        className="mt-4 bg-pink-500 px-8 hover:bg-pink-600"
                    >
                        Continue with {selectedPhotos.length} photo
                        {selectedPhotos.length !== 1 ? "s" : ""}
                    </Button>
                </div>
            </div>
        </div>
    )
}