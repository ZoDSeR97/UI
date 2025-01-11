import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Banana, Apple, Gift } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { playAudio } from "@/lib/utils"

import Confetti from 'react-confetti'

export default function Result() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [confettiActive, setConfettiActive] = useState(true);

  useEffect(() => {
    // Play success sound
    playAudio("/src/assets/audio/pay_success.wav")

    // Disable confetti after 5 seconds
    const timer = setTimeout(() => setConfettiActive(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleContinue = () => {
    playAudio('/src/assets/audio/click.wav')
    navigate("/photo")
  }

  return (
    <div className="fixed inset-0 bg-pink-50 flex flex-col px-1 py-6 mb-48 items-center justify-center">
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
            {t('text.result')}
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
          >
            <Button
              onClick={handleContinue}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-xl rounded-full font-bold tracking-wide transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {t('menu.continue')}
            </Button>
          </motion.div>
        </motion.div>
      </Card>
    </div>
  )
}