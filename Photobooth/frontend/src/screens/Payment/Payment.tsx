import { motion } from "framer-motion"
import { ChevronLeft } from 'lucide-react'
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { playAudio } from "@/lib/utils"

interface PaymentMethod {
  id: string
  name: string
  icon: string
  icon_hover: string
}

export default function Payment() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null)
  
  const paymentMethods: PaymentMethod[] = [
    { id: "cash", name: "CASH", icon: "/src/assets/icon/Payment/cash.png", icon_hover: "/src/assets/icon/Payment/cash_click.png" },
    { id: "momo", name: "MOMO", icon: "/src/assets/icon/Payment/momo.png", icon_hover: "/src/assets/icon/Payment/momo_click.png" },
    { id: "qpay", name: "QPAY", icon: "/src/assets/icon/Payment/qpay.png", icon_hover: "/src/assets/icon/Payment/qpay_click.png" },
    { id: "promo", name: "PROMOTION CODE", icon: "/src/assets/icon/Payment/promo.png", icon_hover: "/src/assets/icon/Payment/promo_click.png" },
  ]

  const filteredPaymentMethods = paymentMethods.filter(method =>
    method.id !== (import.meta.env.LOCATION === 'MN' ? 'momo' : 'qpay')
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const handlePaymentSelect = async(method: string) => {
    await playAudio('/src/assets/audio/click.wav')
    navigate(`/payment-${method}`)
  }

  const handleBack = async (): Promise<void> => {
    try {
      await playAudio('/src/assets/audio/click.wav')
      navigate('/payment-number')
    } catch (error) {
      console.error('Error handling back:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-pink-50 flex flex-col px-1 py-6 mb-36">
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
      <div className="mx-auto max-w-6xl items-center justify-center py-20">
        {/* Main Content */}
        <div className="text-center">
          <h1 className="mb-16 text-5xl font-bold tracking-tight text-pink-500">
            {t('text.payment')}
          </h1>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPaymentMethods.map((method) => (
              <motion.div key={method.id} variants={item}>
                <button
                  className="bg-pink-50 group w-full cursor-pointer"
                  onClick={() => handlePaymentSelect(method.id)}
                  onMouseEnter={() => setHoveredMethod(method.id)}
                  onMouseLeave={() => setHoveredMethod(null)}
                >
                  <div className={`mx-auto aspect-square w-full max-w-[300px] rounded-3xl p-8 shadow-sm transition-all duration-300 ${hoveredMethod === method.id ? 'shadow-lg' : ''}`}>
                    <div className="relative h-full w-full ">
                      <img
                        src={hoveredMethod === method.id ? method.icon_hover : method.icon}
                        alt={method.name}
                        className="p-4"
                      />
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}