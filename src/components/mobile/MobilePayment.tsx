"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Shield, Calendar, CreditCard, Clock, CalendarDays, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

type PaymentMethod = "apple_pay" | "google_pay" | "simplepay" | null
type FeeType = "daily" | "monthly" | null
type Step = "fee_type" | "payment_method"

interface GroupPricing {
  groupId: string
  groupName: string
  dailyFee: number
  monthlyFee: number
  currency: string
}

interface Props {
  groupPricing?: GroupPricing
}

// Default pricing for demo - in production would come from API based on user's group
const defaultGroupPricing: GroupPricing = {
  groupId: "felnott-hobbi-csoport",
  groupName: "Felnőtt hobbi csoport",
  dailyFee: 2500,
  monthlyFee: 15000,
  currency: "HUF",
}

export function MobilePayment({ groupPricing = defaultGroupPricing }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("fee_type")
  const [selectedFeeType, setSelectedFeeType] = useState<FeeType>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null)
  const [processing, setProcessing] = useState(false)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getSelectedAmount = () => {
    if (selectedFeeType === "daily") return groupPricing.dailyFee
    if (selectedFeeType === "monthly") return groupPricing.monthlyFee
    return 0
  }

  const handleFeeTypeSelect = (type: FeeType) => {
    setSelectedFeeType(type)
  }

  const handleContinueToPayment = () => {
    if (selectedFeeType) {
      setStep("payment_method")
    }
  }

  const handleBack = () => {
    if (step === "payment_method") {
      setStep("fee_type")
      setSelectedMethod(null)
    } else {
      router.back()
    }
  }

  const handlePayment = async () => {
    if (!selectedMethod || !selectedFeeType) return

    setProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In production, this would:
    // - For Apple Pay: Use Apple Pay JS API
    // - For Google Pay: Use Google Pay API
    // - For SimplePay: Redirect to SimplePay gateway

    setProcessing(false)
    router.push("/fizetes/sikeres")
  }

  const feeTypes = [
    {
      id: "daily" as const,
      name: "Napidíj",
      description: "Egyszeri alkalomra",
      amount: groupPricing.dailyFee,
      icon: Clock,
    },
    {
      id: "monthly" as const,
      name: "Havi bérlet",
      description: "Hónap végéig szól",
      amount: groupPricing.monthlyFee,
      icon: CalendarDays,
    },
  ]

  const paymentMethods = [
    {
      id: "apple_pay" as const,
      name: "Apple Pay",
      description: "Gyors és biztonságos",
      logo: "/icons/payment/apple-pay.svg",
      available: true,
    },
    {
      id: "google_pay" as const,
      name: "Google Pay",
      description: "Egyszerű fizetés",
      logo: "/icons/payment/google-pay.svg",
      available: true,
    },
    {
      id: "simplepay" as const,
      name: "SimplePay",
      description: "OTP bankkártyás fizetés",
      logo: "/icons/payment/simplepay.svg",
      available: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#171725] pb-32 font-lufga">
      {/* Header */}
      <div className="px-6 pt-14">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#252a32] border border-white/5"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-semibold">
            {step === "fee_type" ? "Fizetés" : "Fizetési mód"}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Step 1: Fee Type Selection */}
      {step === "fee_type" && (
        <>
          {/* Group Info */}
          <div className="px-6 mb-6">
            <div className="bg-[#252a32] rounded-[20px] p-4 border border-white/5">
              <p className="text-white/40 text-sm mb-1">Csoport</p>
              <p className="text-white font-medium">{groupPricing.groupName}</p>
            </div>
          </div>

          {/* Fee Type Options */}
          <div className="px-6 mb-6">
            <h2 className="text-white text-lg font-semibold mb-4">Alkalmi edzés vagy bérletvásárlás</h2>

            <div className="space-y-3">
              {feeTypes.map((fee) => (
                <button
                  key={fee.id}
                  onClick={() => handleFeeTypeSelect(fee.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-5 rounded-[20px] transition-all duration-200",
                    selectedFeeType === fee.id
                      ? "bg-[#D2F159]/10 border-2 border-[#D2F159]"
                      : "bg-[#252a32] border border-white/5 hover:border-white/10"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center",
                      selectedFeeType === fee.id ? "bg-[#D2F159]" : "bg-[#333842]"
                    )}
                  >
                    <fee.icon
                      className={cn(
                        "w-7 h-7",
                        selectedFeeType === fee.id ? "text-[#171725]" : "text-white"
                      )}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <p className="text-white font-semibold text-lg">{fee.name}</p>
                    <p className="text-white/40 text-sm">{fee.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className={cn(
                      "text-xl font-bold",
                      selectedFeeType === fee.id ? "text-[#D2F159]" : "text-white"
                    )}>
                      {formatCurrency(fee.amount, groupPricing.currency)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Action */}
          <div className="fixed bottom-0 left-0 right-0 bg-[#171725] border-t border-[#333842] p-4 z-40">
            <button
              onClick={handleContinueToPayment}
              disabled={!selectedFeeType}
              className={cn(
                "w-full py-4 rounded-full font-semibold text-base transition-all duration-200",
                selectedFeeType
                  ? "bg-[#D2F159] text-[#171725] active:scale-[0.98]"
                  : "bg-[#333842] text-white/40 cursor-not-allowed"
              )}
            >
              {selectedFeeType
                ? "Fizetési mód választása"
                : "Válassz egy lehetőséget"}
            </button>
          </div>
        </>
      )}

      {/* Step 2: Payment Method Selection */}
      {step === "payment_method" && (
        <>
          {/* Payment Summary Card */}
          <div className="px-6 mb-6">
            <div className="bg-gradient-to-br from-[#252a32] to-[#1e2229] rounded-[24px] p-5 border border-white/5">
              {/* Amount Header */}
              <div className="text-center mb-6">
                <p className="text-white/40 text-sm mb-1">Fizetendő összeg</p>
                <p className="text-[#D2F159] text-4xl font-bold tracking-tight">
                  {formatCurrency(getSelectedAmount(), groupPricing.currency)}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 mb-5" />

              {/* Payment Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#333842] flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-[#D2F159]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {selectedFeeType === "daily" ? "Napidíj" : "Havi bérlet"}
                    </p>
                    <p className="text-white/40 text-sm">{groupPricing.groupName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#333842] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-[#D2F159]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Érvényesség</p>
                    <p className="text-white/40 text-sm">
                      {selectedFeeType === "daily" ? "Mai nap" : "30 nap a fizetéstől"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="px-6 mb-6">
            <h2 className="text-white text-lg font-semibold mb-4">Fizetési mód</h2>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  disabled={!method.available}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-[20px] transition-all duration-200",
                    selectedMethod === method.id
                      ? "bg-[#D2F159]/10 border-2 border-[#D2F159]"
                      : "bg-[#252a32] border border-white/5 hover:border-white/10",
                    !method.available && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Logo Container */}
                  <div className="w-14 h-10 flex items-center justify-center">
                    <Image
                      src={method.logo}
                      alt={method.name}
                      width={method.id === "simplepay" ? 80 : 48}
                      height={24}
                      className={cn(
                        "object-contain",
                        method.id === "apple_pay" && "invert"
                      )}
                    />
                  </div>

                  {/* Method Info */}
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">{method.name}</p>
                    <p className="text-white/40 text-sm">{method.description}</p>
                  </div>

                  {/* Selection Indicator */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      selectedMethod === method.id
                        ? "border-[#D2F159] bg-[#D2F159]"
                        : "border-white/20"
                    )}
                  >
                    {selectedMethod === method.id && (
                      <svg
                        width="12"
                        height="10"
                        viewBox="0 0 12 10"
                        fill="none"
                        className="text-[#171725]"
                      >
                        <path
                          d="M1 5L4.5 8.5L11 1.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Security Badge */}
          <div className="px-6 mb-6">
            <div className="flex items-center justify-center gap-2 py-3">
              <Shield className="w-4 h-4 text-[#1ad598]" />
              <span className="text-white/40 text-xs">
                256-bit SSL titkosított kapcsolat
              </span>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-[#171725] border-t border-[#333842] p-4 z-40">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm">Összesen</span>
              <span className="text-white text-xl font-bold">
                {formatCurrency(getSelectedAmount(), groupPricing.currency)}
              </span>
            </div>

            <button
              onClick={handlePayment}
              disabled={!selectedMethod || processing}
              className={cn(
                "w-full py-4 rounded-full font-semibold text-base transition-all duration-200",
                selectedMethod && !processing
                  ? "bg-[#D2F159] text-[#171725] active:scale-[0.98]"
                  : "bg-[#333842] text-white/40 cursor-not-allowed"
              )}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Feldolgozás...
                </span>
              ) : selectedMethod ? (
                `Fizetés ${selectedMethod === "apple_pay" ? "Apple Pay" : selectedMethod === "google_pay" ? "Google Pay" : "SimplePay"}-jel`
              ) : (
                "Válassz fizetési módot"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
