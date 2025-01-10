import { motion } from "framer-motion"
import { ChevronLeft, Minus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { playAudio } from "@/lib/utils"

type Language = 'en' | 'ko' | 'vi' | 'mn'

export default function PaymentNumber() {
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const [language, setLanguage] = useState<Language>((sessionStorage.getItem('language') as Language) || 'en')
    const [photoCount, setPhotoCount] = useState(1)
    const [hasCoupon, setHasCoupon] = useState(false)

    const calculatePrice = () => {
        let basePrice = 70000, additionalPrice = 20000
        if (import.meta.env.VITE_BOOTH_TYPE !== "REG") {
            basePrice = 100000
        }

        if (language === "mn" && import.meta.env.VITE_LOCATION == "MN") {
            basePrice = 10000
            additionalPrice = 5000
        }

        return basePrice + (additionalPrice * (photoCount - 1))
    }

    const handleBack = async (): Promise<void> => {
        try {
            await playAudio('/src/assets/audio/click.wav')
            navigate('/layout')
        } catch (error) {
            console.error('Error handling back:', error)
        }
    }

    const handleConfirm = async () => {
        // Simulate audio click
        await playAudio('/src/assets/audio/click.wav')
        let addition: number = 0
        // Store values in session
        if (import.meta.env.VITE_BOOTH_TYPE !== 'REG' && JSON.parse(sessionStorage.getItem('selectedFrame')).frame !== 'Stripx2') {
            addition = 1
        }
        sessionStorage.setItem("photoNum", (photoCount+addition).toString())
        sessionStorage.setItem("sales", calculatePrice().toString())

        await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/api/get_print_amount?printAmount=${photoCount+addition}&checkCoupon=${hasCoupon}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

        // Navigate to payment page
        navigate("/payment")
    }

    return (
        <div className="fixed inset-0 bg-pink-50 flex flex-col px-1 py-6 mb-48">
            {/* Back Button */}
            <div className="h-[15vh] flex items-center px-16">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        variant="outline"
                        size="lg"
                        className="flex items-center space-x-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full border-none"
                        onClick={handleBack}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>{t('menu.back')}</span>
                    </Button>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto items-center justify-center"
            >
                <Card className="bg-white rounded-3xl shadow-lg w-full h-full">
                    <CardContent className="pt-6">
                        <h1 className="text-2xl font-bold text-center mb-2 text-pink-500">{t('text.payment-number.title')}</h1>
                        <p className="text-center text-pink-400 mb-8">
                            ({t('text.payment-number.warning')} {language === "mn" ? `4,000mnt/sheet` : `20,000đ/sheet`})
                        </p>

                        <div className="flex items-center justify-center gap-4 mb-8">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPhotoCount(c => Math.max(1, c - 1))}
                                className="h-20 w-20 rounded-full border-pink-300 text-pink-500 hover:bg-pink-100 hover:text-pink-600"
                            >
                                <Minus className="h-6 w-6" />
                            </Button>

                            <div className="flex items-center justify-center w-24 h-24 text-4xl font-bold border-2 border-pink-300 rounded-full text-pink-500">
                                {photoCount}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPhotoCount(c => Math.min(10, c + 1))}
                                className="h-20 w-20 rounded-full border-pink-300 text-pink-500 hover:bg-pink-100 hover:text-pink-600"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </div>

                        <div className="text-center mb-6">
                            <div className="text-3xl font-bold text-pink-500">
                                {calculatePrice().toLocaleString()}{language === "mn" ? " mnt" : " đ"}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-8">
                            <Checkbox
                                id="coupon"
                                checked={hasCoupon}
                                onCheckedChange={(checked: boolean) => setHasCoupon(checked as boolean)}
                                className={`border-pink-300 text-pink-500 focus:ring-pink-500 ${hasCoupon ? 'bg-pink-600' : ''}`}
                            />
                            <Label htmlFor="coupon" className="text-pink-600">{t('text.payment-number.coupon')}</Label>
                        </div>

                        <Button
                            className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-full"
                            size="lg"
                            onClick={handleConfirm}
                        >
                            {t('menu.confirm')}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}