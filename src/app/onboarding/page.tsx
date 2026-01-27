"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface OnboardingStep {
  id: number
  image: string
  title: string
  description: string
  buttonText: string
  isLast?: boolean
  isSplash?: boolean
}

const steps: OnboardingStep[] = [
  {
    id: 0,
    image: "",
    title: "",
    description: "",
    buttonText: "Folytatás",
    isSplash: true,
  },
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=1000&fit=crop&q=80",
    title: "Tanulókezelés és szervezés egy helyen",
    description: "Egyszerű adminisztráció papír és üzenetáradat nélkül, egy jól átlátható online rendszerben.",
    buttonText: "Folytatás",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=1000&fit=crop&q=80",
    title: "Foglalkozz az ügyfelekkel - mi intézzük a többit.",
    description: "Jelenlét vezetése, fizetések és bérletek nyomonkövetése, ügyfelek kezelése.",
    buttonText: "Folytatás",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=1000&fit=crop&q=80",
    title: "Láss hozzá, és fejlődjünk közösen",
    description: "Lépj be, és tapasztald meg, mennyi terhet veszünk le a válladról.",
    buttonText: "Belépés",
    isLast: true,
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const handleNext = () => {
    if (steps[currentStep].isLast) {
      router.push("/auth/signin")
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="h-[100dvh] flex flex-col bg-[#171725] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="flex-1 flex flex-col"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {currentStepData.isSplash ? (
            /* Splash Screen */
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-bold text-[#D2F159] mb-3"
                >
                  Musql
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90 text-center text-base mb-8 max-w-xs"
                >
                  Óraszervező alkalmazás jógastúdióknak, harcművészeti egyesületnek és személyi edzőknek.
                </motion.p>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="w-24 h-24 rounded-2xl bg-[#D2F159] flex items-center justify-center rotate-[-12deg]"
                >
                  <span className="text-4xl">💪</span>
                </motion.div>
              </div>
              
              {/* Bottom section for splash */}
              <div className="px-6 pb-8">
                <button
                  onClick={handleNext}
                  className="w-full py-4 rounded-full font-semibold text-[#171725] bg-[#D2F159] active:scale-95 transition-transform mb-4"
                >
                  Kezdés
                </button>
                <div className="flex justify-center space-x-2 mb-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === currentStep ? "bg-white w-8" : "bg-white/30 w-2"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-white/40 text-xs">V1.0</p>
              </div>
            </div>
          ) : (
            /* Content Steps */
            <div className="flex-1 flex flex-col px-4 py-4">
              {/* Image - takes available space */}
              <div 
                className="flex-1 rounded-3xl overflow-hidden bg-cover bg-center min-h-0"
                style={{ backgroundImage: `url(${currentStepData.image})`, maxHeight: '55vh' }}
              />
              
              {/* Content - fixed height */}
              <div className="pt-5 pb-8 px-2">
                <h2 className="text-xl font-bold text-white mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-white/70 text-sm mb-5">
                  {currentStepData.description}
                </p>
                
                <button
                  onClick={handleNext}
                  className="w-full py-4 rounded-full font-semibold text-[#171725] bg-[#D2F159] active:scale-95 transition-transform mb-4"
                >
                  {currentStepData.buttonText}
                </button>
                
                {currentStepData.isLast && (
                  <div className="text-center mb-3">
                    <Link href="/auth/signup" className="text-sm text-white/60">
                      Nincs még fiókod?{" "}
                      <span className="text-[#D2F159] underline">Regisztráció</span>
                    </Link>
                  </div>
                )}
                
                {/* Progress dots */}
                <div className="flex justify-center space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === currentStep ? "bg-[#D2F159] w-8" : "bg-white/30 w-2"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
