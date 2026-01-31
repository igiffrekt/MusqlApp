"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Calendar, Users, CreditCard, Sparkles } from "lucide-react"

interface OnboardingStep {
  id: number
  icon: React.ElementType
  title: string
  description: string
  image?: string
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    icon: Calendar,
    title: "Tanulókezelés és szervezés egy helyen",
    description: "Egyszerű adminisztráció papír és üzenetáradat nélkül, egy jól átlátható online rendszerben.",
    image: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop&q=80",
  },
  {
    id: 2,
    icon: Users,
    title: "Foglalkozz az ügyfelekkel - mi intézzük a többit",
    description: "Jelenlét vezetése, fizetések és bérletek nyomonkövetése, ügyfelek kezelése.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=80",
  },
  {
    id: 3,
    icon: CreditCard,
    title: "Online fizetés és számlázás",
    description: "Stripe integráció beépítve, automatikus számlaküldés és fizetési emlékeztetők.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&q=80",
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0) // 0 = splash, 1-3 = steps
  const router = useRouter()

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1)
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/auth/signin")
    }
  }

  const handleSkip = () => {
    router.push("/auth/signin")
  }

  const currentStepData = currentStep > 0 ? steps[currentStep - 1] : null
  const isLastStep = currentStep === steps.length
  const isSplash = currentStep === 0

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #D2F159 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #FF6F61 0%, transparent 70%)" }}
          animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header with Logo and Skip */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Image src="/img/musql_logo.png" alt="Musql" width={120} height={32} className="h-8 w-auto" />
        </motion.div>
        {!isSplash && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleSkip}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Kihagyás
          </motion.button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-start p-4 pt-16 lg:pt-20 lg:items-center lg:justify-center">
        <div className="w-full max-w-md lg:max-w-lg">
          <AnimatePresence mode="wait">
            {isSplash ? (
              /* Splash Screen */
              <motion.div
                key="splash"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: -10 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="mb-8 inline-block"
                >
                  <Image
                    src="/img/musql_logo.png"
                    alt="Musql"
                    width={100}
                    height={100}
                    className="w-24 h-24 lg:w-32 lg:h-32"
                  />
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl lg:text-5xl font-bold text-[#D2F159] mb-4"
                >
                  Musql
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/70 text-lg mb-12 max-w-xs mx-auto"
                >
                  Óraszervező alkalmazás jógastúdióknak, harcművészeti egyesületnek és személyi edzőknek.
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleNext}
                  className="w-full max-w-xs mx-auto bg-gradient-to-r from-[#D2F159] to-[#c4e350] text-[#171725] rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-[#D2F159]/20"
                >
                  Kezdés
                  <ChevronRight className="w-5 h-5" />
                </motion.button>

                {/* Version */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-white/30 text-sm mt-8"
                >
                  v1.0
                </motion.p>
              </motion.div>
            ) : (
              /* Step Cards */
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-[#1E1E2D]/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10"
              >
                {/* Image */}
                {currentStepData?.image && (
                  <div className="relative h-48 lg:h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1E1E2D] z-10" />
                    <img
                      src={currentStepData.image}
                      alt={currentStepData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 lg:p-8 -mt-8 relative z-20">
                  {/* Progress dots */}
                  <div className="flex gap-2 mb-6">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all ${
                          index + 1 === currentStep
                            ? "bg-[#D2F159] w-8"
                            : index + 1 < currentStep
                            ? "bg-[#D2F159]/50 w-4"
                            : "bg-white/20 w-4"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Icon */}
                  {currentStepData && (
                    <div className="w-14 h-14 bg-gradient-to-br from-[#D2F159] to-[#D2F159]/70 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#D2F159]/20">
                      <currentStepData.icon className="w-7 h-7 text-[#171725]" />
                    </div>
                  )}

                  <h2 className="text-xl lg:text-2xl font-bold text-white mb-3">
                    {currentStepData?.title}
                  </h2>
                  <p className="text-white/60 mb-8">
                    {currentStepData?.description}
                  </p>

                  <button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-[#D2F159] to-[#c4e350] text-[#171725] rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-[#D2F159]/20"
                  >
                    {isLastStep ? "Belépés" : "Folytatás"}
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {isLastStep && (
                    <p className="text-center text-white/40 text-sm mt-4">
                      Nincs még fiókod?{" "}
                      <Link href="/auth/signup" className="text-[#D2F159] hover:text-[#D2F159]/80 transition-colors">
                        Regisztráció
                      </Link>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
