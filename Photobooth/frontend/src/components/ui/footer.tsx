import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Footer(): JSX.Element {
    const location = useLocation();

    // Check if the current path is NOT the homepage ('/')
    const isNotHomepage = location.pathname !== "/";
    return(
        <>
            {isNotHomepage
                &&
                <div className="h-[25vh] flex items-center justify-center">
                    <motion.div
                        className="text-pink-500 font-bold text-center"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            className="text-2xl mb-2"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            PHOTO
                        </motion.div>
                        <div className="text-2xl">
                            M
                            <span className="inline-block relative">
                                <svg viewBox="0 0 100 100" className="w-16 h-16 fill-current inline-block">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" />
                                    <rect x="30" y="30" width="40" height="40" rx="5" />
                                    <circle cx="50" cy="50" r="15" />
                                    <motion.circle
                                        cx="75"
                                        cy="25"
                                        r="8"
                                        fill="white"
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
                    </motion.div>
                </div>
            }
        </>
    );
}