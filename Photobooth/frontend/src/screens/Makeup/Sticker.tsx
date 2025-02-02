import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { IconCarousel } from './icon-carousel'
import { RotateCw, Trash2 } from 'lucide-react'
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from '@/components/ui/button';
import { playAudio } from '@/lib/utils';

interface Position {
    x: number;
    y: number;
}

interface IconElement {
    id: string;
    src: string;
    position: Position;
    rotation: number;
    scale: number;
    width: number;
    height: number;
}

export default function Sticker() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [icons, setIcons] = useState<IconElement[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [canvasScale, setCanvasScale] = useState(1);
    const [uuid, setUuid] = useState(sessionStorage.getItem("uuid") || null);
    const [selectedFrame, setSelectedFrame] = useState(JSON.parse(sessionStorage.getItem('selectedFrame')).frame);
    const [printing, setPrinting] = useState<boolean>(false);
    const [photo, setPhoto] = useState(sessionStorage.getItem('photo'));

    useEffect(() => {
        const updateCanvasScale = () => {
            if (canvasRef.current) {
                const scale = canvasRef.current.offsetWidth / canvasRef.current.width;
                setCanvasScale(scale);
            }
        };
        updateCanvasScale();
        window.addEventListener('click', updateCanvasScale);
        return () => window.removeEventListener('click', updateCanvasScale);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const context = canvas.getContext('2d')
        if (!context) return

        setCtx(context)

        // Load background image from sessionStorage
        if (photo) {
            const img = new Image()
            img.src = photo
            img.onload = () => {
                if (selectedFrame === "Stripx2" || selectedFrame === "6-cutx2" || selectedFrame === "4.1-cutx2"){
                    canvas.width = 2478
                    canvas.height = 3690
                } else {
                    canvas.width = 3690
                    canvas.height = 2478
                }
                context.drawImage(img, 0, 0, canvas.width, canvas.height)

                // Calculate scale factor between actual canvas size and displayed size
                const scale = canvas.offsetWidth / img.width
                setCanvasScale(scale)
            }
        } else {
            setPhoto(sessionStorage.getItem('photo'))
            setSelectedFrame(JSON.parse(sessionStorage.getItem('selectedFrame')).frame)
        }
        playAudio('/src/assets/audio/add_emoji.wav')
    }, [photo, selectedFrame])

    useEffect(() => {
        if (!ctx || !canvasRef.current) return

        const canvas = canvasRef.current
        const photo = sessionStorage.getItem('photo')

        // Redraw canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (photo) {
            const img = new Image()
            img.src = photo
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                // Draw all icons
                icons.forEach(icon => {
                    const img = new Image()
                    img.src = icon.src
                    img.onload = () => {
                        ctx.save()
                        ctx.translate(icon.position.x, icon.position.y)
                        ctx.rotate(icon.rotation)
                        ctx.scale(icon.scale, icon.scale)
                        ctx.drawImage(img, -icon.width / 2, -icon.height / 2, icon.width, icon.height)
                        ctx.restore()
                    }
                })
            }
        }
    }, [icons, ctx])

    const handleAddIcon = (iconSrc: string) => {
        const canvas = canvasRef.current
        if (!canvas) return

        playAudio("/src/assets/audio/click.wav")
        
        const newIcon: IconElement = {
            id: Math.random().toString(36).slice(2, 9),
            src: iconSrc,
            position: { x: canvas.width / 2, y: canvas.height / 2 },
            rotation: 0,
            scale: 1,
            width: 400,
            height: 400,
        }
        setIcons([...icons, newIcon])
        setSelectedIcon(newIcon.id)
    }

    const handleIconClick = (id: string) => {
        playAudio("/src/assets/audio/click.wav")
        setSelectedIcon(selectedIcon === id ? null : id)
    }

    const handleIconDrag = (id: string, position: Position) => {
        setIcons(icons.map(icon =>
            icon.id === id ? { ...icon, position } : icon
        ))
    }

    const handleIconRotate = (id: string, rotation: number) => {
        playAudio("/src/assets/audio/click.wav")
        setIcons(icons.map(icon =>
            icon.id === id ? { ...icon, rotation } : icon
        ))
    }

    const handleIconDelete = (id: string) => {
        playAudio("/src/assets/audio/click.wav")
        setIcons(icons.filter(icon => icon.id !== id))
        setSelectedIcon(null)
    }

    const printFrameWithSticker = async (event) => {
        if (selectedIcon || printing){
            setSelectedIcon(null)
            return
        }
        setPrinting(true);
        playAudio("/src/assets/audio/click.wav")
        try {
            if (!canvasRef.current) {
                console.error("Stage reference is not available");
                return;
            }
            const originalDataURL = canvasRef.current.toDataURL();
            const blobBin = atob(originalDataURL.split(',')[1]);
            const array = [];
            for (let i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }
            const newFile = new Blob([new Uint8Array(array)], { type: 'image/png' });

            const printFormData = new FormData();
            printFormData.append("photo", newFile);
            printFormData.append("uuid", uuid);
            printFormData.append("frame", selectedFrame);
            printFormData.append("order_code", sessionStorage.getItem('orderCodeNum'))

            // function for fetch requests
            const postFormData = async (url: string | URL | Request, formData: FormData) => {
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return response.json(); // Parse the JSON response
            };

            // Run both requests in parallel
            const [uploadResponse] = await Promise.all([
                postFormData(`${import.meta.env.VITE_REACT_APP_API}/api/print`, printFormData)
            ]);
            // Handle print response
            if (!uploadResponse.ok) {
                console.error(`Failed to start print job.`);
            }

            // Handle upload response
            const qrVal = uploadResponse.response.photo_url;
            const qrGif = uploadResponse.response.gif_url;
            if (qrVal)
                sessionStorage.setItem('uploadedCloudPhotoUrl', qrVal);
            if (qrGif) 
                sessionStorage.setItem('gifPhoto', qrGif);

            // Navigate after successful operations
            navigate("/print");
        } catch (error) {
            console.error("Error during upload and print:", error);
            setPrinting(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 p-4">
            <div ref={containerRef} className="relative border-2 border-gray-200 rounded-lg">
                <canvas
                    ref={canvasRef}
                    className={selectedFrame === 'Stripx2' || selectedFrame === '6-cutx2' || selectedFrame === '4.1-cutx2'
                        ?`w-[642px] h-[938px]`
                        :`w-[642px] h-[430px]`}
                    width = {2478}
                    height = {3690}
                />
                <div className="absolute inset-0">
                    {icons.map(icon => {
                        const isSelected = selectedIcon === icon.id
                        const scaledWidth = icon.width * icon.scale * canvasScale
                        const scaledHeight = icon.height * icon.scale * canvasScale

                        return (
                            <motion.div
                                key={icon.id}
                                className="absolute"
                                style={{
                                    width: scaledWidth,
                                    height: scaledHeight,
                                    left: icon.position.x * canvasScale,
                                    top: icon.position.y * canvasScale,
                                    transform: `translate(-50%, -50%)`,
                                }}
                                onClick={() => handleIconClick(icon.id)}
                            >
                                <motion.div
                                    className={`absolute inset-0 w-full h-full ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                                    drag
                                    dragConstraints={canvasRef}
                                    dragSnapToOrigin
                                    dragElastic={0.5}
                                    dragMomentum={false}
                                    onDragEnd={(_, info) => {
                                        const canvas = canvasRef.current!
                                        const newX = icon.position.x + info.offset.x/ canvasScale
                                        const newY = icon.position.y + info.offset.y/ canvasScale

                                        // Constrain within canvas boundaries
                                        const halfWidth = (icon.width * icon.scale) / 2
                                        const halfHeight = (icon.height * icon.scale) / 2

                                        const x = Math.min(Math.max(newX, halfWidth), canvas.width - halfWidth)
                                        const y = Math.min(Math.max(newY, halfHeight), canvas.height - halfHeight)

                                        handleIconDrag(icon.id, { x, y })
                                    }}
                                />
                                {isSelected && (
                                    <div
                                        className="absolute left-1/2 -top-8 -translate-x-1/2 flex gap-20 rounded-lg shadow-lg p-1"
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleIconRotate(icon.id, icon.rotation + Math.PI / 4)
                                            }}
                                            className="p-1 bg-pink-500 hover:bg-pink-600 rounded-full"
                                        >
                                            <RotateCw className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleIconDelete(icon.id)
                                            }}
                                            className="p-1 bg-pink-500 hover:bg-pink-600 rounded-full"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>
            <Button
                size="lg"
                disabled={printing}
                onClick={printFrameWithSticker}
                className="absolute left-3/4 top-1/2 mt-4 bg-pink-500 px-8 hover:bg-pink-600 rounded-full text-white"
            >
                {t("text.sticker")}
            </Button>
            <IconCarousel onSelectIcon={handleAddIcon} />
        </div>
    )
}