"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { hu } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  UserPlus,
  Check,
  X,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  RefreshCw,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface JoinRequest {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  organization: {
    name: string
  }
}

export default function JoinRequestsPage() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending">("pending")

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/join-requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessing(id)
    try {
      const response = await fetch(`/api/join-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        // Refresh the list
        await fetchRequests()
      } else {
        const data = await response.json()
        alert(data.message || "Hiba tortent")
      }
    } catch (error) {
      console.error("Error processing request:", error)
      alert("Hiba tortent")
    } finally {
      setProcessing(null)
    }
  }

  const filteredRequests = filter === "pending"
    ? requests.filter(r => r.status === "PENDING")
    : requests

  const pendingCount = requests.filter(r => r.status === "PENDING").length

  const getStatusBadge = (status: JoinRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30">Fuggoven</Badge>
      case "APPROVED":
        return <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30">Jovahagyva</Badge>
      case "REJECTED":
        return <Badge className="bg-red-500/20 text-red-600 hover:bg-red-500/30">Elutasitva</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Csatlakozasi kerelmek</h1>
            <p className="text-gray-600">Tagok jovahagyasa a szervezethez</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            className="rounded-full"
          >
            Fuggoven ({pendingCount})
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="rounded-full"
          >
            Osszes
          </Button>
          <Button
            variant="outline"
            onClick={fetchRequests}
            className="rounded-full"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {filter === "pending" ? "Nincsenek fuggoven kerelmed" : "Nincsenek kerelmek"}
            </h3>
            <p className="text-gray-500">
              {filter === "pending"
                ? "Minden kerelem feldolgozasra kerult."
                : "Meg senki nem kert csatlakozast."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.name}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{request.email}</span>
                      </div>
                      {request.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{request.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(new Date(request.createdAt), "yyyy. MMMM d. HH:mm", { locale: hu })}
                        </span>
                      </div>
                      {request.message && (
                        <div className="flex items-start space-x-2 mt-3 p-3 bg-gray-50 rounded-lg">
                          <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="italic">&quot;{request.message}&quot;</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.status === "PENDING" && (
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleAction(request.id, "approve")}
                        disabled={processing === request.id}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full"
                      >
                        {processing === request.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Jovahagyas
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(request.id, "reject")}
                        disabled={processing === request.id}
                        className="text-red-600 border-red-200 hover:bg-red-50 rounded-full"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Elutasitas
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
