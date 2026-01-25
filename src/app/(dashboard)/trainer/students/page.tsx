"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Eye, UserPlus } from "lucide-react"
import Link from "next/link"

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  status: string
  beltLevel: string | null
  createdAt: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    beltLevel: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    medicalInfo: "",
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStudent = async () => {
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          beltLevel: "",
          emergencyContact: {
            name: "",
            phone: "",
            relationship: "",
          },
          medicalInfo: "",
        })
        fetchStudents()
      }
    } catch (error) {
      console.error("Failed to create student:", error)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "ALL" || student.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "INACTIVE": return "bg-gray-100 text-gray-800"
      case "SUSPENDED": return "bg-red-100 text-red-800"
      case "GRADUATED": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const activeStudents = students.filter(s => s.status === "ACTIVE").length
  const totalStudents = students.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage your students and their information</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Register a new student in your training program.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="additional">Additional Info</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
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
              </TabsContent>
              <TabsContent value="additional" className="space-y-4">
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
                    rows={3}
                    value={formData.medicalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, medicalInfo: e.target.value }))}
                    placeholder="Any medical conditions, allergies, or special requirements"
                  />
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateStudent}>Create Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">New registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <CardDescription>
            Manage and view all your students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="GRADUATED">Graduated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">Loading students...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Belt Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.email || "—"}</TableCell>
                    <TableCell>{student.phone || "—"}</TableCell>
                    <TableCell>{student.beltLevel || "—"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(student.status)}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/trainer/students/${student.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/trainer/students/${student.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}