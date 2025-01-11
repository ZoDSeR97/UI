import { motion } from "framer-motion"
import { ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { playAudio } from "@/lib/utils"

export default function Cash() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [insertedMoney, setInsertedMoney] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderCode, setOrderCode] = useState<string | null>(null)
  const [amountToPay, setAmountToPay] = useState<number>(() => {
    const sales = sessionStorage.getItem('sales');
    const parsedSales = parseInt(sales || "0");
    return !isNaN(parsedSales) ? parsedSales : 0;
  });

  const checkPaymentStatus = useCallback(async() => {
    try {
      await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/cash/status`)
        .then((response) => response.json())
        .then((data) => setInsertedMoney(data.totalMoney))
    } catch (error) {
      console.error("Failed to check status:", error)
    }
  }, [])

  // Check payment status continuously
  useEffect(() => {
    //NodeJS.Timeout
    const intervalId = setInterval(() => {
      const ooCode = sessionStorage.getItem('orderCodeNum');
      if (ooCode && insertedMoney < amountToPay) {
        checkPaymentStatus(ooCode);
      } else if (insertedMoney >= amountToPay) {
        // Stop the interval when payment is complete
        clearInterval(intervalId);
      }
    }, 500);
    return () => clearInterval(intervalId);
  }, [amountToPay, insertedMoney, checkPaymentStatus]);

  const handlePaymentCompletion = useCallback(async () => {
    setIsProcessing(true)
    try {
      await Promise.all([
        fetch(`${import.meta.env.VITE_REACT_APP_API}/api/cash/reset`, { method: "POST" }),
        fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/payments/api/cash/webhook?order=${orderCode}`)
      ])
      navigate("/payment-result")
    } catch (error) {
      console.error("Payment completion failed:", error)
      setIsProcessing(false)
    }
  }, [navigate, orderCode]);

  // Auto - transition when inserted amount is sufficient
  useEffect(() => {
    if (insertedMoney >= amountToPay) {
      handlePaymentCompletion()
    }
  }, [insertedMoney, amountToPay, handlePaymentCompletion])


  // Initialize payment
  useEffect(() => {
    startCashPayment()
  }, [])

  const startCashPayment = async () => {
    try {
      const amountToPay = sessionStorage.getItem('sales');
      const deviceNumber = import.meta.env.VITE_REACT_APP_DEVICE_NUMBER;

      if (sessionStorage.getItem('orderCodeNum')){
        setOrderCode(sessionStorage.getItem('orderCodeNum'));
      } else {
        await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/payments/api/cash/create?device=${deviceNumber}&amount=${amountToPay}`)
          .then((response) => response.json())
          .then((data) => {
            sessionStorage.setItem('orderCodeNum', data.order_code);
            setOrderCode(data.order_code)
          })
      }

      await fetch(`${import.meta.env.VITE_REACT_APP_API}/api/cash/start`, {
        method: "POST",
        body: JSON.stringify({ amount: amountToPay }),
      }).then((response) => response.text())
        .then((result) => console.log(result))
    } catch (error) {
      console.error("Failed to start payment:", error)
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
            <span>{t('menu.back')}</span>
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
            {t('text.cash.title')}
          </h1>
          <p className="mt-2">
            {t('text.cash.instruction')}<br />
            {t('text.cash.warning')}
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6 text-pink-500">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                  {t('text.cash.toBePaid')}
                </span>
                <span className="text-2xl font-bold">
                  ${amountToPay.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                  {t('text.cash.inserted')}
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
                {t('text.cash.processing')}
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