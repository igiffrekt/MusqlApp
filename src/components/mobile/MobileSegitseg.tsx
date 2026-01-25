"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageCircle, Mail, Phone, Globe, ChevronDown, X, Send } from "lucide-react"
import { toast } from "sonner"
import { MobileNavbar } from "./MobileNavbar"

const DEVICE_OPTIONS = [
  { id: "ios", label: "iOS (iPhone/iPad)" },
  { id: "android", label: "Android" },
  { id: "web", label: "Web böngésző" },
  { id: "other", label: "Egyéb" },
]

export function MobileSegitseg() {
  const router = useRouter()
  const [showTicketModal, setShowTicketModal] = useState(false)

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
          <h1 className="text-white text-xl font-semibold">Segítség</h1>
        </div>
      </header>

      <div className="px-6 pb-8 space-y-6">
        {/* Contact Info Card */}
        <section className="bg-[#252a32] rounded-2xl p-5 border border-white/5">
          <h2 className="text-white font-semibold mb-4">Kapcsolat</h2>

          <div className="space-y-4">
            {/* Developer Info */}
            <div className="bg-[#333842] rounded-xl p-4">
              <p className="text-white/40 text-xs mb-1">Fejlesztő</p>
              <p className="text-white font-medium">Stickerey Development</p>
            </div>

            {/* Email */}
            <a
              href="mailto:stickerey@gmail.com"
              className="flex items-center gap-4 bg-[#333842] rounded-xl p-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#252a32] flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#D2F159]" />
              </div>
              <div className="flex-1">
                <p className="text-white/40 text-xs">Email</p>
                <p className="text-white">stickerey@gmail.com</p>
              </div>
            </a>

            {/* Phone */}
            <a
              href="tel:+36201234567"
              className="flex items-center gap-4 bg-[#333842] rounded-xl p-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#252a32] flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#D2F159]" />
              </div>
              <div className="flex-1">
                <p className="text-white/40 text-xs">Telefon</p>
                <p className="text-white">+36 20 123 4567</p>
              </div>
            </a>

            {/* Website */}
            <a
              href="https://musql.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-[#333842] rounded-xl p-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#252a32] flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#D2F159]" />
              </div>
              <div className="flex-1">
                <p className="text-white/40 text-xs">Weboldal</p>
                <p className="text-white">musql.app</p>
              </div>
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-[#252a32] rounded-2xl p-5 border border-white/5">
          <h2 className="text-white font-semibold mb-4">Gyakori kérdések</h2>

          <div className="space-y-3">
            <FAQItem
              question="Hogyan adok hozzá új tagot?"
              answer="A főoldalon a Tagfelvétel gombra koppintva könnyedén felvehetsz új tagokat. Töltsd ki a szükséges adatokat és mentsd el."
            />
            <FAQItem
              question="Hogyan tudom követni a befizetéseket?"
              answer="A Pénzügy menüpontban láthatod az összes befizetést, tartozást és a pénzügyi összesítőt."
            />
            <FAQItem
              question="Hogyan módosítom az előfizetésemet?"
              answer="A Fiók menüpontban az Előfizetés szekcióban tudod módosítani a csomagodat."
            />
          </div>
        </section>

        {/* Support Ticket Button */}
        <button
          onClick={() => setShowTicketModal(true)}
          className="w-full bg-[#D2F159] rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-[#171725] flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-[#D2F159]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[#171725] font-semibold">Support jegy küldése</p>
            <p className="text-[#171725]/60 text-sm">Probléma bejelentése a fejlesztőnek</p>
          </div>
        </button>
      </div>

      {/* Support Ticket Modal */}
      {showTicketModal && (
        <SupportTicketModal onClose={() => setShowTicketModal(false)} />
      )}

      <MobileNavbar />
    </div>
  )
}

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-[#333842] rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <span className="text-white font-medium pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-white/60 text-sm">{answer}</p>
        </div>
      )}
    </div>
  )
}

interface SupportTicketModalProps {
  onClose: () => void
}

function SupportTicketModal({ onClose }: SupportTicketModalProps) {
  const [subject, setSubject] = useState("")
  const [device, setDevice] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false)

  const selectedDevice = DEVICE_OPTIONS.find(d => d.id === device)

  const handleSubmit = async () => {
    if (!subject.trim() || !device || !description.trim()) {
      toast.error("Kérlek töltsd ki az összes mezőt!")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "stickerey@gmail.com",
          subject: `[Support] ${subject}`,
          message: `Probléma leírása: ${subject}\n\nEszköz: ${selectedDevice?.label || device}\n\nRészletes leírás:\n${description}`,
          memberName: "Support Felhasználó",
        }),
      })

      if (response.ok) {
        toast.success("Support jegy sikeresen elküldve!")
        onClose()
      } else {
        toast.error("Hiba történt a küldés során")
      }
    } catch (error) {
      console.error("Failed to send support ticket:", error)
      toast.error("Hiba történt a küldés során")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#171725] rounded-t-[32px] w-full max-h-[90vh] overflow-y-auto animate-slide-in-bottom">
        {/* Header */}
        <div className="sticky top-0 bg-[#171725] px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">Support jegy</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32]"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Subject */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              Probléma rövid leírása
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="pl. Nem tudom betölteni a taglistát"
              className="w-full bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
            />
          </div>

          {/* Device Dropdown */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              Milyen eszközön jelentkezik a probléma?
            </label>
            <div className="relative">
              <button
                onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
                className="w-full bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4 text-left flex items-center justify-between focus:outline-none focus:border-[#D2F159]"
              >
                <span className={selectedDevice ? "text-white" : "text-white/40"}>
                  {selectedDevice?.label || "Válassz eszközt"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-white/40 transition-transform ${showDeviceDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showDeviceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#252a32] rounded-2xl border border-white/5 overflow-hidden z-10">
                  {DEVICE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setDevice(option.id)
                        setShowDeviceDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-[#333842] ${
                        device === option.id ? "text-[#D2F159]" : "text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              Probléma részletezése
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Írd le részletesen, hogy mi történt és hogyan lehet reprodukálni a hibát..."
              rows={5}
              className="w-full bg-[#252a32] rounded-2xl border border-white/5 px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#171725] p-6 border-t border-white/5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-full bg-[#252a32] text-white font-semibold"
          >
            Mégse
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-4 rounded-full bg-[#D2F159] text-[#171725] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              "Küldés..."
            ) : (
              <>
                <Send className="w-5 h-5" />
                Elküldés
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
