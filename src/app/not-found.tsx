"use client"

import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#171725] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#D2F159]/20 flex items-center justify-center">
          <FileQuestion className="w-10 h-10 text-[#D2F159]" />
        </div>

        {/* 404 Number */}
        <div className="text-[#D2F159] text-7xl font-bold mb-4">
          404
        </div>

        {/* Title */}
        <h1 className="text-white text-2xl font-bold mb-2">
          Az oldal nem található
        </h1>

        {/* Description */}
        <p className="text-white/60 mb-8">
          Sajnáljuk, a keresett oldal nem létezik vagy áthelyezésre került.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-[#D2F159] hover:bg-[#c5e44d] text-[#171725] rounded-xl py-3 font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Főoldal
          </Link>
          <button
            onClick={() => typeof window !== "undefined" && window.history.back()}
            className="flex-1 flex items-center justify-center gap-2 bg-[#333842] hover:bg-[#3d424d] text-white rounded-xl py-3 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Vissza
          </button>
        </div>
      </div>
    </div>
  )
}
