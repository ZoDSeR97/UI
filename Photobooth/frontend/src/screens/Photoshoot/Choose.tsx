import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { cn, playAudio } from "@/lib/utils";

export default function Choose() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [language, setLanguage] = useState<Language>((sessionStorage.getItem('language') as Language) || 'en');
    const [selectedFrame, setSelectedFrame] = useState(null);
    const [myBackground, setMyBackground] = useState(null);
    const [selectedLayout, setSelectedLayout] = useState(null);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const uuid = sessionStorage.getItem("uuid");
    const photos = JSON.parse(sessionStorage.getItem('photos'));

    useEffect(() => {
        // Retrieve selected frame from session storage
        const storedSelectedFrame = JSON.parse(sessionStorage.getItem('selectedFrame'));
        if (storedSelectedFrame) {
            setSelectedFrame(storedSelectedFrame.frame);
        }

        const sessionSelectedLayout = sessionStorage.getItem('selectedLayout');

        if (sessionSelectedLayout) {
            const parsedSelectedLayout = JSON.parse(sessionSelectedLayout);
            console.log("photo choose urls>>>", parsedSelectedLayout)
            setMyBackground(parsedSelectedLayout.photo);
            setSelectedLayout(parsedSelectedLayout.photo_cover);
        }
    }, []);

    const toggleSelection = (index: number) => {
        // Determine total photos
        let totalMeetsPhotos = 0;
        if (selectedFrame == 'Stripx2') {
            totalMeetsPhotos = 8;
        } else if (selectedFrame == '2cut-x2') {
            totalMeetsPhotos = 2;
        } else if (selectedFrame == '3-cutx2') {
            totalMeetsPhotos = 3;
        } else if (selectedFrame == '4-cutx2') {
            totalMeetsPhotos = 4;
        } else if (selectedFrame == '5-cutx2') {
            totalMeetsPhotos = 5;
        } else if (selectedFrame == '6-cutx2') {
            totalMeetsPhotos = 6;
        }

        const selectedIndex = selectedPhotos.indexOf(index);
        if (selectedIndex === -1 && selectedPhotos.length < totalMeetsPhotos) {
            if (selectedFrame == 'Stripx2') {
                setSelectedPhotos([...selectedPhotos, index, index]);
            } else {
                setSelectedPhotos([...selectedPhotos, index]);
            }

        } else {
            setSelectedPhotos(selectedPhotos.filter((item) => item !== index));
        }

        if (selectedPhotos.length === totalMeetsPhotos - 1) {
            setConfirmButton(true);
        } else {
            setConfirmButton(false);
        }
    };

    const goToFilter = async () => {
        if (clickedButton) {
            return;
        }
        playAudio("/src/assets/audio/click_sound.wav")
        sessionStorage.setItem('choosePhotos', JSON.stringify(selectedPhotos));

        // Determine total photos
        let totalMeetsPhotos = 0;
        if (selectedFrame == 'Stripx2') {
            totalMeetsPhotos = 8;
        } else if (selectedFrame == '2cut-x2') {
            totalMeetsPhotos = 2;
        } else if (selectedFrame == '3-cutx2') {
            totalMeetsPhotos = 3;
        } else if (selectedFrame == '4-cutx2') {
            totalMeetsPhotos = 4;
        } else if (selectedFrame == '5-cutx2') {
            totalMeetsPhotos = 5;
        } else if (selectedFrame == '6-cutx2') {
            totalMeetsPhotos = 6;
        }

        if (selectedPhotos.length === totalMeetsPhotos) {
            hoverContinueButton();
            setClickedButton(true);
            const result = await copyImageApi();
            navigate("/filter");
        }
    }
    return (
        <div className="fixed inset-0 bg-pink-50 flex flex-col px-1 py-6 mb-36">
            <div className='flex'>

            </div>
        </div>
    )
}