import { ArrowLeft, ChevronLeft, X } from 'lucide-react'
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { playAudio } from '@/lib/utils'

type Language = 'en' | 'ko' | 'vi' | 'mn'

export default function Promo() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [code, setCode] = useState("")
    const [language, setLanguage] = useState<Language>((sessionStorage.getItem('language') as Language) || 'en')
    const [frameAmount, setFrameAmount] = useState((sessionStorage.getItem('sales'))||'0')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleNumberClick = (num: number) => {
        if (code.length < 10) {
            setCode(prev => prev + num)
        }
    }

    const handleBackspace = () => {
        setCode(prev => prev.slice(0, -1))
    }

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true)
            const deviceNumber = import.meta.env.VITE_REACT_APP_DEVICE_NUMBER;
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/payments/api/redeem?device=${deviceNumber}&code=${code}&amount=${frameAmount}`);
            const paymentData = await response.json();
            if (paymentData.status === "OK") {
                sessionStorage.setItem('orderCodeNum', paymentData.order_code);
                navigate("/payment-result");
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBack = async (): Promise<void> => {
        try {
            await playAudio('/src/assets/audio/click.wav')
            navigate('/payment')
        } catch (error) {
            console.error('Error handling back:', error)
        }
    }

    const translations = {
        title: {
            en: "ENTER A PROMOTION CODE",
            ko: "프로모션 코드 입력",
            vi: "NHẬP MÃ KHUYẾN MÃI",
            mn: "УРАМШУУЛЛЫН КОД ОРУУЛАХ"
        },
        subtitle: {
            en: "Enter your promotional code in the space provided, and select 'REDEEM'. Your code will be automatically applied to your order.",
            ko: "프로모션 코드를 입력하고 '사용하기'를 선택하세요. 코드가 자동으로 주문에 적용됩니다.",
            vi: "Nhập mã khuyến mãi vào ô trống và chọn 'ÁP DỤNG'. Mã của bạn sẽ được tự động áp dụng cho đơn hàng.",
            mn: "Урамшууллын кодоо оруулаад 'АШИГЛАХ' товчийг дарна уу. Таны код захиалгад автоматаар хэрэглэгдэх болно."
        },
        redeem: {
            en: "REDEEM",
            ko: "사용하기",
            vi: "ÁP DỤNG",
            mn: "АШИГЛАХ"
        }
    }

    return (
        <div className="fixed inset-0 bg-pink-50 flex flex-col px-1 py-6 mb-48">
            {/* Header Section */}
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
                        <span>{t('Back')}</span>
                    </Button>
                </motion.div>
            </div>

            <div className="mx-auto max-w-4xl">
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="text-pink-500">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold"
                        >
                            {translations.title[language]}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground"
                        >
                            {translations.subtitle[language]}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <img
                                src="/src/assets/icon/mascot.svg"
                                alt="Promotional illustration"
                                className="rounded-lg"
                            />
                        </motion.div>
                    </div>

                    <Card>
                        <CardContent className="p-11">
                            <div className="space-y-6">
                                <Input
                                    type="text"
                                    value={code}
                                    readOnly
                                    className="text-center text-2xl tracking-wider text-pink-600 font-bold"
                                    maxLength={10}
                                />

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full rounded-lg bg-pink-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-pink-600"
                                    onClick={handleSubmit}
                                    disabled={!code || isSubmitting}
                                >
                                    {translations.redeem[language]}
                                </motion.button>

                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                        <motion.button
                                            key={num}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="aspect-square rounded-lg bg-white text-pink-500 p-4 text-xl font-semibold shadow-sm transition-colors hover:bg-gray-50"
                                            onClick={() => handleNumberClick(num)}
                                        >
                                            {num}
                                        </motion.button>
                                    ))}
                                    <div className="aspect-square" /> {/* Empty space */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="aspect-square rounded-lg bg-white p-4 text-pink-500 text-xl font-semibold shadow-sm transition-colors hover:bg-gray-50"
                                        onClick={() => handleNumberClick(0)}
                                    >
                                        0
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="aspect-square rounded-lg bg-white p-4 text-pink-500 text-xl font-semibold shadow-sm transition-colors hover:bg-gray-50"
                                        onClick={handleBackspace}
                                    >
                                        <X className="mx-auto h-6 w-6" />
                                    </motion.button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}