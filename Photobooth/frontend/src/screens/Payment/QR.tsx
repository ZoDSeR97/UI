import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { Heart, Smartphone, AlertCircle, ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslation } from 'react-i18next'

interface QRPaymentProps {
    method: string
}

type Language = 'en' | 'ko' | 'vi' | 'mn'

export default function QR({ method }: QRPaymentProps) {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [orderCode, setOrderCode] = useState<string | null>(null)
    const [language, setLanguage] = useState<Language>((sessionStorage.getItem('language') as Language) || 'en')
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

    const deviceNumber = import.meta.env.VITE_REACT_APP_DEVICE_NUMBER || "001"
    const amount = sessionStorage.getItem('sales') || "0"
    const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND || "https://api.example_of_screw_up.com"

    const playAudio = async (audioPath: string): Promise<void> => {
        try {
            const audio = new Audio(audioPath)
            await audio.play()
        } catch (error) {
            console.error('Error playing audio:', error)
        }
    }

    useEffect(() => {
        const fetchQRPayment = async () => {
            try {
                const response = await fetch(`${backendUrl}/${method}/api?device=${deviceNumber}&amount=${amount}`)
                const data = await response.json()
                setQrCode(data.qr_code)
                setOrderCode(data.order_code)
                if (data.return_code === 1) {
                    setPaymentStatus(data.status)
                }
            } catch (error) {
                console.error(error)
            }
        }

        fetchQRPayment()
    }, [method, deviceNumber, amount, backendUrl])

    useEffect(() => {
        if (!orderCode) return

        const checkPaymentStatus = async () => {
            try {
                const response = await fetch(`${backendUrl}/${method}/api/webhook?order=${orderCode}`)
                const data = await response.json()
                if (data.status === "Success") {
                    setPaymentStatus("Success")
                }
            } catch (error) {
                console.error(error)
            }
        }

        const interval = setInterval(checkPaymentStatus, 8000)
        return () => clearInterval(interval)
    }, [orderCode, method, backendUrl])

    const handleBack = async (): Promise<void> => {
        try {
            await playAudio('/src/assets/audio/click.wav')
            navigate('/layout')
        } catch (error) {
            console.error('Error handling back:', error)
        }
    }

    return (
        <div className="fixed inset-0 bg-pink-50 flex flex-col px-1 py-6 mb-36">
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
                        <span>{t('Back')}</span>
                    </Button>
                </motion.div>
            </div>

            <main className="container bg-pink-50 mx-auto px-4 py-8 mt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <h1 className="text-4xl font-bold tracking-tight text-pink-500">SCAN QR CODE TO PAY</h1>
                    <p className="text-pink-500">
                        Scan the QR code with your {method} app, enter the payment amount in the local currency, review and click pay.
                    </p>
                </motion.div>

                <div className="mt-12 grid md:grid-cols-2 gap-8 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <Card className="overflow-hidden bg-white">
                            <CardContent className="p-8">
                                <div className="absolute -left-4 -top-4">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                    >
                                        <Heart className="h-16 w-16 text-pink-400 fill-pink-400" />
                                    </motion.div>
                                </div>
                                {qrCode && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-center py-8"
                                    >
                                        <QRCodeSVG value={qrCode} size={280} />
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <Card className="overflow-hidden border-2 border-pink-200 bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <Smartphone className="h-8 w-8 text-pink-400" />
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-semibold text-pink-500">SCAN TO PAY</h2>
                                        <p className="text-sm text-pink-400">Quick and secure payment</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Alert className="bg-pink-100 border-pink-200">
                            <AlertCircle className="h-4 w-4 text-pink-500" />
                            <AlertDescription className="ml-2 text-pink-500">
                                The QR code to pay is unique for each transaction. Do not send funds to the same address more than once.
                            </AlertDescription>
                        </Alert>

                        <AnimatePresence>
                            {paymentStatus === "Success" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <Alert className="bg-green-100 border-green-200">
                                        <AlertDescription className="text-green-600">Payment successful! Redirecting...</AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}