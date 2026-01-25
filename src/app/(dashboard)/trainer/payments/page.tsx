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
import { Plus, Search, CreditCard, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, Receipt } from "lucide-react"
import { format } from "date-fns"
import { StripePaymentForm } from "@/components/payments/StripePaymentForm"
import { FeatureGate } from "@/components/license/FeatureGate"

interface Payment {
  id: string
  amount: number
  paymentType: string
  status: string
  dueDate: string
  paidDate: string | null
  paymentMethod: string
  notes: string | null
  student: {
    id: string
    firstName: string
    lastName: string
    email: string | null
  }
  paymentPlan?: {
    name: string
    frequency: string
  }
}

interface PaymentPlan {
  id: string
  name: string
  amount: number
  frequency: string
  startDate: string
  endDate: string | null
  isActive: boolean
  student: {
    firstName: string
    lastName: string
  }
}

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [isCreatePaymentDialogOpen, setIsCreatePaymentDialogOpen] = useState(false)
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false)
  const [isStripePaymentDialogOpen, setIsStripePaymentDialogOpen] = useState(false)
  const [selectedPaymentForStripe, setSelectedPaymentForStripe] = useState<Payment | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string>("")

  const [paymentFormData, setPaymentFormData] = useState({
    studentId: "",
    amount: "",
    paymentType: "TUITION",
    dueDate: "",
    paymentMethod: "CASH",
    notes: "",
  })

  const [planFormData, setPlanFormData] = useState({
    studentId: "",
    name: "",
    amount: "",
    frequency: "MONTHLY",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchPayments()
    fetchPaymentPlans()
    fetchStudents()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments")
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentPlans = async () => {
    try {
      const response = await fetch("/api/payment-plans")
      if (response.ok) {
        const data = await response.json()
        setPaymentPlans(data.plans)
      }
    } catch (error) {
      console.error("Failed to fetch payment plans:", error)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students?active=true")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    }
  }

  const handleCreatePayment = async () => {
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paymentFormData,
          amount: parseFloat(paymentFormData.amount),
          dueDate: paymentFormData.dueDate ? new Date(paymentFormData.dueDate) : null,
        }),
      })

      if (response.ok) {
        setIsCreatePaymentDialogOpen(false)
        resetPaymentForm()
        fetchPayments()
      }
    } catch (error) {
      console.error("Failed to create payment:", error)
    }
  }

  const handleCreatePaymentPlan = async () => {
    try {
      const response = await fetch("/api/payment-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...planFormData,
          amount: parseFloat(planFormData.amount),
          startDate: new Date(planFormData.startDate),
          endDate: planFormData.endDate ? new Date(planFormData.endDate) : null,
        }),
      })

      if (response.ok) {
        setIsCreatePlanDialogOpen(false)
        resetPlanForm()
        fetchPaymentPlans()
      }
    } catch (error) {
      console.error("Failed to create payment plan:", error)
    }
  }

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "PAID",
          paidDate: new Date(),
        }),
      })

      if (response.ok) {
        fetchPayments()
      }
    } catch (error) {
      console.error("Failed to mark payment as paid:", error)
    }
  }

  const resetPaymentForm = () => {
    setPaymentFormData({
      studentId: "",
      amount: "",
      paymentType: "TUITION",
      dueDate: "",
      paymentMethod: "CASH",
      notes: "",
    })
  }

  const resetPlanForm = () => {
    setPlanFormData({
      studentId: "",
      name: "",
      amount: "",
      frequency: "MONTHLY",
      startDate: "",
      endDate: "",
    })
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "OVERDUE": return "bg-red-100 text-red-800"
      case "CANCELLED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "DAILY": return "bg-blue-100 text-blue-800"
      case "WEEKLY": return "bg-purple-100 text-purple-800"
      case "MONTHLY": return "bg-green-100 text-green-800"
      case "QUARTERLY": return "bg-orange-100 text-orange-800"
      case "YEARLY": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.student.email && payment.student.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "ALL" || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalRevenue = payments
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingPayments = payments.filter(p => p.status === "PENDING").length
  const overduePayments = payments.filter(p =>
    p.status === "PENDING" && new Date(p.dueDate) < new Date()
  ).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading payments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Track payments, manage plans, and monitor revenue</p>
        </div>
        <div className="flex space-x-2">
          <FeatureGate feature="paymentTracking">
            <Dialog open={isCreatePlanDialogOpen} onOpenChange={setIsCreatePlanDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  New Plan
                </Button>
              </DialogTrigger>
            <DialogContent
              className="max-w-md"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              }}
            >
              <DialogHeader>
                <DialogTitle>Create Payment Plan</DialogTitle>
                <DialogDescription>
                  Set up a recurring payment plan for a student.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plan-student">Student</Label>
                  <Select value={planFormData.studentId} onValueChange={(value) => setPlanFormData(prev => ({ ...prev, studentId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    value={planFormData.name}
                    onChange={(e) => setPlanFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Monthly Training Fee"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plan-amount">Amount ($)</Label>
                    <Input
                      id="plan-amount"
                      type="number"
                      step="0.01"
                      value={planFormData.amount}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-frequency">Frequency</Label>
                    <Select value={planFormData.frequency} onValueChange={(value) => setPlanFormData(prev => ({ ...prev, frequency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plan-start">Start Date</Label>
                    <Input
                      id="plan-start"
                      type="date"
                      value={planFormData.startDate}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-end">End Date (Optional)</Label>
                    <Input
                      id="plan-end"
                      type="date"
                      value={planFormData.endDate}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatePlanDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePaymentPlan}>Create Plan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </FeatureGate>

          <Dialog open={isCreatePaymentDialogOpen} onOpenChange={setIsCreatePaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-md"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              }}
            >
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  Add a new payment record for a student.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment-student">Student</Label>
                  <Select value={paymentFormData.studentId} onValueChange={(value) => setPaymentFormData(prev => ({ ...prev, studentId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment-amount">Amount ($)</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      step="0.01"
                      value={paymentFormData.amount}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-type">Type</Label>
                    <Select value={paymentFormData.paymentType} onValueChange={(value) => setPaymentFormData(prev => ({ ...prev, paymentType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TUITION">Tuition</SelectItem>
                        <SelectItem value="PRIVATE_LESSON">Private Lesson</SelectItem>
                        <SelectItem value="SEMINAR">Seminar</SelectItem>
                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                        <SelectItem value="MEMBERSHIP">Membership</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select value={paymentFormData.paymentMethod} onValueChange={(value) => setPaymentFormData(prev => ({ ...prev, paymentMethod: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="CHECK">Check</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment-due">Due Date</Label>
                    <Input
                      id="payment-due"
                      type="date"
                      value={paymentFormData.dueDate}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="payment-notes">Notes</Label>
                  <Input
                    id="payment-notes"
                    value={paymentFormData.notes}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatePaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePayment}>Record Payment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overduePayments}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentPlans.filter(p => p.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Recurring payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="plans">Payment Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>
                Track all payments and manage outstanding balances.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
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
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.student.firstName} {payment.student.lastName}
                          </div>
                          {payment.student.email && (
                            <div className="text-sm text-gray-600">{payment.student.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{payment.paymentType}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {payment.dueDate ? format(new Date(payment.dueDate), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.paidDate ? format(new Date(payment.paidDate), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === "PENDING" && (
                          <div className="flex space-x-1">
                            <FeatureGate feature="stripePayments">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPaymentForStripe(payment)
                                  setIsStripePaymentDialogOpen(true)
                                }}
                              >
                                <CreditCard className="w-4 h-4 mr-1" />
                                Pay Online
                              </Button>
                            </FeatureGate>
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(payment.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Paid
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Payment Plans</CardTitle>
              <CardDescription>
                Manage recurring payment plans for students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        {plan.student.firstName} {plan.student.lastName}
                      </TableCell>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell>${plan.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getFrequencyColor(plan.frequency)}>
                          {plan.frequency}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(plan.startDate), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        {plan.endDate ? format(new Date(plan.endDate), "MMM dd, yyyy") : "Ongoing"}
                      </TableCell>
                      <TableCell>
                        <Badge className={plan.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {plan.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stripe Payment Dialog */}
      <Dialog open={isStripePaymentDialogOpen} onOpenChange={setIsStripePaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Online</DialogTitle>
            <DialogDescription>
              Complete your payment securely using Stripe
            </DialogDescription>
          </DialogHeader>
          {selectedPaymentForStripe && (
            <StripePaymentForm
              paymentId={selectedPaymentForStripe.id}
              amount={selectedPaymentForStripe.amount}
              onSuccess={() => {
                setIsStripePaymentDialogOpen(false)
                setSelectedPaymentForStripe(null)
                fetchPayments()
              }}
              onCancel={() => {
                setIsStripePaymentDialogOpen(false)
                setSelectedPaymentForStripe(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}