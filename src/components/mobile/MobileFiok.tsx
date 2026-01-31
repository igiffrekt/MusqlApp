"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Lock, CreditCard, Check, X, Phone, Send, CheckCircle, Building2, Copy, Hash } from "lucide-react"
import { toast } from "sonner"

interface SubscriptionTier {
  id: string
  name: string
  price: string
  priceNote?: string
  priceValue?: number // numeric value for comparison
  features: string[]
  recommended?: boolean
  isCustomPricing?: boolean
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "kezdo",
    name: "Kezdő",
    price: "14.900",
    priceNote: "Ft/hó + áfa",
    priceValue: 14900,
    features: [
      "1 admin",
      "1 csoport",
      "Maximum 10 tag",
      "Alapvető funkciók",
    ],
  },
  {
    id: "profi",
    name: "Profi",
    price: "34.900",
    priceNote: "Ft/hó + áfa",
    priceValue: 34900,
    features: [
      "1 fő admin + 5 további admin",
      "5 csoport",
      "Maximum 15 tag/csoport",
      "Online fizetés a tagoknak",
      "Alapvető pénzügyi rész",
      "Alapvető riportok",
    ],
    recommended: true,
  },
  {
    id: "elite",
    name: "Elite+",
    price: "Egyedi",
    priceNote: "árszabás",
    priceValue: 999999, // High value for comparison
    isCustomPricing: true,
    features: [
      "Korlátlan admin",
      "Korlátlan csoport",
      "Korlátlan tag",
      "Fejlett pénzügyi modul",
      "Fejlett riportok",
      "Prioritás támogatás",
      "API hozzáférés",
    ],
  },
]

export function MobileFiok() {
  const { data: session } = useSession()
  const router = useRouter()

  const [email, setEmail] = useState(session?.user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [currentPlan, setCurrentPlan] = useState("profi")

  // New modals state
  const [showEliteInquiryModal, setShowEliteInquiryModal] = useState(false)
  const [showEliteSuccessModal, setShowEliteSuccessModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedTierForPayment, setSelectedTierForPayment] = useState<SubscriptionTier | null>(null)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Bank account state
  const [bankAccountName, setBankAccountName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [bankName, setBankName] = useState("")
  const [isSavingBank, setIsSavingBank] = useState(false)

  // Organization code state
  const [orgCode, setOrgCode] = useState("")
  const [codeCopied, setCodeCopied] = useState(false)

  const isTrainerOrAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "TRAINER"

  // Fetch bank account info on mount
  useEffect(() => {
    if (isTrainerOrAdmin) {
      fetchBankAccount()
    }
  }, [isTrainerOrAdmin])

  const fetchBankAccount = async () => {
    try {
      const res = await fetch("/api/admin/settings")
      if (res.ok) {
        const data = await res.json()
        setBankAccountName(data.settings?.bankAccountName || "")
        setBankAccountNumber(data.settings?.bankAccountNumber || "")
        setBankName(data.settings?.bankName || "")
        setOrgCode(data.settings?.slug || "")
      }
    } catch (error) {
      console.error("Failed to fetch bank account:", error)
    }
  }

  const copyOrgCode = async () => {
    if (orgCode) {
      await navigator.clipboard.writeText(orgCode)
      setCodeCopied(true)
      toast.success("Kód másolva!")
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  const handleSaveBankAccount = async () => {
    setIsSavingBank(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankAccountName,
          bankAccountNumber,
          bankName,
        }),
      })

      if (res.ok) {
        toast.success("Bankszámla adatok mentve!")
      } else {
        toast.error("Hiba történt a mentés során")
      }
    } catch (error) {
      console.error("Failed to save bank account:", error)
      toast.error("Hiba történt a mentés során")
    } finally {
      setIsSavingBank(false)
    }
  }

  const handleChangeEmail = async () => {
    setIsChangingEmail(true)
    try {
      const response = await fetch("/api/user/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast.success("Email cím sikeresen módosítva!")
      } else {
        toast.error("Hiba történt az email módosítása során")
      }
    } catch (error) {
      console.error("Failed to change email:", error)
      toast.error("Hiba történt az email módosítása során")
    } finally {
      setIsChangingEmail(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("A jelszavak nem egyeznek!")
      return
    }

    if (newPassword.length < 8) {
      toast.error("A jelszónak legalább 8 karakter hosszúnak kell lennie!")
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (response.ok) {
        toast.success("Jelszó sikeresen módosítva!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const data = await response.json()
        toast.error(data.message || "Hiba történt a jelszó módosítása során")
      }
    } catch (error) {
      console.error("Failed to change password:", error)
      toast.error("Hiba történt a jelszó módosítása során")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSelectPlan = (tierId: string) => {
    const selectedTier = SUBSCRIPTION_TIERS.find(t => t.id === tierId)
    const currentTierData = SUBSCRIPTION_TIERS.find(t => t.id === currentPlan)

    if (!selectedTier || !currentTierData) return

    // If Elite+ is selected, show inquiry modal
    if (selectedTier.isCustomPricing) {
      setShowSubscriptionModal(false)
      setShowEliteInquiryModal(true)
      return
    }

    // Check if upgrading or downgrading
    const isUpgrade = (selectedTier.priceValue || 0) > (currentTierData.priceValue || 0)

    if (isUpgrade) {
      // Show payment modal for upgrade
      setSelectedTierForPayment(selectedTier)
      setShowSubscriptionModal(false)
      setShowPaymentModal(true)
    } else {
      // Downgrade - no payment needed, just change the plan
      setCurrentPlan(tierId)
      setShowSubscriptionModal(false)
      toast.success(`Sikeresen váltottál a ${selectedTier.name} csomagra!`)
    }
  }

  const handlePaymentSuccess = () => {
    if (selectedTierForPayment) {
      setCurrentPlan(selectedTierForPayment.id)
      toast.success(`Sikeresen előfizettél a ${selectedTierForPayment.name} csomagra!`)
    }
    setShowPaymentModal(false)
    setSelectedTierForPayment(null)
  }

  const handleEliteInquirySuccess = () => {
    setShowEliteInquiryModal(false)
    setShowEliteSuccessModal(true)
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Fiók sikeresen törölve")
        // Sign out and redirect to splash/onboarding
        window.location.href = "/api/auth/signout?callbackUrl=/onboarding"
      } else {
        const data = await response.json()
        toast.error(data.message || "Hiba történt a fiók törlése során")
      }
    } catch (error) {
      console.error("Failed to delete account:", error)
      toast.error("Hiba történt a fiók törlése során")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirmModal(false)
    }
  }

  const currentTier = SUBSCRIPTION_TIERS.find(t => t.id === currentPlan)

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
          <h1 className="text-white text-xl font-semibold">Fiók</h1>
        </div>
      </header>

      <div className="px-6 pb-8 space-y-6">
        {/* Email Section */}
        <section className="bg-[#252a32] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#333842] flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#D2F159]" />
            </div>
            <h2 className="text-white font-semibold">Email cím</h2>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pelda@email.hu"
              className="w-full bg-[#333842] rounded-xl border border-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
            />
            <button
              onClick={handleChangeEmail}
              disabled={isChangingEmail || email === session?.user?.email}
              className="w-full py-3 rounded-xl bg-[#333842] text-white font-medium disabled:opacity-50"
            >
              {isChangingEmail ? "Mentés..." : "Email módosítása"}
            </button>
          </div>
        </section>

        {/* Organization Code Section - Only for Trainers/Admins */}
        {isTrainerOrAdmin && orgCode && (
          <section className="bg-[#252a32] rounded-2xl p-5 border border-[#D2F159]/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#D2F159]/20 flex items-center justify-center">
                <Hash className="w-5 h-5 text-[#D2F159]" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Szervezeti kód</h2>
                <p className="text-white/40 text-xs">Ezzel csatlakozhatnak a tanulók</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#171725] rounded-xl px-4 py-3 font-mono text-[#D2F159] text-xl font-bold tracking-wider text-center">
                {orgCode}
              </div>
              <button
                onClick={copyOrgCode}
                className="w-12 h-12 rounded-xl bg-[#D2F159] flex items-center justify-center flex-shrink-0"
              >
                {codeCopied ? (
                  <Check className="w-5 h-5 text-[#171725]" />
                ) : (
                  <Copy className="w-5 h-5 text-[#171725]" />
                )}
              </button>
            </div>
            <p className="text-white/40 text-xs mt-3 text-center">
              Oszd meg ezt a kódot a tanulóiddal, hogy csatlakozhassanak hozzád
            </p>
          </section>
        )}

        {/* Password Section */}
        <section className="bg-[#252a32] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#333842] flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#D2F159]" />
            </div>
            <h2 className="text-white font-semibold">Jelszó módosítása</h2>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Jelenlegi jelszó"
              className="w-full bg-[#333842] rounded-xl border border-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Új jelszó"
              className="w-full bg-[#333842] rounded-xl border border-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Új jelszó megerősítése"
              className="w-full bg-[#333842] rounded-xl border border-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
            />
            <button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full py-3 rounded-xl bg-[#333842] text-white font-medium disabled:opacity-50"
            >
              {isChangingPassword ? "Mentés..." : "Jelszó módosítása"}
            </button>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="bg-[#252a32] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#333842] flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#D2F159]" />
            </div>
            <h2 className="text-white font-semibold">Előfizetés</h2>
          </div>

          {/* Current Plan Display */}
          <div className="bg-[#333842] rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Jelenlegi csomag</span>
              <span className="bg-[#D2F159] text-[#171725] text-xs font-semibold px-2 py-1 rounded-full">
                Aktív
              </span>
            </div>
            <p className="text-white text-lg font-semibold">{currentTier?.name}</p>
            {currentTier?.isCustomPricing ? (
              <p className="text-[#D2F159] text-xl font-bold">Egyedi árszabás</p>
            ) : (
              <p className="text-[#D2F159] text-2xl font-bold">
                {currentTier?.price} <span className="text-base font-normal text-white/40">{currentTier?.priceNote}</span>
              </p>
            )}
          </div>

          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="w-full py-3 rounded-xl bg-[#D2F159] text-[#171725] font-semibold"
          >
            Előfizetés módosítása
          </button>
        </section>

        {/* Bank Account Section - Only for Trainers/Admins */}
        {isTrainerOrAdmin && (
          <section className="bg-[#252a32] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#333842] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#D2F159]" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Bankszámla</h2>
                <p className="text-white/40 text-xs">Ide érkeznek a tagdíjak</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-white/60 text-xs mb-1 block">Számlatulajdonos neve</label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="Példa Péter"
                  className="w-full bg-[#333842] rounded-xl border border-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Bankszámlaszám</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="12345678-12345678-12345678"
                  className="w-full bg-[#333842] rounded-xl border border-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Bank neve (opcionális)</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="OTP Bank"
                  className="w-full bg-[#333842] rounded-xl border border-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
                />
              </div>
              <button
                onClick={handleSaveBankAccount}
                disabled={isSavingBank || !bankAccountName || !bankAccountNumber}
                className="w-full py-3 rounded-xl bg-[#D2F159] text-[#171725] font-semibold disabled:opacity-50"
              >
                {isSavingBank ? "Mentés..." : "Bankszámla mentése"}
              </button>
            </div>
          </section>
        )}

        {/* Danger Zone */}
        <section className="bg-[#252a32] rounded-2xl p-5 border border-red-500/20">
          <h2 className="text-red-400 font-semibold mb-4">Veszélyes műveletek</h2>
          <button
            onClick={() => setShowDeleteConfirmModal(true)}
            className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-medium border border-red-500/30"
          >
            Fiók törlése
          </button>
        </section>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          tiers={SUBSCRIPTION_TIERS}
          currentPlan={currentPlan}
          onSelect={handleSelectPlan}
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}

      {/* Elite+ Inquiry Modal */}
      {showEliteInquiryModal && (
        <EliteInquiryModal
          onClose={() => setShowEliteInquiryModal(false)}
          onSuccess={handleEliteInquirySuccess}
        />
      )}

      {/* Elite+ Success Modal */}
      {showEliteSuccessModal && (
        <EliteSuccessModal
          onClose={() => setShowEliteSuccessModal(false)}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedTierForPayment && (
        <PaymentModal
          tier={selectedTierForPayment}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedTierForPayment(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmModal && (
        <DeleteConfirmModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirmModal(false)}
          isDeleting={isDeleting}
        />
      )}

    </div>
  )
}

interface SubscriptionModalProps {
  tiers: SubscriptionTier[]
  currentPlan: string
  onSelect: (tierId: string) => void
  onClose: () => void
}

function SubscriptionModal({ tiers, currentPlan, onSelect, onClose }: SubscriptionModalProps) {
  const currentTierData = tiers.find(t => t.id === currentPlan)

  const getButtonText = (tier: SubscriptionTier) => {
    if (currentPlan === tier.id) return "Jelenlegi csomag"
    if (tier.isCustomPricing) return "Érdeklődés"

    const isUpgrade = (tier.priceValue || 0) > (currentTierData?.priceValue || 0)
    return isUpgrade ? "Előfizetés" : "Váltás"
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
            <h2 className="text-white text-xl font-semibold">Válassz csomagot</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32]"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="p-6 space-y-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-5 border ${
                tier.recommended
                  ? "bg-[#D2F159]/10 border-[#D2F159]"
                  : "bg-[#252a32] border-white/5"
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D2F159] text-[#171725] text-xs font-semibold px-3 py-1 rounded-full">
                  Ajánlott
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white text-lg font-semibold">{tier.name}</h3>
                  {tier.isCustomPricing ? (
                    <div>
                      <p className="text-[#D2F159] text-2xl font-bold">{tier.price}</p>
                      <p className="text-white/40 text-sm">{tier.priceNote}</p>
                    </div>
                  ) : (
                    <p className="text-[#D2F159] text-3xl font-bold">
                      {tier.price} <span className="text-base font-normal text-white/40">{tier.priceNote}</span>
                    </p>
                  )}
                </div>
                {currentPlan === tier.id && (
                  <span className="bg-[#22c55e]/20 text-[#22c55e] text-xs font-semibold px-2 py-1 rounded-full border border-[#22c55e]">
                    Jelenlegi
                  </span>
                )}
              </div>

              <ul className="space-y-2 mb-4">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-white/60 text-sm">
                    <Check className="w-4 h-4 text-[#D2F159]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelect(tier.id)}
                disabled={currentPlan === tier.id}
                className={`w-full py-3 rounded-xl font-semibold ${
                  currentPlan === tier.id
                    ? "bg-[#333842] text-white/40"
                    : tier.recommended
                    ? "bg-[#D2F159] text-[#171725]"
                    : "bg-[#333842] text-white"
                }`}
              >
                {getButtonText(tier)}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface EliteInquiryModalProps {
  onClose: () => void
  onSuccess: () => void
}

function EliteInquiryModal({ onClose, onSuccess }: EliteInquiryModalProps) {
  const [phone, setPhone] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!phone.trim()) {
      toast.error("Kérlek add meg a telefonszámodat!")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "stickerey@gmail.com",
          subject: "Elite+ érdeklődés",
          message: `Új Elite+ érdeklődés érkezett!\n\nTelefonszám: ${phone}\n\nLeírás:\n${description || "Nem adott meg leírást."}`,
          memberName: "Elite+ Érdeklődő",
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        toast.error("Hiba történt az üzenet küldése során")
      }
    } catch (error) {
      console.error("Failed to send inquiry:", error)
      toast.error("Hiba történt az üzenet küldése során")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#252a32] rounded-[24px] w-full max-w-sm animate-slide-in-bottom">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">Elite+ érdeklődés</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#333842]"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <p className="text-white/60 text-sm">
            Kérjük írja le, mire használná a rendszert és adja meg telefonszámát. Munkatársunk keresni fogja.
          </p>

          {/* Phone */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Telefonszám *</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+36 XX XXX XXXX"
                className="w-full bg-[#333842] rounded-xl border border-white/5 pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Leírás</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mire használná a rendszert?"
              rows={4}
              className="w-full bg-[#333842] rounded-xl border border-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D2F159] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#333842] text-white font-semibold"
          >
            Mégse
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !phone.trim()}
            className="flex-1 py-3 rounded-xl bg-[#D2F159] text-[#171725] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              "Küldés..."
            ) : (
              <>
                <Send className="w-5 h-5" />
                Küldés
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

interface EliteSuccessModalProps {
  onClose: () => void
}

function EliteSuccessModal({ onClose }: EliteSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#252a32] rounded-[24px] w-full max-w-sm p-6 animate-slide-in-bottom">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[#D2F159]" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-6">
          <h2 className="text-white text-xl font-semibold mb-4">Köszönjük!</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Köszönjük, hogy szolgáltatásunk felől érdeklődött. Munkatársunk a lehető legrövidebb időn belül keresni fogja a megadott elérhetőségen.
          </p>
          <p className="text-white/40 text-sm mt-4">
            Üdvözlettel,<br />
            a Musql.app csapata
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-full bg-[#D2F159] text-[#171725] font-semibold"
        >
          Bezárás
        </button>
      </div>
    </div>
  )
}

interface PaymentModalProps {
  tier: SubscriptionTier
  onClose: () => void
  onSuccess: () => void
}

function PaymentModal({ tier, onClose, onSuccess }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error("Kérlek válassz fizetési módot!")
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onSuccess()
    }, 2000)
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
            <h2 className="text-white text-xl font-semibold">Fizetés</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32]"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-[#252a32] rounded-2xl p-4 mb-6">
            <h3 className="text-white/60 text-sm mb-2">Előfizetés</h3>
            <div className="flex items-center justify-between">
              <span className="text-white text-lg font-semibold">{tier.name} csomag</span>
              <span className="text-[#D2F159] text-xl font-bold">
                {tier.price} {tier.priceNote}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <h3 className="text-white font-semibold mb-4">Fizetési mód</h3>
          <div className="space-y-3 mb-6">
            {/* Card Payment */}
            <button
              onClick={() => setSelectedMethod("card")}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                selectedMethod === "card"
                  ? "bg-[#D2F159]/10 border-[#D2F159]"
                  : "bg-[#252a32] border-white/5"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#333842] flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#D2F159]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">Bankkártya</p>
                <p className="text-white/40 text-sm">Visa, Mastercard</p>
              </div>
              {selectedMethod === "card" && (
                <Check className="w-5 h-5 text-[#D2F159]" />
              )}
            </button>

            {/* SimplePay */}
            <button
              onClick={() => setSelectedMethod("simplepay")}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                selectedMethod === "simplepay"
                  ? "bg-[#D2F159]/10 border-[#D2F159]"
                  : "bg-[#252a32] border-white/5"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#e53935] flex items-center justify-center">
                <span className="text-white font-bold text-xs">SP</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">SimplePay</p>
                <p className="text-white/40 text-sm">OTP SimplePay</p>
              </div>
              {selectedMethod === "simplepay" && (
                <Check className="w-5 h-5 text-[#D2F159]" />
              )}
            </button>

            {/* Bank Transfer */}
            <button
              onClick={() => setSelectedMethod("transfer")}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                selectedMethod === "transfer"
                  ? "bg-[#D2F159]/10 border-[#D2F159]"
                  : "bg-[#252a32] border-white/5"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#333842] flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#D2F159]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">Átutalás</p>
                <p className="text-white/40 text-sm">Banki átutalás</p>
              </div>
              {selectedMethod === "transfer" && (
                <Check className="w-5 h-5 text-[#D2F159]" />
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#171725] p-6 border-t border-white/5">
          <button
            onClick={handlePayment}
            disabled={isProcessing || !selectedMethod}
            className="w-full py-4 rounded-full bg-[#D2F159] text-[#171725] font-semibold disabled:opacity-50"
          >
            {isProcessing ? "Feldolgozás..." : `Fizetés: ${tier.price} ${tier.priceNote}`}
          </button>
        </div>
      </div>
    </div>
  )
}

interface DeleteConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

function DeleteConfirmModal({ onConfirm, onCancel, isDeleting }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-[#252a32] rounded-[24px] w-full max-w-sm p-6 animate-slide-in-bottom">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <X className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center mb-6">
          <h2 className="text-white text-xl font-semibold mb-4">Fiók törlése</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Ez a művelet visszavonhatatlanul törli a fiókot és minden hozzá tartozó adatot. Biztosan folytatja?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-4 rounded-full bg-[#333842] text-white font-semibold disabled:opacity-50"
          >
            Nem
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-4 rounded-full bg-red-500 text-white font-semibold disabled:opacity-50"
          >
            {isDeleting ? "Törlés..." : "Igen"}
          </button>
        </div>
      </div>
    </div>
  )
}
