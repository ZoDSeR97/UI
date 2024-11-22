import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import i18n from '/src/translations/i18n';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe, ChevronDown } from 'lucide-react';
import { playAudio } from "@/lib/utils"

function Home() {
    const [language, setLanguage] = useState('en');
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        sessionStorage.clear();
        setLanguage('en');
        sessionStorage.setItem('language', 'en');
        i18n.changeLanguage('en');
    }, []);

    const handleChangeLanguage = (value: string) => {
        setLanguage(value);
        sessionStorage.setItem('language', value);
        i18n.changeLanguage(value);
    };

    const handleStart = async () => {
        await playAudio('/src/assets/audio/click.wav')
        navigate('/frame');
    };

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-white p-6">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full flex justify-end"
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-pink-100 text-pink-500 border-pink-200">
                            <Globe className="mr-2 h-4 w-4" />
                            {t(`language.${language}`)}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleChangeLanguage('en')}>
                            {t('language.en')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeLanguage('ko')}>
                            {t('language.ko')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeLanguage('vi')}>
                            {t('language.vi')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeLanguage('mn')}>
                            {t('language.mn')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </motion.div>

            <motion.div
                className="flex-grow flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-pink-500 font-bold relative text-center">
                    <motion.div
                        className="text-3xl mb-2"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    >
                        PHOTO
                    </motion.div>
                    <div className="text-7xl">
                        M
                        <span className="inline-block relative">
                            <svg viewBox="0 0 100 100" className="w-24 h-24 fill-current inline-block">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" />
                                <rect x="30" y="30" width="40" height="40" rx="5" />
                                <circle cx="50" cy="50" r="15" />
                                <motion.circle cx="75" cy="25" r="8" fill="white" 
                                    animate={{
                                        cx: [75, 25, 25, 75, 75],
                                        cy: [25, 25, 75, 75, 25],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                />
                            </svg>
                        </span>
                        NG
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                <Button
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-10 px-20 rounded-full text-xl mb-20"
                    onClick={handleStart}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {t('start')}
                </Button>
            </motion.div>
        </div>
    );
}

export default Home;