import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from 'lucide-react';
import { playAudio } from "@/lib/utils";

function Home() {
    const [language, setLanguage] = useState('en');
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        sessionStorage.clear();
        setLanguage('en');
        sessionStorage.setItem('language', 'en');
        i18n.changeLanguage('en');
    }, [i18n]);

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
            <Button variant="outline" className="bg-pink-100 text-pink-500 border-pink-200 rounded-full hover:bg-pink-300 hover:text-pink-600 text-lg">
              <Globe className="mr-2 h-4 w-4" />
              {t(`language.${language}`)}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-pink-100 text-pink-500 border-pink-200 hover:bg-pink-300 hover:text-pink-600 rounded ">
            <DropdownMenuItem onClick={() => handleChangeLanguage('en')} className='text-lg hover:bg-pink-300'>
              <Globe className="mr-2 h-4 w-4" />
              {t('language.en')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeLanguage('ko')} className='text-lg hover:bg-pink-300'>
              <Globe className="mr-2 h-4 w-4" />
              {t('language.ko')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeLanguage('vi')} className='text-lg hover:bg-pink-300'>
              <Globe className="mr-2 h-4 w-4" />
              {t('language.vi')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeLanguage('mn')} className='text-lg hover:bg-pink-300'>
              <Globe className="mr-2 h-4 w-4" />
              {t('language.mn')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <motion.div
        className="flex-grow flex"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-full h-full flex items-center justify-center top-40">
          <motion.div animate={{ y: [0, -10, 0], }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", }}>
            <img 
              src="/src/assets/icon/logo.svg" 
              alt="Logo" 
              className="w-full h-[50vh]" 
              width={10}
              height={10}
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className='absolute bottom-32'
      >
        <Button
          className="bg-pink-400 hover:bg-pink-600 text-white font-bold py-14 px-20 rounded-full text-[4.25rem]"
          onClick={handleStart}
        >
          {t(`menu.start`)}
        </Button>
      </motion.div>
    </div>
    );
}

export default Home;