import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#171725] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-[#D2F159] animate-spin" />
        <p className="text-white/60 text-sm">Betöltés...</p>
      </div>
    </div>
  )
}
