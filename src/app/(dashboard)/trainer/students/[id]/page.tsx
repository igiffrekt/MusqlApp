"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Mail, Phone, Calendar, CreditCard, User } from "lucide-react"
import Link from "next/link"
import type { EmergencyContact } from "@/types"

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  dateOfBirth: string | null
  address: string | null
  emergencyContact: EmergencyContact | null
  medicalInfo: string | null
  beltLevel: string | null
  status: string
  photo: string | null
  createdAt: string
  attendances: Array<{
    id: string
    status: string
    checkInTime: string | null
    session: {
      title: string
      startTime: string
    }
  }>
  payments: Array<{
    id: string
    amount: number
    paymentType: string
    status: string
    dueDate: string
    paidDate: string | null
  }>
}

export default function StudentDetailPage() {
  const params = useParams()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchStudent()
    }
  }, [params.id])

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data.student)
      }
    } catch (error) {
      console.error("Failed to fetch student:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "INACTIVE": return "bg-gray-100 text-gray-800"
      case "SUSPENDED": return "bg-red-100 text-red-800"
      case "GRADUATED": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getAttendanceBadgeColor = (status: string) => {
    switch (status) {
      case "PRESENT": return "bg-green-100 text-green-800"
      case "ABSENT": return "bg-red-100 text-red-800"
      case "LATE": return "bg-yellow-100 text-yellow-800"
      case "EXCUSED": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "OVERDUE": return "bg-red-100 text-red-800"
      case "CANCELLED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading student details...</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Student not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/trainer/students">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-gray-600">Student Profile</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/trainer/students/${student.id}/edit`}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Student Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-500" />
              </div>
            </div>
            <div className="text-center">
              <Badge className={getStatusBadgeColor(student.status)}>
                {student.status}
              </Badge>
              {student.beltLevel && (
                <p className="text-sm text-gray-600 mt-2">{student.beltLevel} Belt</p>
              )}
            </div>
            <div className="space-y-2">
              {student.email && (
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  {student.email}
                </div>
              )}
              {student.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  {student.phone}
                </div>
              )}
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                Joined {new Date(student.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Sessions</span>
              <span className="font-medium">{student.attendances.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Present</span>
              <span className="font-medium text-green-600">
                {student.attendances.filter(a => a.status === "PRESENT").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Absent</span>
              <span className="font-medium text-red-600">
                {student.attendances.filter(a => a.status === "ABSENT").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Payments</span>
              <span className="font-medium">{student.payments.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Paid Amount</span>
              <span className="font-medium">
                ${student.payments
                  .filter(p => p.status === "PAID")
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            {student.emergencyContact ? (
              <div className="space-y-2">
                <p className="font-medium">{student.emergencyContact.name}</p>
                <p className="text-sm text-gray-600">{student.emergencyContact.relationship}</p>
                <p className="text-sm">{student.emergencyContact.phone}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No emergency contact information</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList>
          <TabsTrigger value="attendance">Attendance History</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="details">Additional Details</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Recent session attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-in Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.attendances.map((attendance) => (
                    <TableRow key={attendance.id}>
                      <TableCell>{attendance.session.title}</TableCell>
                      <TableCell>
                        {new Date(attendance.session.startTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getAttendanceBadgeColor(attendance.status)}>
                          {attendance.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attendance.checkInTime
                          ? new Date(attendance.checkInTime).toLocaleTimeString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Payment records and outstanding balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.paymentType}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusBadgeColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.paidDate
                          ? new Date(payment.paidDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-sm text-gray-900">
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-sm text-gray-900">
                    {student.address || "Not provided"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-900">
                  {student.medicalInfo || "No medical information provided"}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}