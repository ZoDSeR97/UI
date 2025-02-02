import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { playAudio } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Apple, Banana, Camera, Gift } from 'lucide-react';

import Confetti from 'react-confetti'

export default function Print() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [confettiActive, setConfettiActive] = useState(true);

    useEffect(() => {
        // Play success sound
        playAudio("/src/assets/audio/thank_being.wav")

        // Disable confetti after 5 seconds
        const timer = setTimeout(() => setConfettiActive(false), 5000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        playAudio("/src/assets/audio/thank_being.wav")
    }, [])

    const clearSessionStorageAndLeaveOut = () => {
        sessionStorage.clear();
        playAudio("/src/assets/audio/click.wav")
        navigate('/landing');
    }

    const QRCodeComponent = () => {
        const myImage = sessionStorage.getItem('uploadedCloudPhotoUrl');
        return (
            <QRCodeSVG
                value={myImage}
                size={250}
            />
        )
    }
    const GifQRCodeComponent = () => {
        const myImage = sessionStorage.getItem('gifPhoto');
        console.log("!@#");
        console.log("!@#");
        console.log("!@#");
        console.log(myImage);
        return (
            <QRCodeSVG
                value={myImage}
                size={250}
            />
        )
    }

    return (
        <div className='fixed inset-0 bg-pink-50 flex flex-col px-1 py-6 mb-48 items-center justify-center' onClick={clearSessionStorageAndLeaveOut}>
            {confettiActive && <Confetti />}
            <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm shadow-xl">
                <motion.div
                    className="p-6 flex flex-col items-center space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.h1
                        className="text-4xl md:text-5xl font-bold text-pink-500 tracking-tight text-center"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                    >
                        {t('text.print')}
                    </motion.h1>

                    <motion.div
                        className="relative w-64 h-64"
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                        transition={{ delay: 0.3, type: "spring" }}
                    >
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{
                                scale: [1, 1.05, 1],
                                rotate: [0, -5, 5, -5, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                        >
                            <Gift className="w-32 h-32 text-pink-500" />
                        </motion.div>

                        <motion.div
                            className="absolute bottom-0 right-0"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Banana className="w-12 h-12 text-yellow-400" />
                        </motion.div>

                        <motion.div
                            className="absolute top-0 right-0"
                            animate={{ rotate: [0, 10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Apple className="w-8 h-8 text-red-500" />
                        </motion.div>

                        <motion.div
                            className="absolute bottom-0 left-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Camera className="w-10 h-10 text-blue-600" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className='flex gap-40'
                    >
                        <QRCodeComponent />
                        <GifQRCodeComponent />
                    </motion.div>
                </motion.div>
            </Card>
        </div>
    );
}