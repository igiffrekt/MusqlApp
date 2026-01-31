"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowLeft, QrCode, Info } from "lucide-react"
import { CheckInQRCode } from "@/components/checkin/CheckInQRCode"

export default function BelepesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#D2F159] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  const userName = session.user?.name?.split(" ")[0] || "Tag"

  return (
    <div className="min-h-screen bg-[#171725] font-lufga">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#171725] px-6 pt-14 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-semibold">Belépés</h1>
            <p className="text-white/50 text-sm">QR kód a belépéshez</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-8 flex flex-col items-center">
        {/* Greeting */}
        <div className="text-center mb-8">
          <p className="text-white/60 text-sm">Szia, {userName}!</p>
          <h2 className="text-white text-2xl font-semibold mt-1">
            Mutasd meg a kódot
          </h2>
        </div>

        {/* QR Code Component */}
        <div className="w-full max-w-sm">
          <CheckInQRCode size={240} showWalletButton={true} />
        </div>

        {/* Info Card */}
        <div className="mt-8 w-full max-w-sm bg-[#252a32] rounded-2xl border border-white/5 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D2F159]/20 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-[#D2F159]" />
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Hogyan működik?</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                A QR kód 60 másodpercenként automatikusan frissül a biztonság érdekében. 
                Tartsd a kódot a beléptető terminál kamerája elé, és várj a zöld jelzésre.
              </p>
            </div>
          </div>
        </div>

        {/* Recent check-ins could go here */}
      </div>
    </div>
  )
}
