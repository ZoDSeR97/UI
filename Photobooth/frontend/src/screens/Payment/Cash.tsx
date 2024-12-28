import { motion } from "framer-motion"
import { ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { playAudio } from "@/lib/utils"

type Language = 'en' | 'ko' | 'vi' | 'mn'

export default function Cash() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [language, setLanguage] = useState<Language>((sessionStorage.getItem('language') as Language) || 'en')
  const [insertedMoney, setInsertedMoney] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderCode, setOrderCode] = useState<string | null>(null)
  const [amountToPay, setAmountToPay] = useState<number>(() => {
    const sales = sessionStorage.getItem('sales');
    const parsedSales = parseInt(sales || "0");
    return !isNaN(parsedSales) ? parsedSales : 0;
  });

  // Check payment status continuously
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (orderCode && insertedMoney < amountToPay) {
      intervalId = setInterval(() => {
        checkPaymentStatus(orderCode)
      }, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [orderCode, insertedMoney, amountToPay])

  // Auto - transition when inserted amount is sufficient
  useEffect(() => {
    if (insertedMoney >= amountToPay) {
      handlePaymentCompletion()
    }
  }, [insertedMoney, amountToPay])


  // Initialize payment
  useEffect(() => {
    startCashPayment()
  }, [])

  const startCashPayment = async () => {
    try {
      const amountToPay = sessionStorage.getItem('sales');
      const deviceNumber = import.meta.env.VITE_REACT_APP_DEVICE_NUMBER;
      
      await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/payments/api/cash/create?device=${deviceNumber}&amount=${amountToPay}`)
        .then((response) => response.json())
        .then((data) => setOrderCode(data.orderCode))

      await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/cash/start`, {
        method: "POST",
        body: JSON.stringify({ amount: amountToPay }),
      }).then((response) => response.text())
        .then((result) => console.log(result))
    } catch (error) {
      console.error("Failed to start payment:", error)
    }
  }

  async function checkPaymentStatus(code: string) {
    try {
      await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/cash/status`)
      .then((response) => response.json())
        .then((data) => setInsertedMoney(data.totalMoney))
    } catch (error) {
      console.error("Failed to check status:", error)
    }
  }

  const handlePaymentCompletion = async () => {
    setIsProcessing(true)
    try {
      await Promise.all([
        fetch("/api/cash/stop", { method: "POST" }),
        fetch(`/api/cash/webhook?order=${orderCode}`)
      ])
      navigate("/payment-result")
    } catch (error) {
      console.error("Payment completion failed:", error)
      setIsProcessing(false)
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
      en: "INSERT MONEY",
      ko: "현금을 넣어주세요",
      vi: "CHÈN TIỀN",
      mn: "МӨНГӨ ОРУУЛАХ"
    },
    toBePaid: {
      en: "TO BE PAID",
      ko: "지불할 금액",
      vi: "SỐ TIỀN PHẢI TRẢ",
      mn: "ТӨЛӨХ ДҮНГ"
    },
    inserted: {
      en: "INSERTED",
      ko: "삽입된 금액",
      vi: "ĐÃ CHÈN",
      mn: "ОРУУЛСАН"
    },
    processing: {
      en: "Processing payment...",
      ko: "결제 처리 중...",
      vi: "Đang xử lý thanh toán...",
      mn: "Төлбөр боловсруулж байна..."
    }
  }

  return (
    <div className="fixed inset-0 bg-pink-50 flex flex-col px-1 py-6 mb-44">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md"
      >
        <div className="text-center text-pink-500">
          <h1 className="text-3xl font-bold">
            {translations.title[language]}
          </h1>
          <p className="mt-2">
            Please insert the exact cash you would like to pay.<br/>
            This machine does not return funds.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6 text-pink-500">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                  {translations.toBePaid[language]}
                </span>
                <span className="text-2xl font-bold">
                  ${amountToPay.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                  {translations.inserted[language]}
                </span>
                <motion.span
                  key={insertedMoney}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-green-600"
                >
                  ${insertedMoney.toFixed(2)}
                </motion.span>
              </div>
            </div>

            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-green-100 rounded-lg"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.min(insertedMoney / amountToPay, 1) }}
                style={{ transformOrigin: "left" }}
              />
              <div className="relative h-2 bg-gray-100 rounded-lg" />
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center text-green-600">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {translations.processing[language]}
              </div>
            )}
          </CardContent>
        </Card>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <img
            src="/src/assets/icon/mascot.svg"
            alt="Payment mascot"
            className="w-full h-full"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}