"use client"

import { useState, useEffect } from "react"
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, CreditCard, AlertCircle } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripePaymentFormProps {
  paymentId: string
  amount: number
  onSuccess: () => void
  onCancel: () => void
}

function PaymentForm({ paymentId, amount, onSuccess, onCancel }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payments?success=true`,
      },
    })

    if (error) {
      setMessage(error.message || "An error occurred during payment.")
      setIsLoading(false)
    } else {
      setIsSuccess(true)
      setMessage("Payment successful!")
      setTimeout(() => {
        onSuccess()
      }, 2000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {message && (
        <Alert className={isSuccess ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {isSuccess ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={isSuccess ? "text-green-800" : "text-red-800"}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1"
        >
          {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )
}

interface StripePaymentWrapperProps {
  paymentId: string
  amount: number
  onSuccess: () => void
  onCancel: () => void
}

export function StripePaymentForm({
  paymentId,
  amount,
  onSuccess,
  onCancel
}: StripePaymentWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createPaymentIntent()
  }, [paymentId, amount])

  const createPaymentIntent = async () => {
    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          amount,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setClientSecret(data.clientSecret)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to initialize payment")
      }
    } catch (err) {
      setError("Failed to initialize payment")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">Initializing payment...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onCancel}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Unable to initialize payment form
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onCancel}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Complete Payment
        </CardTitle>
        <CardDescription>
          Pay ${amount.toFixed(2)} securely using Stripe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            paymentId={paymentId}
            amount={amount}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </CardContent>
    </Card>
  )
}