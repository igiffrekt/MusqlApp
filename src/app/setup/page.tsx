"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { MobileOnboardingLocation } from "@/components/mobile/MobileOnboardingLocation"
import { MobileOnboardingSession } from "@/components/mobile/MobileOnboardingSession"
import { useNotificationsStore } from "@/lib/stores/notifications-store"
import { useMembersStore } from "@/lib/stores/members-store"

type Step = "location" | "session"

const SETUP_STORAGE_KEY = "musql_setup_progress"

interface SetupProgress {
  step: Step
  locationId: string | null
  locationName: string
  completedAt?: number
}

function getStoredProgress(): SetupProgress | null {
  if (typeof window === "undefined") return null
  try {
    const stored = sessionStorage.getItem(SETUP_STORAGE_KEY)
    if (stored) {
      const progress = JSON.parse(stored) as SetupProgress
      // If setup was completed, return null to trigger fresh check
      if (progress.completedAt) return null
      return progress
    }
  } catch (e) {
    console.error("Failed to read setup progress:", e)
  }
  return null
}

function saveProgress(progress: SetupProgress) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(progress))
  } catch (e) {
    console.error("Failed to save setup progress:", e)
  }
}

function clearProgress() {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(SETUP_STORAGE_KEY)
  } catch (e) {
    console.error("Failed to clear setup progress:", e)
  }
}

function markSetupComplete() {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify({ completedAt: Date.now() }))
  } catch (e) {
    console.error("Failed to mark setup complete:", e)
  }
}

export default function SetupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState<Step>("location")
  const [locationId, setLocationId] = useState<string | null>(null)
  const [locationName, setLocationName] = useState<string>("")
  const [checking, setChecking] = useState(true)

  // Get store reset functions
  const resetNotifications = useNotificationsStore((state) => state.reset)
  const resetMembers = useMembersStore((state) => state.reset)

  // Reset stores on mount to clear any stale data from previous users
  useEffect(() => {
    resetNotifications()
    resetMembers()
  }, [resetNotifications, resetMembers])

  // Restore progress from session storage on mount
  useEffect(() => {
    const stored = getStoredProgress()
    if (stored) {
      setStep(stored.step)
      setLocationId(stored.locationId)
      setLocationName(stored.locationName)
    }
  }, [])

  // Check if user already has locations AND setup was completed
  useEffect(() => {
    const checkExistingLocations = async () => {
      try {
        // Check if there's in-progress setup
        const storedProgress = getStoredProgress()
        if (storedProgress && storedProgress.step === "session" && storedProgress.locationId) {
          // User is in the middle of setup, restore and continue
          setStep(storedProgress.step)
          setLocationId(storedProgress.locationId)
          setLocationName(storedProgress.locationName)
          setChecking(false)
          return
        }

        const response = await fetch("/api/locations")
        if (response.ok) {
          const data = await response.json()
          if (data.locations && data.locations.length > 0) {
            // Check if user has at least one session (setup complete)
            const sessionsResponse = await fetch("/api/sessions")
            if (sessionsResponse.ok) {
              const sessionsData = await sessionsResponse.json()
              if (sessionsData.sessions && sessionsData.sessions.length > 0) {
                // User has locations AND sessions, setup is complete
                markSetupComplete()
                router.replace("/")
                return
              }
            }
            // User has locations but no sessions - continue to session step
            const firstLocation = data.locations[0]
            setLocationId(firstLocation.id)
            setLocationName(firstLocation.name)
            setStep("session")
            saveProgress({
              step: "session",
              locationId: firstLocation.id,
              locationName: firstLocation.name,
            })
          }
        }
      } catch (err) {
        console.error("Failed to check locations:", err)
      }
      setChecking(false)
    }

    if (status === "authenticated") {
      checkExistingLocations()
    } else if (status === "unauthenticated") {
      router.replace("/auth/signin")
    }
  }, [status, router])

  const handleLocationNext = (newLocationId: string, newLocationName: string) => {
    setLocationId(newLocationId)
    setLocationName(newLocationName)
    setStep("session")
    // Save progress to session storage
    saveProgress({
      step: "session",
      locationId: newLocationId,
      locationName: newLocationName,
    })
  }

  const handleBack = () => {
    setStep("location")
    // Clear progress when going back to start
    clearProgress()
  }

  // Show loading while checking auth and existing data
  if (status === "loading" || checking) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  // Show loading if not authenticated (will redirect)
  if (!session) {
    return (
      <div className="min-h-screen bg-[#171725] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D2F159] animate-spin" />
      </div>
    )
  }

  return (
    <>
      {step === "location" && (
        <MobileOnboardingLocation onNext={handleLocationNext} />
      )}
      {step === "session" && locationId && (
        <MobileOnboardingSession
          locationId={locationId}
          locationName={locationName}
          onBack={handleBack}
        />
      )}
    </>
  )
}
