import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from 'lucide-react'
import { cn, playAudio } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Language = 'en' | 'ko' | 'vi' | 'mn'

interface Photo {
    id: number
    url: string
}

export default function Choose() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [language, setLanguage] = useState<Language>((sessionStorage.getItem('language') as Language) || 'en');
    const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
    const [myBackground, setMyBackground] = useState<string | null>(null);
    const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
    const [maxSelections, setMaxSelections] = useState(0);
    const uuid = sessionStorage.getItem("uuid");
    const photos: Photo[] = JSON.parse(sessionStorage.getItem('photos'));

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

    const goToFilter = async () => {
        playAudio("/src/assets/audio/click_sound.wav")
        sessionStorage.setItem('choosePhotos', JSON.stringify(selectedPhotos));

        navigate("/filter");
    }

    return (
        <div className="fixed inset-0 bg-pink-50 flex flex-col min-h-screen items-center px-1 py-1">
            <div className='flex'>
                <div className="flex flex-col items-center gap-8 px-4 py-8">
                    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
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
                                                            style={{transform: "scaleX(-1)"}}
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
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                        style={{transform: "scaleX(-1)"}}
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
                        disabled={selectedPhotos.length !== maxSelections}
                        className="mt-4 bg-pink-500 px-8 hover:bg-pink-600"
                    >
                        Continue with {selectedPhotos.length} photo
                        {selectedPhotos.length > 1 ? "s" : ""}
                    </Button>
                </div>
            </div>
        </div>
    )
}