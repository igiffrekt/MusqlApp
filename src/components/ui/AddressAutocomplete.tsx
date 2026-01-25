"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Loader2 } from "lucide-react"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (place: google.maps.places.PlaceResult) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

declare global {
  interface Window {
    google: typeof google
    initGooglePlaces?: () => void
  }
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Keress címet...",
  disabled = false,
  className = "",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true)
      setIsLoading(false)
      return
    }

    // Check if API key exists
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.warn("Google Maps API key not configured (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)")
      setIsLoading(false)
      return
    }

    // Load the Google Maps script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=hu`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      setIsLoaded(true)
      setIsLoading(false)
    }
    
    script.onerror = () => {
      console.error("Failed to load Google Maps script")
      setIsLoading(false)
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup script if component unmounts before load
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return

    // Initialize autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "hu" }, // Restrict to Hungary
      fields: ["formatted_address", "geometry", "name", "address_components"],
    })

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      if (place.formatted_address) {
        onChange(place.formatted_address)
        onSelect?.(place)
      }
    })

    autocompleteRef.current = autocomplete

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, onChange, onSelect])

  // If no API key, fall back to regular input
  if (!isLoading && !isLoaded) {
    return (
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159] ${className}`}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
      {isLoading && (
        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 animate-spin" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        autoComplete="off"
        className={`w-full bg-[#252a32] text-white rounded-xl pl-12 pr-4 py-4 text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D2F159] ${className}`}
      />
    </div>
  )
}
