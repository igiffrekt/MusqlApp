"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, XCircle, Loader2, Camera, WifiOff, Volume2, VolumeX } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"

interface Terminal {
  id: string
  name: string
  deviceId: string
  settings: {
    soundEnabled?: boolean
  } | null
  organization: {
    id: string
    name: string
  }
}

interface Student {
  id: string
  firstName: string
  lastName: string
  photo: string | null
  beltLevel: string | null
}

interface ScanResult {
  valid: boolean
  status: string
  student?: Student
  reason?: string
}

type ScanState = "idle" | "scanning" | "processing" | "success" | "denied"

export default function KioskPage() {
  const params = useParams()
  const deviceId = params.deviceId as string
  
  const [terminal, setTerminal] = useState<Terminal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scanState, setScanState] = useState<ScanState>("idle")
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastScannedToken, setLastScannedToken] = useState<string | null>(null)
  
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load terminal info
  useEffect(() => {
    async function loadTerminal() {
      try {
        const res = await fetch(`/api/checkin/terminal?deviceId=${deviceId}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Terminál betöltése sikertelen")
        }
        const data = await res.json()
        setTerminal(data)
        setSoundEnabled(data.settings?.soundEnabled !== false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ismeretlen hiba")
      } finally {
        setLoading(false)
      }
    }
    loadTerminal()
  }, [deviceId])

  // Play sound
  const playSound = useCallback((type: "success" | "denied") => {
    if (!soundEnabled) return
    try {
      const audio = new Audio(type === "success" ? "/sounds/success.mp3" : "/sounds/denied.mp3")
      audio.play().catch(() => {})
    } catch {}
  }, [soundEnabled])

  // Handle scan result
  const handleScan = useCallback(async (token: string) => {
    // Prevent duplicate scans of same token
    if (token === lastScannedToken) return
    setLastScannedToken(token)
    
    setScanState("processing")
    
    try {
      const res = await fetch("/api/checkin/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          terminalId: terminal?.id,
          method: "QR_CODE"
        })
      })
      
      const result: ScanResult = await res.json()
      setScanResult(result)
      
      if (result.valid) {
        setScanState("success")
        playSound("success")
      } else {
        setScanState("denied")
        playSound("denied")
      }
      
      // Reset after 4 seconds
      resetTimeoutRef.current = setTimeout(() => {
        setScanState("scanning")
        setScanResult(null)
        setLastScannedToken(null)
      }, 4000)
      
    } catch {
      setScanState("denied")
      setScanResult({ valid: false, status: "ERROR", reason: "Hálózati hiba" })
      playSound("denied")
      
      resetTimeoutRef.current = setTimeout(() => {
        setScanState("scanning")
        setScanResult(null)
        setLastScannedToken(null)
      }, 4000)
    }
  }, [terminal?.id, lastScannedToken, playSound])

  // Initialize scanner
  useEffect(() => {
    if (!terminal || scanState !== "idle") return
    
    const scanner = new Html5Qrcode("qr-reader")
    scannerRef.current = scanner
    
    scanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1
      },
      (decodedText) => {
        handleScan(decodedText)
      },
      () => {} // Ignore errors during scanning
    ).then(() => {
      setScanState("scanning")
    }).catch((err) => {
      console.error("Camera error:", err)
      setError("Kamera hozzáférés megtagadva. Engedélyezd a böngésző beállításaiban.")
    })
    
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
      }
      scanner.stop().catch(() => {})
    }
  }, [terminal, scanState, handleScan])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f17] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  // Error state
  if (error || !terminal) {
    return (
      <div className="min-h-screen bg-[#0f0f17] flex items-center justify-center p-8">
        <div className="text-center">
          <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">Hiba</h1>
          <p className="text-white/60">{error || "Terminál nem található"}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-[#D2F159] text-black rounded-xl font-medium"
          >
            Újrapróbálás
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f17] flex flex-col font-lufga overflow-hidden">
      {/* Header */}
      <header className="p-6 flex items-center justify-between bg-[#171725] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D2F159] flex items-center justify-center">
            <span className="text-black font-bold text-xl">
              {terminal.organization.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">{terminal.organization.name}</h1>
            <p className="text-white/50 text-sm">{terminal.name}</p>
          </div>
        </div>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 rounded-xl bg-[#252a32] border border-white/5"
        >
          {soundEnabled ? (
            <Volume2 className="w-6 h-6 text-white/70" />
          ) : (
            <VolumeX className="w-6 h-6 text-white/40" />
          )}
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-8">
        {/* Scanning state */}
        {(scanState === "idle" || scanState === "scanning") && (
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <Camera className="w-12 h-12 text-[#D2F159] mx-auto mb-4" />
              <h2 className="text-white text-2xl font-semibold mb-2">
                Tartsd a QR kódot a kamera elé
              </h2>
              <p className="text-white/50">A belépéshez mutasd meg a Musql appban lévő QR kódodat</p>
            </div>
            <div id="qr-reader" className="rounded-2xl overflow-hidden bg-black" />
          </div>
        )}

        {/* Processing state */}
        {scanState === "processing" && (
          <div className="text-center">
            <Loader2 className="w-20 h-20 text-[#D2F159] animate-spin mx-auto mb-4" />
            <h2 className="text-white text-2xl font-semibold">Ellenőrzés...</h2>
          </div>
        )}

        {/* Success state */}
        {scanState === "success" && scanResult?.student && (
          <div className="text-center animate-in zoom-in duration-300">
            <div className="w-32 h-32 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            {scanResult.student.photo && (
              <img 
                src={scanResult.student.photo}
                alt=""
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-4 ring-white/10"
              />
            )}
            <h2 className="text-white text-3xl font-bold mb-2">
              Szia, {scanResult.student.firstName}!
            </h2>
            <p className="text-green-500 text-xl font-medium">
              ✓ Sikeres belépés
            </p>
            {scanResult.student.beltLevel && (
              <p className="text-white/50 mt-2">{scanResult.student.beltLevel}</p>
            )}
          </div>
        )}

        {/* Denied state */}
        {scanState === "denied" && (
          <div className="text-center animate-in zoom-in duration-300">
            <div className="w-32 h-32 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6 ring-4 ring-red-500">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            {scanResult?.student && (
              <>
                {scanResult.student.photo && (
                  <img 
                    src={scanResult.student.photo}
                    alt=""
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-4 ring-white/10 opacity-50"
                  />
                )}
                <h2 className="text-white text-2xl font-bold mb-2">
                  {scanResult.student.firstName} {scanResult.student.lastName}
                </h2>
              </>
            )}
            <p className="text-red-500 text-xl font-medium">
              ✗ Belépés megtagadva
            </p>
            <p className="text-white/50 mt-2">
              {scanResult?.reason || "Ismeretlen hiba"}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-white/30 text-sm">
        Powered by Musql
      </footer>
    </div>
  )
}
