"use client"

import { useState, useEffect } from "react"
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
    description: "Lépj be, és tapasztald meg,\nmennyi terhet veszünk le a válladról.",
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
    <div className="h-[100dvh] flex flex-col relative overflow-hidden" style={{ background: "#171725" }}>
      {/* Main Content - Single Card User Journey */}
      <div className="flex-1 flex flex-col px-4 py-4 overflow-hidden">
        <div className="w-full max-w-md mx-auto relative flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className={`relative rounded-3xl overflow-hidden flex-1 flex flex-col ${
                currentStepData.isSplash ? 'min-h-[400px]' : ''
              }`}
              style={{ 
                padding: currentStepData.isSplash ? '20px' : '0',
              }}
              initial={{ 
                x: "100%",
                opacity: 0,
                scale: 0.9,
                rotateY: -15
              }}
              animate={{ 
                x: 0,
                opacity: 1,
                scale: 1,
                rotateY: 0
              }}
              exit={{ 
                x: "-100%",
                opacity: 0,
                scale: 0.9,
                rotateY: 15
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
              }}
            >
            {currentStepData.isSplash ? (
              /* Splash Screen */
              <div className="flex flex-col items-center min-h-[400px] relative">
                {/* 1. Title - Musql.app */}
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.2
                  }}
                  className="font-bold mb-2"
                  style={{ 
                    fontFamily: 'Lufga, Inter, sans-serif',
                    fontSize: '48px',
                    color: '#D2F159'
                  }}
                >
                  Musql
                </motion.h1>

                {/* 2. Description */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.4
                  }}
                  className="text-white/90 text-center"
                  style={{ 
                    fontFamily: 'Lufga, Inter, sans-serif',
                    fontSize: '16px',
                    marginBottom: '24px'
                  }}
                >
                  Óraszervező alkalmazás
                  jógastúdióknak, harcművészeti egyesületnek és személyi edzőknek.
                </motion.p>

                {/* 3. Icon - Rotated 20 degrees left */}
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.6
                  }}
                  className="mb-8"
                >
                  <img
                    src="/img/musql_ikon.png"
                    alt="Musql Icon"
                    className="w-20 h-20 object-contain"
                    style={{ transform: 'rotate(-20deg)' }}
                  />
                </motion.div>
              </div>
            ) : (
              <>
                {/* Image Container - Dynamic height, fills to top */}
                <div className="relative w-full overflow-hidden flex-1 mb-4" style={{ borderRadius: '1.5rem', minHeight: '200px' }}>
                  <div 
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10"
                  />
                  <img
                    src={currentStepData.image}
                    alt={currentStepData.title}
                    className="w-full h-full object-cover object-top"
                    loading="eager"
                  />
                </div>

                {/* Content */}
                <div className="space-y-4" style={{ padding: '30px 0' }}>
                  {/* Progress Dots - Top Left of Content (Visual Only) */}
                  <div className="flex space-x-2">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStep
                            ? "bg-[#D2F159] w-8"
                            : "bg-[#D2F159]/30 w-2"
                        }`}
                      />
                    ))}
                  </div>

                  <h2
                    className="text-2xl font-bold text-white leading-tight"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                  >
                    Digitális óraszervezés és ügyfélkezelés egy helyen.
                  </h2>
                  <p
                    className="text-gray-300 leading-relaxed whitespace-pre-line"
                    style={{ 
                      fontFamily: 'Lufga, Inter, sans-serif',
                      fontSize: '14px'
                    }}
                  >
                    {currentStepData.description}
                  </p>

                  {/* Button */}
                  <motion.button
                    onClick={handleNext}
                    className="relative w-full py-3 px-8 rounded-full font-semibold text-gray-900 bg-[#D2F159] shadow-lg overflow-hidden"
                    style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "#B8D94A",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 17
                    }}
                  >
                    <motion.span
                      className="relative z-10 block"
                      initial={false}
                      whileTap={{ scale: 0.98 }}
                    >
                      {currentStepData.buttonText}
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-white/30 rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      whileTap={{ 
                        scale: 2,
                        opacity: [0, 0.5, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        ease: "easeOut"
                      }}
                    />
                  </motion.button>

                  {/* Sign Up Link (only on last step) */}
                  {currentStepData.isLast && (
                    <div className="text-center">
                      <Link
                        href="/auth/signup"
                        className="text-sm text-gray-400 hover:text-[#D2F159] transition-colors"
                        style={{ fontFamily: 'Lufga, Inter, sans-serif' }}
                      >
                        Nincs még fiókod?{" "}
                        <span className="underline text-[#D2F159]">Regisztráció</span>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* CTA and Indicator - Fixed at bottom of screen (only for splash) */}
      {currentStepData.isSplash && (
        <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center pb-4 px-4 z-10">
          {/* CTA Button */}
          <motion.button
            onClick={handleNext}
            className="relative py-4 px-8 rounded-full font-semibold text-gray-900 shadow-lg overflow-hidden"
            style={{ 
              fontFamily: 'Lufga, Inter, sans-serif',
              backgroundColor: '#D2F159',
              width: '327px',
              marginBottom: '12px'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.8
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "#B8D94A",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            whileTap={{ 
              scale: 0.95,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
          >
            <motion.span
              className="relative z-10 block"
              initial={false}
              whileTap={{ scale: 0.98 }}
            >
              Kezdés
            </motion.span>
            <motion.div
              className="absolute inset-0 bg-white/30 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              whileTap={{ 
                scale: 2,
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut"
              }}
            />
          </motion.button>

          {/* Progress Dots and Version */}
          <div className="flex flex-col items-center" style={{ marginBottom: '8px' }}>
            <div className="flex space-x-2 mb-2" style={{ padding: '6px' }}>
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "bg-white w-8"
                      : "bg-white/30 w-2"
                  }`}
                />
              ))}
            </div>
            <span 
              className="text-white/60 text-sm"
              style={{ 
                fontFamily: 'Lufga, Inter, sans-serif',
                paddingTop: '12px'
              }}
            >
              V1.0
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
