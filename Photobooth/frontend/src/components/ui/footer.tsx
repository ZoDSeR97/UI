import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Footer(): JSX.Element {
    const location = useLocation();

    // Check if the current path is NOT the homepage ('/')
    const isNotHomepage = location.pathname !== "/";
    const isNotPhotoShoot = location.pathname !== "/photo";
    const isNotChoosing = location.pathname !== "/photo-choose";
    const isNotFilter = location.pathname !== "/filter";
    const isNotSticker = location.pathname !== "/sticker";
    return(
        <>
            {isNotHomepage && isNotPhotoShoot && isNotChoosing && isNotFilter && isNotSticker
                &&
                <div className="h-[25vh] flex items-center justify-center">
                    <motion.div
                        className="text-pink-500 font-bold text-center"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div animate={{ y: [0, -10, 0], }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", }}>
                            <img
                                src="/src/assets/icon/logo.svg"
                                alt="Logo"
                                className="w-full h-full"
                                width={10}
                                height={10}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            }
        </>
    );
}