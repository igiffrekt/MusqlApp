"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  dateOfBirth: string | null
  address: string | null
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  } | null
  medicalInfo: string | null
  beltLevel: string | null
  status: string
}

export default function EditStudentPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    beltLevel: "",
    status: "ACTIVE",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    medicalInfo: "",
  })

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
        const studentData = data.student
        setStudent(studentData)

        // Pre-populate form with existing data
        setFormData({
          firstName: studentData.firstName || "",
          lastName: studentData.lastName || "",
          email: studentData.email || "",
          phone: studentData.phone || "",
          dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth).toISOString().split('T')[0] : "",
          address: studentData.address || "",
          beltLevel: studentData.beltLevel || "",
          status: studentData.status || "ACTIVE",
          emergencyContact: studentData.emergencyContact ? {
            name: studentData.emergencyContact.name || "",
            phone: studentData.emergencyContact.phone || "",
            relationship: studentData.emergencyContact.relationship || "",
          } : {
            name: "",
            phone: "",
            relationship: "",
          },
          medicalInfo: studentData.medicalInfo || "",
        })
      }
    } catch (error) {
      console.error("Failed to fetch student:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || null,
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        address: formData.address || null,
        beltLevel: formData.beltLevel || null,
        status: formData.status,
        emergencyContact: (formData.emergencyContact.name || formData.emergencyContact.phone || formData.emergencyContact.relationship)
          ? formData.emergencyContact
          : null,
        medicalInfo: formData.medicalInfo || null,
      }

      const response = await fetch(`/api/students/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        router.push(`/trainer/students/${params.id}`)
      } else {
        console.error("Failed to update student")
      }
    } catch (error) {
      console.error("Failed to update student:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading student information...</p>
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
            <Link href={`/students/${params.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Student
            </h1>
            <p className="text-gray-600">Update {student.firstName} {student.lastName}'s information</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>
            Update the student's profile information below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="personal">Personal Details</TabsTrigger>
                <TabsTrigger value="additional">Additional Info</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="beltLevel">Belt Level</Label>
                    <Select value={formData.beltLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, beltLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select belt level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WHITE">White Belt</SelectItem>
                        <SelectItem value="YELLOW">Yellow Belt</SelectItem>
                        <SelectItem value="ORANGE">Orange Belt</SelectItem>
                        <SelectItem value="GREEN">Green Belt</SelectItem>
                        <SelectItem value="BLUE">Blue Belt</SelectItem>
                        <SelectItem value="PURPLE">Purple Belt</SelectItem>
                        <SelectItem value="BROWN">Brown Belt</SelectItem>
                        <SelectItem value="BLACK">Black Belt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="GRADUATED">Graduated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="personal" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <textarea
                    id="address"
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter full address"
                  />
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-4 mt-6">
                <div>
                  <Label>Emergency Contact</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <Input
                      placeholder="Contact Name"
                      value={formData.emergencyContact.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Contact Phone"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="medicalInfo">Medical Information</Label>
                  <textarea
                    id="medicalInfo"
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                    rows={4}
                    value={formData.medicalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, medicalInfo: e.target.value }))}
                    placeholder="Any medical conditions, allergies, or special requirements"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="outline" asChild>
                <Link href={`/trainer/students/${params.id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}