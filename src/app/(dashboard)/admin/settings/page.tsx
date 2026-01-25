"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { useSession } from "next-auth/react"

interface OrganizationSettings {
  id: string
  name: string
  settings: {
    timezone: string
    currency: string
    language: string
    businessHours: {
      start: string
      end: string
      days: string[]
    }
    contactInfo: {
      phone: string
      email: string
      address: string
    }
    branding: {
      primaryColor: string
      logoUrl: string
    }
  }
  notificationSettings: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    sessionReminders: boolean
    paymentReminders: boolean
    marketingEmails: boolean
  }
}

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<OrganizationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("organization")

  // Form state
  const [formData, setFormData] = useState({
    organization: {
      name: "",
      timezone: "UTC",
      currency: "USD",
      language: "en",
      businessHours: {
        start: "09:00",
        end: "17:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"]
      },
      contactInfo: {
        phone: "",
        email: "",
        address: ""
      },
      branding: {
        primaryColor: "#3b82f6",
        logoUrl: ""
      }
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      sessionReminders: true,
      paymentReminders: true,
      marketingEmails: false
    }
  })

  useEffect(() => {
    if (session?.user) {
      loadSettings()
    }
  }, [session])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        setFormData({
          organization: {
            name: data.settings.name || "",
            timezone: data.settings.settings?.timezone || "UTC",
            currency: data.settings.settings?.currency || "USD",
            language: data.settings.settings?.language || "en",
            businessHours: data.settings.settings?.businessHours || {
              start: "09:00",
              end: "17:00",
              days: ["monday", "tuesday", "wednesday", "thursday", "friday"]
            },
            contactInfo: data.settings.settings?.contactInfo || {
              phone: "",
              email: "",
              address: ""
            },
            branding: data.settings.settings?.branding || {
              primaryColor: "#3b82f6",
              logoUrl: ""
            }
          },
          notifications: data.settings.notificationSettings || {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            sessionReminders: true,
            paymentReminders: true,
            marketingEmails: false
          }
        })
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section: string) => {
    setSaving(true)
    try {
      const updateData = section === "organization"
        ? { settings: formData.organization }
        : { notificationSettings: formData.notifications }

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        alert("Settings saved successfully!")
        loadSettings()
      } else {
        alert("Failed to save settings")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      alert("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const updateBusinessDays = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      organization: {
        ...prev.organization,
        businessHours: {
          ...prev.organization.businessHours,
          days: checked
            ? [...prev.organization.businessHours.days, day]
            : prev.organization.businessHours.days.filter(d => d !== day)
        }
      }
    }))
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Manage your organization settings and preferences</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
        </TabsList>

        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={formData.organization.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    organization: { ...prev.organization, name: e.target.value }
                  }))}
                  placeholder="Enter organization name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.organization.timezone}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      organization: { ...prev.organization, timezone: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.organization.currency}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      organization: { ...prev.organization, currency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How customers can reach your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.organization.contactInfo.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    organization: {
                      ...prev.organization,
                      contactInfo: { ...prev.organization.contactInfo, email: e.target.value }
                    }
                  }))}
                  placeholder="contact@yourorganization.com"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.organization.contactInfo.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    organization: {
                      ...prev.organization,
                      contactInfo: { ...prev.organization.contactInfo, phone: e.target.value }
                    }
                  }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="contactAddress">Address</Label>
                <Textarea
                  id="contactAddress"
                  value={formData.organization.contactInfo.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    organization: {
                      ...prev.organization,
                      contactInfo: { ...prev.organization.contactInfo, address: e.target.value }
                    }
                  }))}
                  placeholder="123 Main St, City, State 12345"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>
                Set your organization's operating hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessStart">Opening Time</Label>
                  <Input
                    id="businessStart"
                    type="time"
                    value={formData.organization.businessHours.start}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      organization: {
                        ...prev.organization,
                        businessHours: { ...prev.organization.businessHours, start: e.target.value }
                      }
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="businessEnd">Closing Time</Label>
                  <Input
                    id="businessEnd"
                    type="time"
                    value={formData.organization.businessHours.end}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      organization: {
                        ...prev.organization,
                        businessHours: { ...prev.organization.businessHours, end: e.target.value }
                      }
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label>Operating Days</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { key: "monday", label: "Mon" },
                    { key: "tuesday", label: "Tue" },
                    { key: "wednesday", label: "Wed" },
                    { key: "thursday", label: "Thu" },
                    { key: "friday", label: "Fri" },
                    { key: "saturday", label: "Sat" },
                    { key: "sunday", label: "Sun" },
                  ].map((day) => (
                    <label key={day.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.organization.businessHours.days.includes(day.key)}
                        onChange={(e) => updateBusinessDays(day.key, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => handleSave("organization")} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Organization Settings"}
            </Button>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when your organization receives notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <Label>Email Notifications</Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={formData.notifications.emailNotifications}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailNotifications: checked }
                    }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <Label>SMS Notifications</Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Receive important alerts via SMS
                    </p>
                  </div>
                  <Switch
                    checked={formData.notifications.smsNotifications}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, smsNotifications: checked }
                    }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4" />
                      <Label>Push Notifications</Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Browser push notifications for important updates
                    </p>
                  </div>
                  <Switch
                    checked={formData.notifications.pushNotifications}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, pushNotifications: checked }
                    }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Reminders</Label>
                    <p className="text-sm text-gray-600">
                      Automatic reminders before scheduled sessions
                    </p>
                  </div>
                  <Switch
                    checked={formData.notifications.sessionReminders}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, sessionReminders: checked }
                    }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Reminders</Label>
                    <p className="text-sm text-gray-600">
                      Reminders for overdue payments and upcoming due dates
                    </p>
                  </div>
                  <Switch
                    checked={formData.notifications.paymentReminders}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, paymentReminders: checked }
                    }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-600">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <Switch
                    checked={formData.notifications.marketingEmails}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, marketingEmails: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => handleSave("notifications")} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Notification Settings"}
            </Button>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage security preferences and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Security Features</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Advanced security settings are managed through your account preferences.
                      Contact support for additional security configurations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Session Management</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    All user sessions are automatically secured with industry-standard encryption.
                  </p>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Data Encryption</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    All sensitive data is encrypted at rest and in transit.
                  </p>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Enhanced security for admin accounts.
                  </p>
                  <Badge className="bg-yellow-100 text-yellow-800">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Palette className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Branding Features</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Advanced branding customization is available in Professional and Enterprise plans.
                      Upgrade to unlock custom colors, logos, and branding options.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <input
                      id="primaryColor"
                      type="color"
                      value={formData.organization.branding.primaryColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        organization: {
                          ...prev.organization,
                          branding: { ...prev.organization.branding, primaryColor: e.target.value }
                        }
                      }))}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.organization.branding.primaryColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        organization: {
                          ...prev.organization,
                          branding: { ...prev.organization.branding, primaryColor: e.target.value }
                        }
                      }))}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={formData.organization.branding.logoUrl}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      organization: {
                        ...prev.organization,
                        branding: { ...prev.organization.branding, logoUrl: e.target.value }
                      }
                    }))}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Logo customization is available in Professional and Enterprise plans.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => handleSave("organization")} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Branding Settings"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}