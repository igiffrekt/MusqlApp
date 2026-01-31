"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSession } from "next-auth/react"

interface UserProfile {
  image: string | null
  name: string | null
  isLoading: boolean
}

const UserProfileContext = createContext<UserProfile>({
  image: null,
  name: null,
  isLoading: true,
})

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile>({
    image: null,
    name: null,
    isLoading: true,
  })

  useEffect(() => {
    async function fetchProfile() {
      if (status !== "authenticated") {
        setProfile({ image: null, name: null, isLoading: false })
        return
      }

      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          setProfile({
            image: data.user?.image || null,
            name: data.user?.name || session?.user?.name || null,
            isLoading: false,
          })
        } else {
          setProfile({
            image: session?.user?.image || null,
            name: session?.user?.name || null,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        setProfile({
          image: session?.user?.image || null,
          name: session?.user?.name || null,
          isLoading: false,
        })
      }
    }

    fetchProfile()
  }, [status, session?.user?.image, session?.user?.name])

  return (
    <UserProfileContext.Provider value={profile}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  return useContext(UserProfileContext)
}

// Re-fetch profile (call after saving profile)
export function useRefreshProfile() {
  const { data: session } = useSession()
  
  return async () => {
    if (!session) return null
    
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        return data.user
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error)
    }
    return null
  }
}
