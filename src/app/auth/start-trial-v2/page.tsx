"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { motion } from "framer-motion"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Loader2, Check, Shield, CreditCard } from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function TrialForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Trigger form validation and collect payment method
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      // Confirm the SetupIntent
      const { setupIntent, error: confirmError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/auth/start-trial/callback`,
        },
        redirect: "if_required",
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (!setupIntent || !setupIntent.payment_method) {
        throw new Error("Failed to save payment method")
      }

      // Start the trial with the saved payment method
      const response = await fetch("/api/stripe/start-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethodId: setupIntent.payment_method,
          currency: "HUF",
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to start trial")
      }

      // Success! Redirect to setup
      router.push("/setup")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element - includes Card, Google Pay, Apple Pay automatically */}
      <div className="bg-[#252a32] rounded-xl p-4 border border-white/10">
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: "tabs",
            wallets: {
              applePay: "auto",
              googlePay: "auto",
            },
            defaultValues: {
              billingDetails: {
                address: {
                  country: "HU",
                },
              },
            },
            business: {
              name: "Musql",
            },
          }}
        />
      </div>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 text-white/40 text-xs">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4" />
          <span>256-bit SSL</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <CreditCard className="w-4 h-4" />
          <span>Stripe által védett</span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl px-4 py-3 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading || !stripe || !ready}
        className="w-full bg-gradient-to-r from-[#D2F159] to-[#c4e350] text-[#171725] rounded-xl py-4 font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#D2F159]/20"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Feldolgozás...
          </>
        ) : (
          <>
            Próbaidőszak indítása
            <Check className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Disclaimer */}
      <p className="text-white/30 text-xs text-center leading-relaxed">
        *A 15 nap lejárta után a kártyádat az <b>alapcsomag havidíjával<br/> (9 900 Ft) terheljük meg</b>. Bármikor lemondhatod.
      </p>
    </form>
  )
}

function TrialFormWrapper() {
  const { status } = useSession()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== "authenticated") return

    const fetchSetupIntent = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/stripe/create-setup-intent", {
          method: "POST",
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || "Failed to initialize payment")
        }
        setClientSecret(data.clientSecret)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize")
      } finally {
        setLoading(false)
      }
    }

    fetchSetupIntent()
  }, [status])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin mb-4" />
        <p className="text-white/60 text-sm">Fizetési rendszer inicializálása...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl px-4 py-3 text-sm">
        {error}
      </div>
    )
  }

  if (!clientSecret) {
    return null
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#D2F159",
            colorBackground: "#252a32",
            colorText: "#ffffff",
            colorDanger: "#ef4444",
            fontFamily: "system-ui, -apple-system, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              backgroundColor: "#252a32",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "none",
            },
            ".Input:focus": {
              border: "1px solid rgba(210, 241, 89, 0.5)",
              boxShadow: "0 0 0 2px rgba(210, 241, 89, 0.2)",
            },
            ".Tab": {
              backgroundColor: "#252a32",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
            ".Tab--selected": {
              backgroundColor: "#1E1E2D",
              border: "1px solid rgba(210, 241, 89, 0.5)",
            },
            ".Label": {
              color: "rgba(255, 255, 255, 0.6)",
            },
          },
        },
        loader: "auto",
      }}
    >
      <TrialForm />
    </Elements>
  )
}

export default function StartTrialPageV2() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#171725" }}
      >
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#171725" }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, #D2F159 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 lg:w-[500px] lg:h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #FF6F61 0%, transparent 70%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Logo */}
      <motion.div
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Image
          src="/img/musql_logo.png"
          alt="Musql"
          width={150}
          height={40}
          className="h-8 lg:h-10 w-auto"
        />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-20 lg:pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#1E1E2D]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D2F159] to-[#D2F159]/70 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D2F159]/20"
              >
                <Check className="w-10 h-10 text-[#171725]" />
              </motion.div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                Készen is vagy!
              </h1>
              <p className="text-xl text-[#D2F159] font-medium mb-4">
                Nyomj a gombra és kezdd meg<br/>a 15 napos próbaidőszakodat.
              </p>

              {/* Subtitle */}
              <p className="text-white/60 text-sm leading-relaxed">
                A kártyaadatok megadása csak biztonsági okokból kötelező, a számládat nem terheljük meg.<br/> A 15 napos próbaidőszak teljesen ingyenes*.
              </p>
            </div>

            {/* Stripe Payment Element Form */}
            <TrialFormWrapper />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
