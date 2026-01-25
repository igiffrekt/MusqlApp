"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TouchButton } from "@/components/ui/touch-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  DollarSign,
  User,
  Calendar,
  Receipt,
  Smartphone,
  Banknote,
  Building2,
  Check,
  Wifi,
  WifiOff
} from "lucide-react"
import { cn } from "@/lib/utils"
import { savePaymentOffline, isOnline } from "@/lib/offlineStorage"
import { toast } from "sonner"

interface Student {
  id: string
  firstName: string
  lastName: string
  email?: string
}

interface PaymentFormData {
  studentId: string
  amount: number
  paymentType: string
  paymentMethod: string
  notes: string
}

interface MobilePaymentFormProps {
  students: Student[]
  onPaymentSubmit: (data: PaymentFormData) => Promise<void>
  onClose?: () => void
}

export function MobilePaymentForm({ students, onPaymentSubmit, onClose }: MobilePaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    studentId: '',
    amount: 0,
    paymentType: 'TUITION',
    paymentMethod: 'CASH',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quickAmounts] = useState([25, 50, 75, 100, 150, 200])

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleQuickAmount = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.studentId || !formData.amount) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const paymentData = {
        ...formData,
        amount: formData.amount
      }

      // Try online first
      if (isOnline()) {
        await onPaymentSubmit(paymentData)
        toast.success("Payment recorded successfully")
      } else {
        // Save offline
        const selectedStudent = students.find(s => s.id === formData.studentId)
        if (selectedStudent) {
          await savePaymentOffline(
            selectedStudent.id,
            paymentData.amount,
            paymentData.paymentType,
            paymentData.paymentMethod,
            paymentData.notes
          )
          toast.success("Payment saved offline", {
            description: "Will sync when back online"
          })
        }
      }

      // Reset form
      setFormData({
        studentId: '',
        amount: 0,
        paymentType: 'TUITION',
        paymentMethod: 'CASH',
        notes: ''
      })

      if (onClose) onClose()
    } catch (error) {
      console.error('Failed to submit payment:', error)
      toast.error("Failed to record payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedStudent = students.find(s => s.id === formData.studentId)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl">
            <Receipt className="w-6 h-6 mr-3" />
            Record Payment
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Quick and easy payment recording</p>
            <div className="flex items-center space-x-2">
              {isOnline() ? (
                <Badge className="bg-green-100 text-green-800">
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge className="bg-orange-100 text-orange-800">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <div className="space-y-2">
              <Label htmlFor="student" className="text-base font-medium">
                Select Student
              </Label>
              <Select
                value={formData.studentId}
                onValueChange={(value) => handleInputChange('studentId', value)}
              >
                <SelectTrigger className="h-14">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {student.firstName} {student.lastName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Quick Amounts</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <TouchButton
                    key={amount}
                    type="button"
                    variant={formData.amount === amount ? "default" : "outline"}
                    className="h-12 text-base font-medium"
                    onClick={() => handleQuickAmount(amount)}
                  >
                    ${amount}
                  </TouchButton>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base font-medium">
                Custom Amount
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="h-14 pl-12 text-lg"
                />
              </div>
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <Label htmlFor="paymentType" className="text-base font-medium">
                Payment Type
              </Label>
              <Select
                value={formData.paymentType}
                onValueChange={(value) => handleInputChange('paymentType', value)}
              >
                <SelectTrigger className="h-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TUITION">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Tuition
                    </div>
                  </SelectItem>
                  <SelectItem value="PRIVATE_LESSON">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Private Lesson
                    </div>
                  </SelectItem>
                  <SelectItem value="SEMINAR">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Seminar
                    </div>
                  </SelectItem>
                  <SelectItem value="EQUIPMENT">
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Equipment
                    </div>
                  </SelectItem>
                  <SelectItem value="OTHER">
                    <div className="flex items-center">
                      <Receipt className="w-4 h-4 mr-2" />
                      Other
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-base font-medium">
                Payment Method
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <TouchButton
                  type="button"
                  variant={formData.paymentMethod === 'CASH' ? 'default' : 'outline'}
                  className="h-14 flex-col"
                  onClick={() => handleInputChange('paymentMethod', 'CASH')}
                >
                  <Banknote className="w-6 h-6 mb-1" />
                  Cash
                </TouchButton>
                <TouchButton
                  type="button"
                  variant={formData.paymentMethod === 'CARD' ? 'default' : 'outline'}
                  className="h-14 flex-col"
                  onClick={() => handleInputChange('paymentMethod', 'CARD')}
                >
                  <CreditCard className="w-6 h-6 mb-1" />
                  Card
                </TouchButton>
                <TouchButton
                  type="button"
                  variant={formData.paymentMethod === 'BANK_TRANSFER' ? 'default' : 'outline'}
                  className="h-14 flex-col"
                  onClick={() => handleInputChange('paymentMethod', 'BANK_TRANSFER')}
                >
                  <Building2 className="w-6 h-6 mb-1" />
                  Bank
                </TouchButton>
                <TouchButton
                  type="button"
                  variant={formData.paymentMethod === 'STRIPE' ? 'default' : 'outline'}
                  className="h-14 flex-col"
                  onClick={() => handleInputChange('paymentMethod', 'STRIPE')}
                >
                  <Smartphone className="w-6 h-6 mb-1" />
                  Online
                </TouchButton>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this payment..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Submit Button */}
            <TouchButton
              type="submit"
              className="w-full h-14 text-lg font-semibold"
              disabled={isSubmitting || !formData.studentId || !formData.amount}
            >
              {isSubmitting ? (
                "Recording..."
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Record Payment
                </>
              )}
            </TouchButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}