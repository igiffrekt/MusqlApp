"use client"

import { use } from "react"
import { MobileSessionDetail } from "@/components/mobile/MobileSessionDetail"

interface Props {
  params: Promise<{ id: string }>
}

export default function SessionDetailPage({ params }: Props) {
  const { id } = use(params)

  return <MobileSessionDetail sessionId={id} />
}
