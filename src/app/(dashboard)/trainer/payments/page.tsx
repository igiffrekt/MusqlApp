"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, ArrowRight, ArrowLeft } from "lucide-react"

export default function PaymentsPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-between min-h-[70vh] p-4">
      <div />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#252a32] flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-white/40" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">
          Fizetések kezelése
        </h1>
        
        <p className="text-white/60 mb-8">
          Ez a funkció a jelenlegi előfizetéseddel nem érhető el. 
          Válts magasabb csomagra a fizetések követéséhez és kezeléséhez.
        </p>
        
        <button
          onClick={() => router.push("/subscribe")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#D2F159] text-[#171725] rounded-xl font-semibold hover:bg-[#c4e350] transition-all"
        >
          Csomag váltás
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
      
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 transition-all text-sm pb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Vissza a kezdőlapra
      </button>
    </div>
  )
}
